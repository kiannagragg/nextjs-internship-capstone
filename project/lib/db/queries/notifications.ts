/* ============================================
   Notification Queries

   Handles all DB operations for notifications:
   create (single + bulk), fetch (paginated),
   unread count, mark read, and delete.
   ============================================ */

import { eq, and, desc, count, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { notifications, type NewNotification } from "@/lib/db/schema"

/* ==================== CREATE ==================== */

/**
 * Create a single notification.
 */
export async function createNotification(data: NewNotification) {
  const [notification] = await db.insert(notifications).values(data).returning()
  return notification
}

/**
 * Create notifications for multiple recipients at once.
 * Used for events that affect several users (e.g., comment on a task
 * notifies the creator + all assignees).
 *
 * Skips empty arrays silently.
 */
export async function createBulkNotifications(items: NewNotification[]) {
  if (items.length === 0) return []

  return db.insert(notifications).values(items).returning()
}

/* ==================== READ ==================== */

/**
 * Get notifications for a user with pagination and optional unread filter.
 */
export async function getNotificationsByUser(
  userId: string,
  options?: {
    unreadOnly?: boolean
    limit?: number
    offset?: number
  }
) {
  const limit = options?.limit ?? 20
  const offset = options?.offset ?? 0
  const unreadOnly = options?.unreadOnly ?? false

  const where = unreadOnly
    ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    : eq(notifications.userId, userId)

  const items = await db.query.notifications.findMany({
    where,
    orderBy: [desc(notifications.createdAt)],
    limit,
    offset,
  })

  // Get total count for pagination
  const [countResult] = await db.select({ total: count() }).from(notifications).where(where)

  return {
    items,
    total: countResult?.total ?? 0,
    limit,
    offset,
  }
}

/**
 * Get unread notification count for a user.
 * Used for the bell icon badge.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))

  return result?.count ?? 0
}

/* ==================== UPDATE ==================== */

/**
 * Mark a single notification as read.
 * Verifies ownership — only the recipient can mark their notification.
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const [updated] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning({ id: notifications.id })

  if (!updated) {
    return { success: false, error: "Notification not found." }
  }

  return { success: true }
}

/**
 * Mark all unread notifications as read for a user.
 */
export async function markAllAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
}

/* ==================== DELETE ==================== */

/**
 * Delete a single notification.
 * Verifies ownership — only the recipient can delete their notification.
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const [deleted] = await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning({ id: notifications.id })

  if (!deleted) {
    return { success: false, error: "Notification not found." }
  }

  return { success: true }
}
