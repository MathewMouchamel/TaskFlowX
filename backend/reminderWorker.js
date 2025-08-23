import { Worker } from "bullmq";

export const initializeWorker = (redisClient) => {
  const { host, port } = redisClient.options.socket;
  const { username, password } = redisClient.options;
  const worker = new Worker(
    "reminderQueue",
    async (job) => {
      const { userId, taskId } = job.data;
      console.log(`Send reminder to user ${userId} for task ${taskId}`);
      // Add your notification logic here.
    },
    {
      connection: { host, port, username, password },
    }
  );

  worker.on("completed", (job) => {
    console.log(`Reminder job ${job.id} completed.`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Reminder job ${job.id} failed:`, err);
  });

  return worker;
};
