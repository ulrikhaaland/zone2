import OpenAI from "openai";
import { GuideStatus, fitnessDataToJson } from "../../app/model/user";
import * as admin from "firebase-admin";
import { Request, Response } from "express";
import { GuideItem, appendGuideItem, jsonToGuideItem } from "@/app/model/guide";

export const maxDuration = 600;

if (!admin.apps.length) {
  const admin = require("firebase-admin");
  const pk = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  console.log(pk);
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "zone2program-a24ce",
      private_key_id: "3eff7214d07d4cde7091b9740b83d2e0d5e88bcb",
      private_key: pk,
      client_email: "zone2program@zone2program-a24ce.iam.gserviceaccount.com",
      client_id: "114782319148971071520",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/zone2program%40zone2program-a24ce.iam.gserviceaccount.com",
    }),
  });
}

const db = admin.firestore();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { fitnessData, uid } = req.body;
  if (!fitnessData || !uid) {
    await logErrorToFirestore(uid, "Missing fitnessData or uid");
    return res.status(400).json({ error: "Missing fitnessData or uid" });
  }

  try {
    const thread = await client.beta.threads.create();
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: fitnessDataToJson(fitnessData),
    });

    const runStream = client.beta.threads.runs.stream(thread.id, {
      assistant_id: "asst_P04Kgk0OWercjCtYJtNzUV8G",
    });

    let currentBuffer = "";

    const readableStream = runStream.toReadableStream();
    const reader = readableStream.getReader();

    const guideItems: GuideItem[] = [];

    const processStream = async () => {
      const { value, done } = await reader.read();
      if (done) {
        // Handle any remaining data
        if (currentBuffer.trim()) {
          currentBuffer = trimBufferOnDone(currentBuffer);

          try {
            const guideItem = jsonToGuideItem(currentBuffer);
            appendGuideItem(guideItems, guideItem);
          } catch (error) {
            logErrorToFirestore(uid, error);
          }
        }

        console.log("Final state of buffer:", currentBuffer);

        const userRef = db.collection("users").doc(uid);
        await userRef.update({
          guideItems: guideItems,
          guideStatus: GuideStatus.LOADED,
          hasReviewed: false,
        });
        return;
      }

      let textData;
      try {
        textData = JSON.parse(new TextDecoder().decode(value));
      } catch (error) {
        console.error("Error decoding JSON:", error);
        if (value === undefined) {
          return;
        }
      }

      if (textData !== undefined)
        if (textData.event === "thread.message.delta") {
          textData.data.delta.content.forEach((content: any) => {
            if (content.type === "text") {
              currentBuffer += content.text.value;
            }
          });
        }

      if (currentBuffer.includes("},") || currentBuffer.trim().endsWith("}]")) {
        currentBuffer = trimBuffer(currentBuffer);

        const guideItem = jsonToGuideItem(currentBuffer, guideItems);
        appendGuideItem(guideItems, guideItem);
        currentBuffer = ""; // Reset buffer after processing
      }
      updateFirebase(uid, guideItems, GuideStatus.LOADING);
      await processStream();
    };

    // Send a response to the client to indicate that the guide generation has been initiated
    res.status(202).json({
      success: true,
      message: "Guide generation initiated",
    });

    processStream();

    runStream.on("error", async (error) => {
      console.error("Streaming error:", error);
      await logErrorToFirestore(uid, error);
      res.status(500).json({
        success: false,
        error: "Failed during guide generation due to streaming error",
      });
    });
  } catch (error) {
    console.error("Error initiating guide generation:", error);
    await logErrorToFirestore(uid, error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate guide generation",
    });
  }
}

function updateFirebase(
  uid: string,
  guideItems: GuideItem[],
  guideStatus: GuideStatus
) {
  const userRef = db.collection("users").doc(uid);
  userRef.update({
    guideItems: guideItems,
    guideStatus: guideStatus,
  });
}

function trimBuffer(buffer: string): string {
  let currentBuffer = buffer;
  if (currentBuffer.trim().endsWith("}]")) {
    let lastIndex = currentBuffer.lastIndexOf("}");
    if (lastIndex !== -1) {
      // Cut the string to end at the last found closing brace of the JSON object
      currentBuffer = currentBuffer.substring(0, lastIndex + 1);
      console.log("Processed JSON content:", currentBuffer);
    }
  }
  // slice string for first item
  if (currentBuffer.includes("guideItems")) {
    const indexOfSecondBrace = currentBuffer.indexOf(
      "{",
      currentBuffer.indexOf("{") + 1
    );

    // Slice the string from the second '{'
    currentBuffer = currentBuffer.slice(indexOfSecondBrace);
  }
  // Remove trailing comma
  const trimmedBuffer = currentBuffer.trim();
  if (trimmedBuffer[trimmedBuffer.length - 1] === ",") {
    currentBuffer = trimmedBuffer.slice(0, -1);
    console.log(currentBuffer);
  }
  return currentBuffer;
}

function trimBufferOnDone(buffer: string): string {
  // Trim trailing whitespace
  let currentBuffer = buffer.trim();

  // Remove unwanted trailing characters
  // Strip out markdown code fences if present (assuming they might be included)
  currentBuffer = currentBuffer.replace(/```/g, "").trim();

  // First, strip any trailing ']' or '}' that might have been incorrectly added.
  if (currentBuffer.endsWith("]}")) {
    currentBuffer = currentBuffer.substring(0, currentBuffer.length - 2);
  } else if (currentBuffer.endsWith("]")) {
    currentBuffer = currentBuffer.substring(0, currentBuffer.length - 1);
  } else if (currentBuffer.endsWith("}")) {
    currentBuffer = currentBuffer.substring(0, currentBuffer.length - 1);
  }

  // Additional check for stray characters after structured JSON cleanup
  if (currentBuffer.includes("]")) {
    currentBuffer = currentBuffer.replace("]", "");
  }

  // Ensure to remove any additional '}' found after cleanup
  while (currentBuffer.endsWith("}")) {
    currentBuffer = currentBuffer.substring(0, currentBuffer.length - 1);
  }

  // remove everything after the last closing brace
  const indexOfLastChar = currentBuffer.indexOf("}");
  if (indexOfLastChar !== -1) {
    currentBuffer = currentBuffer.substring(0, indexOfLastChar + 1);
  }
  return currentBuffer;
}

async function logErrorToFirestore(uid: string, error: unknown) {
  const errorMessage = error instanceof Error ? error.message : error;
  console.log("Logging error to Firestore:", errorMessage);
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
