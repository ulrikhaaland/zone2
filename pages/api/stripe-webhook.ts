import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import * as admin from "firebase-admin";
import { GuideStatus } from "@/app/model/user";
import { questToFitnessData } from "@/app/model/questionaire";

export const maxDuration = 300; // This function can run for a maximum of 5 seconds

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
        guideStatus: GuideStatus.HASPAID,
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

        return;
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

export const config = {
  api: {
    bodyParser: false,
  },
};
