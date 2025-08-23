import { reminderQueue } from "./reminderQueue.js";

/**
 * Schedule a reminder for a given task.
 * @param {Object} params
 * @param {string} params.userId - The user ID to notify.
 * @param {string} params.taskId - The task ID.
 * @param {Date|string} params.remindAt - When the reminder should trigger.
 */

export async function scheduleReminder({ userId, taskId, remindAt }) {
  await reminderQueue.add("sendReminder", { userId, taskId });
}
