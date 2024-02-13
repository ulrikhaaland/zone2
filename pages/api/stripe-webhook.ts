import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import * as admin from "firebase-admin";
import { GuideStatus } from "@/app/model/user";
import { questToFitnessData } from "@/app/model/questionaire";
import { handleOnGenerateGuide } from "@/pages/api/generate";

// Initialize the Firebase Admin SDK directly with credentials from environment variables
if (!admin.apps.length) {
  const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG_JSON!); // Ensure this variable is set in your environment
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    // Other initialization options if necessary
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

      if (doc.exists) {
        const data = doc.data();

        if (data?.guideItems) {
          await userRef.update({
            previousGuideItems: data.guideItems,
            guideItems: [],
          });
        }

        const fitnessData = questToFitnessData(data?.questions);
        handleOnGenerateGuide(fitnessData, clientReferenceId);
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
