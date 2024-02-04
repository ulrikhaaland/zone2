import OpenAI from "openai";
import { MessageCreateParams } from "openai/resources/beta/threads/messages/messages.mjs";
import { FitnessData, GuideStatus, fitnessDataToJson } from "../model/user";
import dotenv from "dotenv";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/pages/_app";
import { GuideItem, parseJsonToGuideItems } from "../model/guide";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Use server-side environment variable
});

const generateGuide = async (
  fitnessData: FitnessData,
  previousThread?: OpenAI.Beta.Threads.Thread
): Promise<string | undefined> => {
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

  async function getRunStatus(
    threadId: string,
    runId: string
  ): Promise<string | undefined> {
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
  }

  return await getRunStatus(thread.id, run.id);
};

export const handleOnGenerateGuide = async (
  fitnessData: FitnessData,
  uid: string
) => {
  const userRef = doc(db, "users", uid); // Create a reference to the user's document in Firestore

  try {
    const guide = await generateGuide(fitnessData);

    if (guide && guide.length > 0) {
      console.log("Guide generated successfully:");
      let guideItems: GuideItem[] = [];
      try {
        guideItems = parseJsonToGuideItems(guide);
      } catch (error) {
        console.error("Error parsing guide JSON:", error);
        updateDoc(userRef, {
          guideStatus: GuideStatus.ERROR,
          errorMessage: "Error parsing guide JSON",
        });
        return;
      }

      if (guideItems.length === 0) {
        updateDoc(userRef, {
          guideStatus: GuideStatus.ERROR,
        });
        return;
      }
      /// Todo Catch error and log message + retry
      updateDoc(userRef, {
        guideItems: guideItems,
        guideStatus: GuideStatus.LOADED,
      }).catch((error) => {
        console.error("Error updating user document:", error);
        updateDoc(userRef, {
          guideStatus: GuideStatus.ERROR,
          errorMessage: error.message,
        });
      });
    } else {
      updateDoc(userRef, {
        guideStatus: GuideStatus.ERROR,
        errorMessage: "Guide was empty or undefined",
      });
    }
  } catch (error) {
    console.error("Error generating guide:", error);
    updateDoc(userRef, {
      guideStatus: GuideStatus.ERROR,
    });
  }
};
