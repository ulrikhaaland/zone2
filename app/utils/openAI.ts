import OpenAI from "openai";
import { MessageCreateParams } from "openai/resources/beta/threads/messages/messages.mjs";
import { FitnessData, GuideStatus, fitnessDataToJson } from "../model/user";
import dotenv from "dotenv";
import { FirestoreError, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/pages/_app";
import { GuideItem, parseJsonToGuideItems } from "../model/guide";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Use server-side environment variable
});

async function logErrorToFirestore(uid: string, error: unknown) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorRef = doc(db, "errors", uid); // Assuming you have an "errors" collection
  await updateDoc(errorRef, {
    timestamp: new Date(),
    error: errorMessage, // Customize with any relevant error details
  }).catch(async (error: unknown) => {
    // create firestore doc
    await setDoc(errorRef, {
      timestamp: new Date(),
      error: errorMessage,
    });

    const message =
      error instanceof Error ? error.message : "Failed to log error";
    console.error(message); // Simple error handling for the logger itself
  });
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
  uid: string
) => {
  const userRef = doc(db, "users", uid); // Reference to the user's document in Firestore

  try {
    const guide = await generateGuide(fitnessData);

    if (!guide || guide.length === 0) {
      throw new Error("Guide was empty or undefined");
    }

    console.log("Guide generated successfully:");

    let guideItems: GuideItem[];
    try {
      guideItems = parseJsonToGuideItems(guide);
    } catch (error) {
      await logErrorToFirestore(uid, error); // Log parsing errors
      throw new Error("Error parsing guide JSON");
    }

    if (guideItems.length === 0) {
      throw new Error("No guide items generated from JSON");
    }

    await updateDoc(userRef, {
      guideItems: guideItems,
      guideStatus: GuideStatus.LOADED,
    }).catch(async (error) => {
      await logErrorToFirestore(uid, error); // Log update errors
      throw new Error("Error updating user document");
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(errorMessage); // Log the error to the console or an external logging service
    await logErrorToFirestore(uid, error); // Log to Firestore

    // Update Firestore with the error status, with a type guard for Firestore-specific errors
    await updateDoc(userRef, {
      guideStatus: GuideStatus.ERROR,
      errorMessage: errorMessage,
    }).catch((error: unknown) => {
      const firestoreErrorMessage =
        error instanceof FirestoreError
          ? error.message
          : "Failed to update Firestore with error status";
      console.error(firestoreErrorMessage);
    });
  }
};
