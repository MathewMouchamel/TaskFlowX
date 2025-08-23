import { Queue } from "bullmq";
import { client } from "./index.js";

const connection = redisClient.duplicate();

export const reminderQueue = new Queue("reminderQueue", { connection });

export async function scheduleReminder({ userId, taskId }) {
  await reminderQueue.add("sendReminder", { userId, taskId });
}
