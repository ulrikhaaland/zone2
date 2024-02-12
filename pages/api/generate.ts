import OpenAI from "openai";
import { MessageCreateParams } from "openai/resources/beta/threads/messages/messages.mjs";
import {
  FitnessData,
  GuideStatus,
  fitnessDataToJson,
} from "../../app/model/user";
import dotenv from "dotenv";
import * as admin from "firebase-admin";
import { GuideItem, parseJsonToGuideItems } from "../../app/model/guide";
import { Request, Response } from "express";

dotenv.config();

// Initialize the Firebase Admin SDK and Stripe
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      process.env.GOOGLE_APPLICATION_CREDENTIALS!
    ),
    // Other initialization options if necessary
  });
}

const db = admin.firestore();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: Request, res: Response) {
  if (req.method === "POST") {
    // Extract fitnessData and other necessary parameters from the request body
    const { fitnessData, uid } = req.body;

    try {
      // Your logic for generating guide
      const guide = await handleOnGenerateGuide(fitnessData, uid); // Implement this function based on your needs
      // Process and return the generated guide
      res.status(200).json({ success: true, guide });
    } catch (error) {
      console.error("Error generating guide:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to generate guide" });
    }
  } else {
    // Handle any requests that aren't POST
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function logErrorToFirestore(uid: string, error: unknown) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorRef = db.collection("errors").doc(uid);
  // update user doc

  try {
    const userRef = db.collection("users").doc(uid);
    await userRef.update({
      guideStatus: GuideStatus.ERROR,
    });
    await errorRef.set(
      {
        timestamp: new Date(),
        error: errorMessage,
      },
      { merge: true }
    ); // Use set with merge to update or create the document
  } catch (error) {
    console.error("Failed to log error to Firestore:", error);
  }
}

const generateGuide = async (
  fitnessData: FitnessData,
  previousThread?: OpenAI.Beta.Threads.Thread
): Promise<string | undefined> => {
  try {
    const thread = previousThread ?? (await client.beta.threads.create());

    console.log("generating guide...");

    const message: MessageCreateParams = {
      role: "user",
      content: fitnessDataToJson(fitnessData),
    };

    await client.beta.threads.messages.create(thread.id, message);

    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: "asst_P04Kgk0OWercjCtYJtNzUV8G",
    });

    const getRunStatus = async (
      threadId: string,
      runId: string
    ): Promise<string | undefined> => {
      let status;
      do {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        status = await client.beta.threads.runs.retrieve(threadId, runId);
      } while (status.status !== "completed");

      const messageList = await client.beta.threads.messages.list(threadId);
      const dataList = messageList.data;

      const content = dataList[0]
        .content[0] as OpenAI.Beta.Threads.Messages.MessageContentText;
      return content.text.value;
    };

    return await getRunStatus(thread.id, run.id);
  } catch (error: any) {
    // Handle errors that occur during the guide generation process
    throw new Error(`Guide generation failed: ${error.message}`);
  }
};

export const handleOnGenerateGuide = async (
  fitnessData: FitnessData,
  uid: string,
  tries: number = 0
): Promise<any> => {
  const userRef = db.collection("users").doc(uid);

  try {
    const guide = await generateGuide(fitnessData);
    if (!guide || guide.length === 0) {
      throw new Error("Guide was empty or undefined");
    }

    console.log("Guide generated successfully:");
    let guideItems: GuideItem[];
    try {
      guideItems = parseJsonToGuideItems(guide);
      guideItems[0].expanded = true;
      guideItems[1].expanded = true;
    } catch (error) {
      console.error("Error parsing guide JSON:", error);
      if (tries < 2) {
        console.log("Retrying guide generation..." + "tries: " + tries);
        return await handleOnGenerateGuide(fitnessData, uid, tries + 1);
      }
      await logErrorToFirestore(uid, error);
      throw new Error("Error parsing guide JSON");
    }

    if (guideItems.length === 0) {
      throw new Error("No guide items generated from JSON");
    }

    await userRef.update({
      guideItems: guideItems,
      guideStatus: GuideStatus.LOADED,
      retries: 0,
    });
  } catch (error) {
    console.error("Error in handleOnGenerateGuide:", error);
    await logErrorToFirestore(uid, error);

    // Attempt to update the Firestore document with error information
    try {
      await userRef.update({
        guideStatus: GuideStatus.ERROR,
        errorMessage:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } catch (updateError) {
      console.error(
        "Failed to update Firestore with error status:",
        updateError
      );
    }
  }
};