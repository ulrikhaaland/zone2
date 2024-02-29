// pages/api/check-status.js
import { BlogItem, parseJsonToGuideItems } from "@/app/model/guide";
import { GuideStatus } from "@/app/model/user";
import OpenAI from "openai";
import { handleOnGenerateGuide } from "./generate";
import * as admin from "firebase-admin";
import { Request, Response } from "express";

if (!admin.apps.length) {
  const admin = require("firebase-admin");

  let serviceAccount = require("../../zone2program-a24ce-3eff7214d07d.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req: Request, res: Response) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { threadId, runId, uid } = req.query as {
    threadId: string;
    runId: string;
    uid: string;
  };

  // Validate input
  if (!threadId || !runId) {
    return res.status(400).json({ error: "Missing threadId or runId" });
  }

  // Validate uid input
  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Example of checking the run's status - adjust based on actual API or logic
    const statusResponse = await client.beta.threads.runs.retrieve(
      threadId,
      runId
    );

    // Assuming statusResponse contains the status and optionally results
    if (statusResponse.status === "completed") {
      const userRef = db.collection("users").doc(uid);

      // Example response handling - adjust according to your needs

      const messageList = await client.beta.threads.messages.list(threadId);
      const dataList = messageList.data;

      const content = dataList[0]
        .content[0] as OpenAI.Beta.Threads.Messages.MessageContentText;
      const guide = content.text.value;
      let guideItems: BlogItem[];
      try {
        guideItems = parseJsonToGuideItems(guide);
        guideItems[0].expanded = true;
        guideItems[1].expanded = true;
      } catch (error) {
        console.error("Error parsing guide JSON:", error);
        await logErrorToFirestore(uid, error);
        res.status(200).json({ status: "error" });

        throw new Error("Error parsing guide JSON");
      }

      if (guideItems.length === 0) {
        await logErrorToFirestore(uid, "No guide items generated from JSON");
        res.status(200).json({ status: "error" });

        throw new Error("No guide items generated from JSON");
      }

      await userRef.update({
        guideItems: guideItems,
        guideStatus: GuideStatus.LOADED,
        retries: 0,
        guideGenerationRunId: null,
        guideGenerationThreadId: null,
      });

      res.status(200).json({ status: "completed" });
    } else if (statusResponse.status === "in_progress") {
      // Respond with the current status if not completed
      res.status(200).json({ status: statusResponse.status });
    } else {
      // Respond with the error message if failed
      await logErrorToFirestore(uid, statusResponse);
      res.status(200).json({ status: "failed" });
    }
  } catch (error) {
    console.error("Error checking guide generation status:", error);
    res.status(500).json({ error: "Failed to check guide generation status" });
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
