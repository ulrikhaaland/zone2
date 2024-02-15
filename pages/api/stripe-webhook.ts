import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import * as admin from "firebase-admin";
import { GuideStatus } from "@/app/model/user";
import { questToFitnessData } from "@/app/model/questionaire";
import OpenAI from "openai";
import { MessageCreateParams } from "openai/resources/beta/threads/messages/messages.mjs";
import { FitnessData, fitnessDataToJson } from "../../app/model/user";
import { GuideItem, parseJsonToGuideItems } from "../../app/model/guide";

export const maxDuration = 300; // This function can run for a maximum of 5 seconds

if (!admin.apps.length) {
  const admin = require("firebase-admin");

  let serviceAccount = require("../../zone2program-a24ce-3eff7214d07d.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const sig = req.headers["stripe-signature"];
    if (typeof sig !== "string") {
      return res
        .status(400)
        .send("Webhook Error: Signature is missing or is not a string.");
    }

    try {
      const rawBody = await buffer(req);
      const event = stripe.webhooks.constructEvent(
        rawBody.toString(),
        sig,
        endpointSecret
      );
      // Process the event
      await processStripeEvent(event);
      res.json({ received: true });
    } catch (err: unknown) {
      handleError(err, res, "general");
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

async function processStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event);

      break;
    // Handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
      console.log(`Unhandled event type ${event.type}`);
  }
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const clientReferenceId = session.client_reference_id;
  const paymentStatus = session.payment_status;

  if (paymentStatus === "paid" && clientReferenceId) {
    try {
      // Process the successful payment
      console.log(`Payment for ${clientReferenceId} succeeded!`);
      const userRef = db.collection("users").doc(clientReferenceId);
      await userRef.update({
        hasPaid: true,
        guideStatus: GuideStatus.LOADING,
      });
      console.log("User document updated with hasPaid = true");

      const doc = await userRef.get();

      //TODO: handle in client
      if (doc.exists) {
        const data = doc.data();

        if (data?.guideItems) {
          await userRef.update({
            previousGuideItems: data.guideItems,
            guideItems: [],
          });
        }

        const fitnessData = questToFitnessData(data?.questions);

        handleOnGenerateGuide(fitnessData, clientReferenceId, 0, userRef);
      }
    } catch (error) {
      await updateUserWithPaymentError(clientReferenceId);
      throw error; // Rethrow to catch in the general error handler
    }
  }
}

async function updateUserWithPaymentError(userId: string) {
  try {
    const userRef = db.collection("users").doc(userId);
    await userRef.update({
      paymentError: true,
      guideStatus: GuideStatus.ERROR,
    });
    console.log(`Updated user ${userId} with paymentError: true`);
  } catch (error) {
    console.error(`Failed to update user ${userId} with payment error:`, error);
  }
}

function handleError(err: unknown, res: NextApiResponse, context: string) {
  let errorMessage = "An unknown error occurred";
  if (err instanceof Error) {
    errorMessage = err.message;
  }
  console.error(`${context} Error: ${errorMessage}`);
  res.status(400).send(`Webhook Error: ${errorMessage}`);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

const generateGuide = async (
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
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
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
  } catch (error: any) {
    console.error("Error generating guide:", error);
    // Handle errors that occur during the guide generation process
    throw new Error(`Guide generation failed: ${error.message}`);
  }
};

const handleOnGenerateGuide = async (
  fitnessData: FitnessData,
  uid: string,
  tries: number = 0,
  ref?: admin.firestore.DocumentReference<
    admin.firestore.DocumentData,
    admin.firestore.DocumentData
  >
): Promise<any> => {
  const userRef = ref ?? db.collection("users").doc(uid);

  console.log("RUNNING......" + "path:" + userRef.path + "uid:" + uid);

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

export const config = {
  api: {
    bodyParser: false,
  },
};
