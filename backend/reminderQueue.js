import { Queue } from "bullmq";

let reminderQueue;
let isInitialized = false;

export const initializeQueue = (redisClient) => {
  // Get the connection options from the redisClient
  const { host, port } = redisClient.options.socket;
  const { username, password } = redisClient.options;

  reminderQueue = new Queue("reminderQueue", {
    connection: {
      host,
      port,
      username,
      password,
    },
  });
  isInitialized = true;
  console.log("Reminder queue initialized");
};

export async function scheduleReminder({ userId, taskId }) {
  if (!isInitialized) {
    throw new Error("Queue not initialized. Call initializeQueue first.");
  }
  try {
    await reminderQueue.add(
      "sendReminder",
      { userId, taskId },
      { jobId: `${userId}:${taskId}` }
    );
    console.log(`Reminder job scheduled for user ${userId}, task ${taskId}`);
  } catch (error) {
    console.error("Failed to schedule reminder:", error);
    throw error;
  }
}

export { reminderQueue };
