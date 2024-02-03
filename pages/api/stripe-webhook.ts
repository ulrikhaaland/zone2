import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../_app";
import { GuideStatus } from "@/app/model/user";
import { questToFitnessData } from "@/app/model/questionaire";
import { handleOnGenerateGuide } from "@/app/utils/openAI";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // Ensure that sig is a string, as stripe.webhooks.constructEvent expects a string
    const sig = req.headers["stripe-signature"];
    console.log("sig", sig);
    // Check if sig is not undefined
    if (typeof sig !== "string") {
      return res
        .status(400)
        .send(`Webhook Error: Signature is missing or is not a string.`);
    }

    let event;

    try {
      const rawBody = await buffer(req);
      // Ensure rawBody is a string by calling toString(), since constructEvent expects a string
      event = stripe.webhooks.constructEvent(
        rawBody.toString(),
        sig,
        endpointSecret
      );
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customerId = paymentIntent.customer;
        const userId = paymentIntent.metadata.referenceId;

        console.log(paymentIntent);
        console.log(userId);

        if (typeof customerId === "string") {
          try {
            const response = await stripe.customers.retrieve(customerId);
            const customer = response as Stripe.Customer;

            if (!customer.deleted) {
              const userEmail = customer.email;
              console.log(`Email of customer: ${userEmail}`);
              // Use userEmail for your logic
            }
          } catch (err) {
            console.error("Error retrieving customer:", err);
          }
        }
        break;
      }
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const customerEmail = checkoutSession.customer_details?.email;
        const clientReferenceId = checkoutSession.client_reference_id;
        const paymentStatus = checkoutSession.payment_status;

        if (paymentStatus === "paid" && clientReferenceId) {
          const userRef = doc(db, "users", clientReferenceId); // Create a reference to the user's document in Firestore
          console.log("userRef" + userRef);
          await updateDoc(userRef, {
            hasPaid: true, // Update the document field
            guideStatus: GuideStatus.LOADING,
          });
          getDoc(userRef)
            .then((doc) => {
              if (doc.exists()) {
                const data = doc.data();

                if (data?.guideItems) {
                  updateDoc(userRef, {
                    previousGuideItems: data?.guideItems,
                    guideItems: [],
                  });
                }

                const fitnessData = questToFitnessData(data?.questions);
                handleOnGenerateGuide(fitnessData, clientReferenceId);
              } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
              }
            })
            .catch(async (error) => {
              await updateDoc(userRef, {
                guideStatus: GuideStatus.ERROR, // Update the document field
              });
            });

          console.log("User document updated with hasPaid = true");
          console.log("Payment completed");
          console.log(customerEmail);
          console.log(clientReferenceId);
        }
        break;
      }
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
