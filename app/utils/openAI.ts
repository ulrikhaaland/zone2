import OpenAI from "openai";
import { MessageCreateParams } from "openai/resources/beta/threads/messages/messages.mjs";
import { FitnessData, fitnessDataToJson } from "../model/user";
import { RequestOptions } from "openai/core.mjs";

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const generateGuide = async (
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

  const requestOptions: RequestOptions = {
    headers: {
      Accept: "application/json",
    },
    // ... include other options if necessary
  };

  const run = await client.beta.threads.runs.create(
    thread.id,
    {
      assistant_id: "asst_P04Kgk0OWercjCtYJtNzUV8G",
    },
    requestOptions
  );

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
