"use server"

/* ============================================
   Member Management Server Actions

   Handles role changes, member removal, and
   member data fetching for the team page.
   Uses centralized permissions from lib/permissions.ts.
   ============================================ */

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { requirePermission } from "@/lib/permissions"
import {
  getProjectMembers,
  getProjectMemberCounts,
  updateMemberRole,
  removeMember,
  getMemberProjects,
  getMemberProfile,
  getSharedProjects,
} from "@/lib/db/queries/members"
import { getUserProjectRole } from "@/lib/db/queries/projects"
import { updateRoleSchema, removeMemberSchema } from "@/lib/validations/member"

/* ==================== READ ==================== */

/**
 * Get all members of a project with user details.
 * Any project member can view the member list.
 */
export async function getProjectMembersAction(projectId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const { error: permError } = await requirePermission(projectId, userId, "member", "view")
    if (permError) return { success: false, error: permError }

    const members = await getProjectMembers(projectId)

    return { success: true, data: members }
  } catch (error) {
    return { success: false, error: "Failed to load team members." }
  }
}

/**
 * Get member count stats for a project.
 * Any project member can view stats.
 */
export async function getProjectMemberCountsAction(projectId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const { error: permError } = await requirePermission(projectId, userId, "member", "view")
    if (permError) return { success: false, error: permError }

    const counts = await getProjectMemberCounts(projectId)

    return { success: true, data: counts }
  } catch (error) {
    return { success: false, error: "Failed to load member counts." }
  }
}

/**
 * Get all projects the current user belongs to.
 * Used for the project dropdown on the team page.
 */
export async function getMemberProjectsAction() {
  try {
    const { dbUserId: userId } = await requireAuth()

    const memberProjects = await getMemberProjects(userId)

    return { success: true, data: memberProjects }
  } catch (error) {
    return { success: false, error: "Failed to load projects." }
  }
}

/**
 * Get a member's detailed profile within a project.
 * Any project member can view another member's profile.
 */
export async function getMemberProfileAction(projectId: string, targetUserId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const { error: permError } = await requirePermission(projectId, userId, "member", "view")
    if (permError) return { success: false, error: permError }

    const profile = await getMemberProfile(projectId, targetUserId)
    if (!profile) return { success: false, error: "Member not found in this project." }

    // Get shared projects between current user and target
    const shared = await getSharedProjects(userId, targetUserId)

    return { success: true, data: { ...profile, sharedProjects: shared } }
  } catch (error) {
    return { success: false, error: "Failed to load member profile." }
  }
}

/* ==================== MUTATIONS ==================== */

/**
 * Update a member's role. Admin-only.
 * Enforces max 2 admins and prevents demoting the last admin.
 */
export async function updateMemberRoleAction(projectId: string, formData: FormData) {
  try {
    const { dbUserId: userId } = await requireAuth()

    // 1. Permission check
    const { error: permError } = await requirePermission(projectId, userId, "member", "change_role")
    if (permError) return { success: false, error: permError }

    // 2. Validate input
    const rawData = Object.fromEntries(formData.entries())
    const parsed = updateRoleSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    const { targetUserId, newRole } = parsed.data

    // 3. Cannot change your own role
    if (targetUserId === userId) {
      return { success: false, error: "You cannot change your own role." }
    }

    // 4. Execute role change (includes admin cap + last-admin checks)
    const result = await updateMemberRole(projectId, targetUserId, newRole, userId)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // 5. Revalidate
    revalidatePath(`/projects/${projectId}`, "layout")
    revalidatePath("/team", "layout")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update member role." }
  }
}

/**
 * Remove a member from a project. Admin-only.
 * Cannot remove the last admin.
 */
export async function removeMemberAction(projectId: string, formData: FormData) {
  try {
    const { dbUserId: userId } = await requireAuth()

    // 1. Permission check
    const { error: permError } = await requirePermission(projectId, userId, "member", "remove")
    if (permError) return { success: false, error: permError }

    // 2. Validate input
    const rawData = Object.fromEntries(formData.entries())
    const parsed = removeMemberSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    const { targetUserId } = parsed.data

    // 3. Cannot remove yourself (use leaveProjectAction instead)
    if (targetUserId === userId) {
      return { success: false, error: "You cannot remove yourself. Use 'Leave Project' instead." }
    }

    // 4. Execute removal (includes last-admin check + notification + activity log)
    const result = await removeMember(projectId, targetUserId, userId)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // 5. Revalidate
    revalidatePath(`/projects/${projectId}`, "layout")
    revalidatePath("/team", "layout")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to remove member." }
  }
}

/**
 * Leave a project voluntarily.
 * Available to contributors and viewers.
 * Admins cannot leave — they must transfer admin role first.
 */
export async function leaveProjectAction(projectId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    // 1. Check the user is actually a member
    const role = await getUserProjectRole(projectId, userId)
    if (!role) {
      return { success: false, error: "You are not a member of this project." }
    }

    // 2. Admins cannot leave without transferring role first
    if (role === "admin") {
      return {
        success: false,
        error: "Admins cannot leave a project. Transfer your admin role to another member first.",
      }
    }

    // 3. Execute removal (self-removal, so removedByUserId is the same)
    const result = await removeMember(projectId, userId, userId)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // 4. Revalidate
    revalidatePath("/projects", "layout")
    revalidatePath("/team", "layout")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to leave project." }
  }
}
