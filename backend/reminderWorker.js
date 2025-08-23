import { Worker } from "bullmq";

export const initializeWorker = (redisClient) => {
  const { host, port } = redisClient.options.socket;
  const { username, password } = redisClient.options;
  console.log("Worker initializing...");
  
  const worker = new Worker(
    "reminderQueue",
    async (job) => {
      console.log(`Processing job ${job.id} with data:`, job.data);
      const { userId, taskId } = job.data;
      console.log(`Send reminder to user ${userId} for task ${taskId}`);
      // Add your notification logic here.
      return { success: true, processed: true };
    },
    {
      connection: { host, port, username, password },
    }
  );

  worker.on("ready", () => {
    console.log("Worker is ready and waiting for jobs");
  });

  worker.on("completed", (job) => {
    console.log(`Reminder job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Reminder job ${job.id} failed:`, err);
  });

  worker.on("error", (err) => {
    console.error("Worker error:", err);
  });

  return worker;
};
