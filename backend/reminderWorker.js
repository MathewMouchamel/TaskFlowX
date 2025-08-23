import { Worker } from "bullmq";

export const initializeWorker = (redisClient) => {
  const { host, port } = redisClient.options.socket;
  const { username, password } = redisClient.options;
  console.log("Worker initializing...");

  // In-memory storage for active reminders
  const activeReminders = new Map();

  // Function to check and notify about active reminders
  const checkActiveReminders = async () => {
    try {
      console.log("🔍 Checking for active reminders...");

      if (activeReminders.size === 0) {
        console.log("✅ No active reminders found");
        return;
      }

      console.log(`📋 Found ${activeReminders.size} active reminder(s):`);
      console.log("=".repeat(60));

      for (const [taskId, reminderData] of activeReminders.entries()) {
        const { taskTitle, dueDate, priority } = reminderData;

        // Format due date and calculate urgency
        let dueDateInfo = "No due date";
        let urgencyIcon = "📅";

        if (dueDate) {
          const today = new Date();
          const due = new Date(dueDate);
          const timeDiff = due.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          const dueDateStr = due.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

          if (daysDiff < 0) {
            urgencyIcon = "🚨";
            dueDateInfo = `${dueDateStr} (${Math.abs(daysDiff)} days overdue!)`;
          } else if (daysDiff === 0) {
            urgencyIcon = "⏰";
            dueDateInfo = `${dueDateStr} (Due TODAY!)`;
          } else if (daysDiff === 1) {
            urgencyIcon = "⚡";
            dueDateInfo = `${dueDateStr} (Due TOMORROW!)`;
          } else {
            urgencyIcon = "📅";
            dueDateInfo = `${dueDateStr} (Due in ${daysDiff} days)`;
          }
        }

        // Priority indicator
        const priorityIcon =
          {
            high: "🔴",
            medium: "🟡",
            low: "🟢",
          }[priority] || "⚪";

        console.log(
          `${urgencyIcon} "${
            taskTitle || taskId
          }" - ${priorityIcon} ${priority?.toUpperCase()} - ${dueDateInfo}`
        );
      }

      console.log("=".repeat(60));
    } catch (error) {
      console.error("❌ Error checking active reminders:", error);
    }
  };

  const worker = new Worker(
    "reminderQueue",
    async (job) => {
      console.log(`📬 Processing reminder job ${job.id}`);
      const { userId, taskId, taskTitle, dueDate, priority } = job.data;

      // Add to active reminders storage
      activeReminders.set(taskId, {
        userId,
        taskTitle,
        dueDate,
        priority,
        addedAt: new Date(),
      });

      console.log(`✅ Reminder for "${taskTitle || taskId}" is now active`);

      // Return success to complete the job
      return { success: true, taskId, activated: true };
    },
    {
      connection: { host, port, username, password },
    }
  );

  worker.on("ready", () => {
    console.log("Worker is ready and waiting for jobs");
  });

  worker.on("completed", (job, result) => {
    console.log(
      `Reminder job ${job.id} completed: ${result.taskId} is now active`
    );
  });

  worker.on("failed", (job, err) => {
    console.error(`Reminder job ${job.id} failed:`, err);
  });

  worker.on("error", (err) => {
    console.error("Worker error:", err);
  });

  // Export the check function so it can be called from index.js
  worker.checkActiveReminders = checkActiveReminders;
  worker.activeReminders = activeReminders;

  return worker;
};
