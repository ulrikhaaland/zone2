import OpenAI from "openai";
import {
  FitnessData,
  GuideStatus,
  fitnessDataToJson,
} from "../../app/model/user";
import * as admin from "firebase-admin";
import { Request, Response } from "express";
import { RunInfo } from "../profile";
import { MessageCreateParams } from "openai/resources/beta/threads/messages.mjs";
import { run } from "node:test";
import { AssistantStream } from "openai/lib/AssistantStream.mjs";
import { GuideItem, appendGuideItem, jsonToGuideItem } from "@/app/model/guide";

export const maxDuration = 600; // This function can run for a maximum of 5 seconds

if (!admin.apps.length) {
  const admin = require("firebase-admin");

  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "zone2program-a24ce",
      private_key_id: "3eff7214d07d4cde7091b9740b83d2e0d5e88bcb",
      private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
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

    const parentTitles = [
      "Introduction",
      "Zone 2 Benefits",
      "Effective Exercise Doses",
      "Methods for Determining Zone 2",
      "What To Think About During Zone 2",
      "Consistency",
      "Flexibility",
      "Realistic Goals & Expectations",
      "Recovery & Preventing Overtraining",
      "Weightlifting Considerations",
    ];

    let currentBuffer = "";

    const readableStream = runStream.toReadableStream();
    const reader = readableStream.getReader();

    const guideItems: GuideItem[] = [];

    const processStream = async () => {
      const { value, done } = await reader.read();
      if (done) {
        // Handle any remaining data
        if (currentBuffer.trim()) {
          // Trim trailing whitespace
          currentBuffer = currentBuffer.trim();

          // Remove unwanted trailing characters
          // First, strip any trailing ']' or '}' that might have been incorrectly added.
          if (currentBuffer.endsWith("]}")) {
            currentBuffer = currentBuffer.substring(
              0,
              currentBuffer.length - 2
            );
          } else if (currentBuffer.endsWith("]")) {
            currentBuffer = currentBuffer.substring(
              0,
              currentBuffer.length - 1
            );
          } else if (currentBuffer.endsWith("}")) {
            currentBuffer = currentBuffer.substring(
              0,
              currentBuffer.length - 1
            );
          }

          // Additional check for stray characters after structured JSON cleanup
          if (currentBuffer.includes("]")) {
            currentBuffer = currentBuffer.replace("]", "");
          }

          // Log the final state of the buffer before attempting to parse
          console.log("Final state of buffer:", currentBuffer);
          try {
            const guideItem = jsonToGuideItem(currentBuffer);
            appendGuideItem(guideItems, guideItem);
          } catch (error) {
            console.error("Failed to parse final JSON chunk:", error);
            console.error(
              "Remaining buffer content that caused error:",
              currentBuffer
            );
          }
        }
        console.log("Stream processing completed.");
        console.log("Final state of buffer:", currentBuffer);

        const userRef = db.collection("users").doc(uid);
        await userRef.update({
          guideItems: guideItems,
          guideStatus: GuideStatus.LOADED,
        });
        res.status(202).json({
          success: true,
          message: "Guide generation completed",
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

        const guideItem = jsonToGuideItem(currentBuffer, guideItems);
        appendGuideItem(guideItems, guideItem);
        currentBuffer = ""; // Reset buffer after processing
      }
      updateFirebase(uid, guideItems, GuideStatus.LOADING);
      await processStream();
    };

    processStream();

    runStream.on("error", (error) => {
      console.error("Streaming error:", error);
      res.status(500).json({
        success: false,
        error: "Failed during guide generation due to streaming error",
      });
    });
  } catch (error) {
    console.error("Error initiating guide generation:", error);
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


