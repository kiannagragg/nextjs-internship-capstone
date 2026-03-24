/* ============================================
   Member Management Queries

   Handles all DB operations for project members:
   listing, stats, role changes, removal, and
   per-member profile data.

   NOTE: Some member operations already exist in
   lib/db/queries/projects.ts (addProjectMember,
   removeProjectMember, changeProjectMemberRole).
   This file adds higher-level queries that those
   don't cover. Actions should import from both
   files as needed.
   ============================================ */

import { eq, and, count, sql, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  projectMembers,
  users,
  projects,
  tasks,
  taskAssignees,
  activityLogs,
  notifications,
} from "@/lib/db/schema"
import { isNotificationEnabled } from "./settings"

/* ==================== LIST MEMBERS ==================== */

/**
 * Get all members of a project with user details.
 * Used on the team page member list.
 */
export async function getProjectMembers(projectId: string) {
  return db.query.projectMembers.findMany({
    where: eq(projectMembers.projectId, projectId),
    with: {
      user: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true,
          role: true, // Professional role (Designer, Developer, etc.)
        },
      },
    },
    orderBy: [desc(projectMembers.joinedAt)],
  })
}

/**
 * Get member counts for a project (total + per-role).
 * Used for the team page stats cards.
 */
export async function getProjectMemberCounts(projectId: string) {
  const [totals] = await db
    .select({
      total: count(),
      admins: count(sql`CASE WHEN ${projectMembers.role} = 'admin' THEN 1 END`),
      contributors: count(sql`CASE WHEN ${projectMembers.role} = 'contributor' THEN 1 END`),
      viewers: count(sql`CASE WHEN ${projectMembers.role} = 'viewer' THEN 1 END`),
    })
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId))

  return {
    total: totals?.total ?? 0,
    admins: totals?.admins ?? 0,
    contributors: totals?.contributors ?? 0,
    viewers: totals?.viewers ?? 0,
  }
}

/* ==================== ROLE MANAGEMENT ==================== */

/**
 * Get the current admin count for a project.
 * Used to enforce the max 2 admins rule.
 */
export async function getAdminCount(projectId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.role, "admin")))

  return result?.count ?? 0
}

/**
 * Update a member's role with admin cap enforcement.
 * Returns an error string if the operation is invalid, or null on success.
 *
 * Business rules:
 * - Max 2 admins per project
 * - Cannot demote the last admin
 * - Creates a notification for the affected user
 * - Logs an activity entry
 */
export async function updateMemberRole(
  projectId: string,
  targetUserId: string,
  newRole: "admin" | "contributor" | "viewer",
  changedByUserId: string
): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Get current membership
  const [membership] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, targetUserId)))
    .limit(1)

  if (!membership) {
    return { success: false, error: "User is not a member of this project." }
  }

  const currentRole = membership.role

  if (currentRole === newRole) {
    return { success: false, error: `User is already a ${newRole}.` }
  }

  // 2. If promoting to admin, check the cap
  if (newRole === "admin") {
    const adminCount = await getAdminCount(projectId)
    if (adminCount >= 2) {
      return { success: false, error: "A project can have at most 2 admins." }
    }
  }

  // 3. If demoting from admin, check not the last admin
  if (currentRole === "admin" && newRole !== "admin") {
    const adminCount = await getAdminCount(projectId)
    if (adminCount <= 1) {
      return {
        success: false,
        error: "Cannot demote the last admin. Promote another member first.",
      }
    }
  }

  // 4. Update the role
  await db
    .update(projectMembers)
    .set({ role: newRole })
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, targetUserId)))

  // 5. Get project title for notification
  const [project] = await db
    .select({ title: projects.title })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  const projectTitle = project?.title ?? "a project"

  // 6. Notify the affected user
  const shouldNotifyRole = await isNotificationEnabled(targetUserId, "memberJoined")
  if (shouldNotifyRole) {
    await db.insert(notifications).values({
      userId: targetUserId,
      type: "project_updated",
      title: "Role Updated",
      message: `Your role in "${projectTitle}" has been changed from ${currentRole} to ${newRole}.`,
      actionUrl: `/projects/${projectId}`,
      metadata: { projectId, oldRole: currentRole, newRole },
    })
  }

  // 7. Log activity
  const [targetUser] = await db
    .select({ firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1)

  const targetName =
    [targetUser?.firstName, targetUser?.lastName].filter(Boolean).join(" ") || "A member"

  await db.insert(activityLogs).values({
    projectId,
    userId: changedByUserId,
    action: "role_changed",
    entityType: "member",
    entityId: targetUserId,
    metadata: { memberName: targetName, from: currentRole, to: newRole },
  })

  return { success: true }
}

/* ==================== REMOVE MEMBER ==================== */

/**
 * Remove a member from a project.
 * Validates that the last admin cannot be removed.
 * Does NOT remove task assignments — tasks retain the assignee reference.
 *
 * Creates a notification for the removed user and logs an activity entry.
 */
export async function removeMember(
  projectId: string,
  targetUserId: string,
  removedByUserId: string
): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Get current membership
  const [membership] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, targetUserId)))
    .limit(1)

  if (!membership) {
    return { success: false, error: "User is not a member of this project." }
  }

  // 2. If removing an admin, ensure they're not the last one
  if (membership.role === "admin") {
    const adminCount = await getAdminCount(projectId)
    if (adminCount <= 1) {
      return { success: false, error: "Cannot remove the last admin from a project." }
    }
  }

  // 3. Get project + member info for notification before deleting
  const [project] = await db
    .select({ title: projects.title })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  const [targetUser] = await db
    .select({ firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1)

  const projectTitle = project?.title ?? "a project"
  const targetName =
    [targetUser?.firstName, targetUser?.lastName].filter(Boolean).join(" ") || "A member"

  // 4. Delete the membership row
  await db
    .delete(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, targetUserId)))

  // 5. Notify the removed user
  const shouldNotifyRemoval = await isNotificationEnabled(targetUserId, "memberJoined")
  if (shouldNotifyRemoval) {
    await db.insert(notifications).values({
      userId: targetUserId,
      type: "project_updated",
      title: "Removed from Project",
      message: `You have been removed from "${projectTitle}".`,
      actionUrl: "/projects",
      metadata: { projectId },
    })
  }

  // 6. Log activity
  await db.insert(activityLogs).values({
    projectId,
    userId: removedByUserId,
    action: "removed",
    entityType: "member",
    entityId: targetUserId,
    metadata: { memberName: targetName, role: membership.role },
  })

  return { success: true }
}

/* ==================== MEMBER PROJECTS ==================== */

/**
 * Get all projects a user belongs to.
 * Used for the project dropdown on the team page.
 */
export async function getMemberProjects(userId: string) {
  const memberships = await db.query.projectMembers.findMany({
    where: eq(projectMembers.userId, userId),
    with: {
      project: {
        columns: {
          id: true,
          title: true,
          color: true,
          status: true,
          isArchived: true,
        },
      },
    },
  })

  return memberships
    .filter((m) => !m.project.isArchived)
    .map((m) => ({
      ...m.project,
      role: m.role,
      isPinned: m.isPinned,
    }))
}

/* ==================== MEMBER PROFILE ==================== */

/**
 * Get a member's detailed profile within a project.
 * Includes task stats (pending, completed, overdue) and shared projects.
 * Used for the member detail sheet.
 */
export async function getMemberProfile(projectId: string, targetUserId: string) {
  // 1. Get member info
  const member = await db.query.projectMembers.findFirst({
    where: and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, targetUserId)),
    with: {
      user: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true,
          role: true, // Professional role
        },
      },
    },
  })

  if (!member) return null

  // 2. Get task stats for this user in this project
  //    A task is "assigned to this user" if it appears in taskAssignees
  const assignedTaskIds = await db
    .select({ taskId: taskAssignees.taskId })
    .from(taskAssignees)
    .where(eq(taskAssignees.userId, targetUserId))

  const taskIds = assignedTaskIds.map((r) => r.taskId)

  let taskStats = { pending: 0, completed: 0, overdue: 0 }

  if (taskIds.length > 0) {
    const [stats] = await db
      .select({
        pending: count(
          sql`CASE WHEN ${tasks.isCompleted} = false AND ${tasks.projectId} = ${projectId} THEN 1 END`
        ),
        completed: count(
          sql`CASE WHEN ${tasks.isCompleted} = true AND ${tasks.projectId} = ${projectId} THEN 1 END`
        ),
        overdue: count(
          sql`CASE WHEN ${tasks.isCompleted} = false AND ${tasks.projectId} = ${projectId} AND ${tasks.dueDate} < now() THEN 1 END`
        ),
      })
      .from(tasks)
      .where(
        sql`${tasks.id} IN (${sql.join(
          taskIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )

    if (stats) {
      taskStats = {
        pending: stats.pending ?? 0,
        completed: stats.completed ?? 0,
        overdue: stats.overdue ?? 0,
      }
    }
  }

  // 3. Get shared projects (projects where both the viewer and target are members)
  //    We'll fetch this in the action layer since it requires the current user's ID

  // 4. Get recent activity for this user in this project
  const recentActivity = await db.query.activityLogs.findMany({
    where: and(eq(activityLogs.projectId, projectId), eq(activityLogs.userId, targetUserId)),
    orderBy: [desc(activityLogs.createdAt)],
    limit: 10,
  })

  return {
    ...member,
    taskStats,
    recentActivity,
  }
}

/**
 * Get shared projects between two users.
 * Used in the member detail sheet to show which projects
 * the current user and the viewed member both belong to.
 */
export async function getSharedProjects(userIdA: string, userIdB: string) {
  const result = await db
    .select({
      projectId: projectMembers.projectId,
      title: projects.title,
      color: projects.color,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(
      and(
        eq(projectMembers.userId, userIdA),
        eq(projects.isArchived, false),
        sql`${projectMembers.projectId} IN (
          SELECT ${projectMembers.projectId} FROM ${projectMembers}
          WHERE ${projectMembers.userId} = ${userIdB}
        )`
      )
    )

  return result
}
