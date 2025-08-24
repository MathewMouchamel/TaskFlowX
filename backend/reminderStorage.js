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

// Get all reminders for a user (for API endpoint)
export async function getUserNotifications(userId) {
  if (!isInitialized) {
    throw new Error("Redis client not initialized. Call initializeReminderStorage first.");
  }
  
  try {
    const pattern = `reminder:${userId}:*`;
    const keys = await redisClient.keys(pattern);
    
    const notifications = [];
    
    for (const key of keys) {
      try {
        const reminderJson = await redisClient.get(key);
        const reminder = JSON.parse(reminderJson);
        
        const { taskTitle, dueDate, priority, taskId, createdAt } = reminder;
        
        // Calculate days until due and create message
        let daysUntilDue = null;
        let message = "Task reminder";
        
        if (dueDate) {
          const today = new Date();
          const due = new Date(dueDate);
          const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
          
          const timeDiff = dueDateOnly.getTime() - todayDate.getTime();
          daysUntilDue = Math.round(timeDiff / (1000 * 3600 * 24));
          
          if (daysUntilDue < 0) {
            message = `Task is ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''} overdue!`;
          } else if (daysUntilDue === 0) {
            message = "Task is due today!";
          } else if (daysUntilDue === 1) {
            message = "Task is due tomorrow!";
          } else {
            message = `Task is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`;
          }
        }
        
        // Check if notification has been read
        const readKey = `notification_read:${userId}:${taskId}`;
        const isRead = await redisClient.exists(readKey);
        
        notifications.push({
          id: `${userId}:${taskId}`,
          taskId,
          taskTitle: taskTitle || taskId,
          message,
          priority: priority || 'medium',
          dueDate,
          daysUntilDue,
          createdAt: createdAt || new Date().toISOString(),
          read: isRead > 0
        });
        
      } catch (parseError) {
        console.error(`Error parsing reminder ${key}:`, parseError);
      }
    }
    
    // Sort by creation date (oldest first)
    notifications.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    return notifications;
    
  } catch (error) {
    console.error("❌ Error retrieving notifications:", error);
    return [];
  }
}

// Mark notifications as read
export async function markNotificationsAsRead(userId, notificationIds) {
  if (!isInitialized) {
    throw new Error("Redis client not initialized. Call initializeReminderStorage first.");
  }
  
  try {
    const promises = notificationIds.map(notificationId => {
      // Extract taskId from notification ID (format: userId:taskId)
      const taskId = notificationId.split(':')[1];
      const readKey = `notification_read:${userId}:${taskId}`;
      return redisClient.setEx(readKey, 86400 * 30, 'read'); // Expire after 30 days
    });
    
    await Promise.all(promises);
    console.log(`Marked ${notificationIds.length} notifications as read for user ${userId}`);
    
    return true;
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    throw error;
  }
}
