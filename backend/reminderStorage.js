// Simple Redis storage for task reminders - no queues needed!

let redisClient;
let isInitialized = false;

export const initializeReminderStorage = (client) => {
  redisClient = client;
  isInitialized = true;
  console.log("Redis reminder storage initialized");
};

// Store a reminder directly in Redis
export async function storeReminder({
  userId,
  taskId,
  taskTitle,
  dueDate,
  priority,
}) {
  if (!isInitialized) {
    throw new Error(
      "Redis client not initialized. Call initializeReminderStorage first."
    );
  }

  try {
    const reminderKey = `reminder:${userId}:${taskId}`;
    const reminderData = {
      userId,
      taskId,
      taskTitle,
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
      createdAt: new Date().toISOString(),
    };

    await redisClient.setEx(
      reminderKey,
      86400 * 7,
      JSON.stringify(reminderData)
    ); // Expire after 7 days
    console.log(
      `Reminder stored for user ${userId}, task "${taskTitle || taskId}"`
    );
  } catch (error) {
    console.error("Failed to store reminder:", error);
    throw error;
  }
}

// Get all reminders for a user and display them
export async function showUserReminders(userId) {
  if (!isInitialized) {
    throw new Error(
      "Redis client not initialized. Call initializeReminderStorage first."
    );
  }

  try {
    console.log("🔍 Checking for active reminders...");

    // Get all reminder keys for this user
    const pattern = `reminder:${userId}:*`;
    const keys = await redisClient.keys(pattern);

    if (keys.length === 0) {
      console.log("✅ No active reminders found");
      return [];
    }

    console.log(`📋 Found ${keys.length} active reminder(s):`);
    console.log("=".repeat(60));

    const reminders = [];

    for (const key of keys) {
      try {
        const reminderJson = await redisClient.get(key);
        const reminder = JSON.parse(reminderJson);
        reminders.push(reminder);

        const { taskTitle, dueDate, priority, taskId } = reminder;

        // Format due date and calculate urgency
        let dueDateInfo = "No due date";
        let urgencyIcon = "📅";

        if (dueDate) {
          // Use UTC dates to avoid timezone issues
          const today = new Date();
          const due = new Date(dueDate);

          // Create UTC dates for comparison (year, month, day only)
          const todayDate = new Date(
            Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
          );
          const dueUTC = new Date(
            Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate())
          );

          const timeDiff = dueUTC.getTime() - todayDate.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          const dueDateStr = due.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
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
      } catch (parseError) {
        console.error(`Error parsing reminder ${key}:`, parseError);
      }
    }

    console.log("=".repeat(60));
    return reminders;
  } catch (error) {
    console.error("❌ Error retrieving reminders:", error);
    return [];
  }
}

// Remove a reminder when task is completed
export async function removeReminder(userId, taskId) {
  if (!isInitialized) {
    throw new Error(
      "Redis client not initialized. Call initializeReminderStorage first."
    );
  }

  try {
    const reminderKey = `reminder:${userId}:${taskId}`;
    const deleted = await redisClient.del(reminderKey);

    if (deleted) {
      console.log(`Reminder removed for task ${taskId}`);
    }

    return deleted > 0;
  } catch (error) {
    console.error("Failed to remove reminder:", error);
    throw error;
  }
}
