import OpenAI from "openai";
import { MessageCreateParams } from "openai/resources/beta/threads/messages/messages.mjs";
import {
  FitnessData,
  GuideStatus,
  fitnessDataToJson,
} from "../../app/model/user";
import * as admin from "firebase-admin";
import { Request, Response } from "express";
import { RunInfo } from "../profile";

export const maxDuration = 600; // This function can run for a maximum of 5 seconds

if (!admin.apps.length) {
  const admin = require("firebase-admin");

  let serviceAccount = require("../../zone2program-a24ce-3eff7214d07d.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: Request, res: Response) {
  if (req.method === "POST") {
    const { fitnessData, uid, key } = req.body;

    if (!fitnessData || !uid) {
      return res.status(400).json({ error: "Missing fitnessData or uid" });
    }

    try {
      // Initiate guide generation and get the thread and run IDs
      const runInfo = await handleOnGenerateGuide(fitnessData, uid);

      // Respond with success and indicate that the guide generation is in progress
      res.status(202).json({
        success: true,
        runInfo: runInfo,
        message: "Guide generation initiated",
      });
    } catch (error) {
      console.error("Error initiating guide generation:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to initiate guide generation" });
    }
  } else {
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
      errorMessage: errorMessage,
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

const createThreadWithRetries = async (
  client: OpenAI,
  retries = 3,
  delay = 10000
): Promise<any> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Creating thread...`);
      return await client.beta.threads.create();
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Attempt ${attempt} failed, error: ${error.message}`);
      } else {
        console.log(`Attempt ${attempt} failed, error: ${error}`);
      }
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
};

const initiateGuideGeneration = async (
  fitnessData: FitnessData
): Promise<{ threadId: string; runId: string }> => {
  console.log(
    "Creating thread....... API Key present:",
    !!process.env.OPENAI_API_KEY
  );

  const thread = await client.beta.threads.create();
  console.log("Thread created successfully", thread);

  const message: MessageCreateParams = {
    role: "user",
    content: fitnessDataToJson(fitnessData),
  };

  await client.beta.threads.messages.create(thread.id, message);

  const run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: "asst_P04Kgk0OWercjCtYJtNzUV8G",
  });

  console.log(
    "Guide generation initiated. Thread ID:",
    thread.id,
    "Run ID:",
    run.id
  );

  // Return the thread and run IDs to the caller
  return { threadId: thread.id, runId: run.id };
};

export const handleOnGenerateGuide = async (
  fitnessData: FitnessData,
  uid: string
): Promise<RunInfo> => {
  const userRef = db.collection("users").doc(uid);

  console.log("RUNNING......" + "path:" + userRef.path + "uid:" + uid);

  try {
    const { threadId, runId } = await initiateGuideGeneration(fitnessData);

    // Update the user document with the thread and run IDs
    userRef.update({
      guideGenerationThreadId: threadId,
      guideGenerationRunId: runId,
    });

    return { threadId, runId };

    // Respond immediately to the client that the guide generation has been initiated
    // This part would be handled by your Express handler, responding with success and the IDs
  } catch (error) {
    console.error("Error initiating guide generation:", error);
    await logErrorToFirestore(uid, error);
    throw error;
  }
};
