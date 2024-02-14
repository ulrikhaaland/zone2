import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {OpenAI} from "openai";
import {GuideItem, parseJsonToGuideItems} from "../../app/model/guide";
import {
  FitnessData,
  GuideStatus,
  fitnessDataToJson,
} from "../../app/model/user";
import serviceAccount from "../../zone2program-a24ce-3eff7214d07d.json";
// eslint-disable-next-line max-len
import {MessageCreateParams} from "openai/resources/beta/threads/messages/messages.mjs";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const openAIKey = functions.config().openai.key;
const client = new OpenAI({
  apiKey: openAIKey,
});

const db = admin.firestore();

// Example function adapted for Firebase Functions
export const generateGuide = onRequest(async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // Extract fitnessData and uid from the request body
  const {fitnessData, uid} = req.body;

  try {
    // Placeholder for your guide generation logic
    // You'll need to adapt your generateGuide function here
    const guide = await handleOnGenerateGuide(fitnessData, uid);
    // You may need to adapt your handleOnGenerateGuide function here

    // Send a successful response
    res.status(200).json({success: true, guide});
  } catch (error) {
    console.error("Error generating guide:", error);
    res.status(500).json({success: false, error: "Failed to generate guide"});
  }
});

/**
 * Logs an error to Firestore and updates the user's guide status to ERROR.
 *
 * @param {string} uid - The user's ID.
 * @param {unknown} error - The error to log.
 */
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
      {merge: true}
    ); // Use set with merge to update or create the document
  } catch (error) {
    console.error("Failed to log error to Firestore:", error);
  }
}

const handleGenerateGuide = async (
  fitnessData: FitnessData
): Promise<string | undefined> => {
  try {
    console.log(
      "Creating thread....... API Key present:",
      !!process.env.OPENAI_API_KEY
    );

    let thread;
    try {
      thread = await client.beta.threads.create();
      console.log("Thread created successfully", thread);
    } catch (error) {
      console.error("Failed to create thread:", error);
      throw error; // Re-throw the error or handle it appropriately
    }

    console.log("generating guide........");
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        status = await client.beta.threads.runs.retrieve(threadId, runId);
        console.log("Run status:", status.status);
      } while (status.status !== "completed");

      const messageList = await client.beta.threads.messages.list(threadId);
      const dataList = messageList.data;

      const content = dataList[0]
        .content[0] as OpenAI.Beta.Threads.Messages.MessageContentText;
      return content.text.value;
    };

    return await getRunStatus(thread.id, run.id);
  } catch (error: unknown) {
    console.error("Error generating guide:", error);
    // Handle errors that occur during the guide generation process
    if (error instanceof Error) {
      throw new Error(`Guide generation failed: ${error.message}`);
    } else {
      throw new Error(`Guide generation failed: ${String(error)}`);
    }
  }
};

export const handleOnGenerateGuide = async (
  fitnessData: FitnessData,
  uid: string,
  tries = 0
) => {
  const userRef = db.collection("users").doc(uid);

  console.log("RUNNING......" + "path:" + userRef.path + "uid:" + uid);

  try {
    const guide = await handleGenerateGuide(fitnessData);
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
