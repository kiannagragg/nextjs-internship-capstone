"use server"

import { requireAuth } from "@/lib/auth"
import { getActivityForUser, getActivityByProjectId } from "@/lib/db/queries/activity"

/**
 * Get activity logs for the current user.
 * If projectId is provided, returns only that project's activity.
 * Otherwise returns activity across all user's projects.
 */
export async function getActivityLogsAction(projectId?: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const activities = projectId
      ? await getActivityByProjectId(projectId, 100)
      : await getActivityForUser(userId, 100)

    return { success: true, data: activities }
  } catch (error) {
    return { success: false, error: "Failed to load activity logs." }
  }
}
