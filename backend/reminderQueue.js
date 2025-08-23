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

export async function scheduleReminder({
  userId,
  taskId,
  taskTitle,
  dueDate,
  priority,
}) {
  if (!isInitialized) {
    throw new Error("Queue not initialized. Call initializeQueue first.");
  }
  try {
    // Add jobs immediately so they become active and stay active
    await reminderQueue.add(
      "sendReminder",
      { userId, taskId, taskTitle, dueDate, priority },
      {
        jobId: `${userId}:${taskId}`,
        removeOnComplete: false, // Keep completed jobs for inspection
        removeOnFail: false, // Keep failed jobs for inspection
      }
    );
    console.log(
      `Reminder job scheduled for user ${userId}, task "${
        taskTitle || taskId
      }" (will become active immediately)`
    );
  } catch (error) {
    console.error("Failed to schedule reminder:", error);
    throw error;
  }
}

export { reminderQueue };
