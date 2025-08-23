import { Worker } from "bullmq";
import { reminderQueue } from "./reminderQueue.js"; // your queue setup file

// Define your job processor
const reminderWorker = new Worker("reminderQueue", async (job) => {
  // job.data contains userId and taskId
  const { userId, taskId } = job.data;

  // TODO: Replace with your real notification logic
  console.log(`Send reminder to user ${userId} for task ${taskId}`);
  // e.g. send a WebSocket notification, email, push notification, etc.
});

reminderWorker.on("completed", (job) => {
  console.log(`Reminder job ${job.id} completed.`);
});

reminderWorker.on("failed", (job, err) => {
  console.error(`Reminder job ${job.id} failed:`, err);
});
