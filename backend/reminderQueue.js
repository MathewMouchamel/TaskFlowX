import { Queue } from "bullmq";
import { client } from "./index.js";

const connection = redisClient.duplicate();

export const reminderQueue = new Queue("reminderQueue", { connection });
