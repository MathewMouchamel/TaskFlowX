import { reminderQueue } from "./reminderQueue.js";

/**
 * Schedule a reminder for a given task.
 * @param {Object} params
 * @param {string} params.userId - The user ID to notify.
 * @param {string} params.taskId - The task ID.
 * @param {Date|string} params.remindAt - When the reminder should trigger.
 */

export async function scheduleReminder({ userId, taskId, remindAt }) {
  const remindTime = new Date(remindAt).getTime();
  const now = Date.now();
  const delay = remindTime - now;

  // Only schedule if the reminder is in the future
  if (delay > 0) {
    await reminderQueue.add("sendReminder", { userId, taskId }, { delay });
  }
}
