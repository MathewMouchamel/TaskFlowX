import { Worker } from "bullmq";
import { reminderQueue } from "./reminderQueue.js";

// Define job processor
const reminderWorker = new Worker("reminderQueue", async (job) => {
  // job.data contains userId and taskId
  const { userId, taskId } = job.data;

  // TODO: Replace with  real notification logic
  console.log(`Send reminder to user ${userId} for task ${taskId}`);
  // send a WebSocket notification...
});

reminderWorker.on("completed", (job) => {
  console.log(`Reminder job ${job.id} completed.`);
});

reminderWorker.on("failed", (job, err) => {
  console.error(`Reminder job ${job.id} failed:`, err);
});
