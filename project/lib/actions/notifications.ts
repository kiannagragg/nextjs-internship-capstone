"use server"

/* ============================================
   Notification Server Actions

   Handles fetching, reading, and deleting
   notifications for the authenticated user.
   No RBAC needed — notifications are personal
   (each user can only access their own).
   ============================================ */

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/db/queries/notifications"

/* ==================== READ ==================== */

/**
 * Get notifications for the current user.
 * Supports pagination and unread-only filter.
 */
export async function getNotificationsAction(options?: {
  unreadOnly?: boolean
  limit?: number
  offset?: number
}) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const result = await getNotificationsByUser(userId, options)

    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: "Failed to load notifications." }
  }
}

/**
 * Get unread notification count for the bell badge.
 */
export async function getUnreadCountAction() {
  try {
    const { dbUserId: userId } = await requireAuth()

    const unreadCount = await getUnreadCount(userId)

    return { success: true, data: unreadCount }
  } catch (error) {
    return { success: false, error: "Failed to load unread count." }
  }
}

/* ==================== MUTATIONS ==================== */

/**
 * Mark a single notification as read.
 */
export async function markNotificationReadAction(notificationId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const result = await markAsRead(notificationId, userId)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath("/", "layout")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to mark notification as read." }
  }
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsReadAction() {
  try {
    const { dbUserId: userId } = await requireAuth()

    await markAllAsRead(userId)

    revalidatePath("/", "layout")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to mark all notifications as read." }
  }
}

/**
 * Delete a notification.
 */
export async function deleteNotificationAction(notificationId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const result = await deleteNotification(notificationId, userId)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath("/", "layout")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete notification." }
  }
}
