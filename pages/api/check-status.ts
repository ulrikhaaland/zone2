// pages/api/check-status.js
import { GuideItem, parseJsonToGuideItems } from "@/app/model/guide";
import { GuideStatus } from "@/app/model/user";
import OpenAI from "openai";
import * as admin from "firebase-admin";
import { Request, Response } from "express";

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
    const statusResponse: OpenAI.Beta.Threads.Runs.Run =
      await client.beta.threads.runs.retrieve(threadId, runId);

    // Assuming statusResponse contains the status and optionally results
    if (statusResponse.status === "completed") {
      const userRef = db.collection("users").doc(uid);

      // Example response handling - adjust according to your needs

      const messageList = await client.beta.threads.messages.list(threadId);
      const dataList = messageList.data;

      const content = dataList[0]
        .content[0] as OpenAI.Beta.Threads.Messages.TextContentBlock;
      const guide = content.text.value;
      let guideItems: GuideItem[];
      try {
        console.log(guide);

        guideItems = parseJsonToGuideItems(guide);
        guideItems[0].expanded = true;
        guideItems[1].expanded = true;
      } catch (error) {
        console.log(guide);
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
      guideGenerationRunId: null,
      guideGenerationThreadId: null,
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
