"use server"

/* ============================================
   Invitation Server Actions

   All invitation-related mutations.
   Uses centralized permissions from lib/permissions.ts.
   ============================================ */

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { requirePermission } from "@/lib/permissions"
import { getUserByEmail } from "@/lib/db/queries/users"
import {
  createInvitation,
  createBulkInvitations,
  getInvitationById,
  getExistingPendingInvitation,
  getPendingInvitationsByProject,
  getPendingInvitationsByEmail,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
  resendInvitation,
  expireStaleInvitations,
} from "@/lib/db/queries/invitations"
import {
  inviteMemberSchema,
  respondInvitationSchema,
  bulkInviteSchema,
} from "@/lib/validations/invitation"

/* ==================== INVITE ==================== */

/**
 * Invite a single member to a project.
 * Admin-only. Validates the email exists and no duplicate pending invite.
 */
export async function inviteMemberAction(projectId: string, formData: FormData) {
  try {
    const { dbUserId: userId, email: currentUserEmail } = await requireAuth()

    // 1. Permission check
    const { error: permError } = await requirePermission(projectId, userId, "member", "invite")
    if (permError) return { success: false, error: permError }

    // 2. Validate input
    const rawData = Object.fromEntries(formData.entries())
    const parsed = inviteMemberSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    const { email, role } = parsed.data

    // 3. Can't invite yourself
    if (email === currentUserEmail) {
      return { success: false, error: "You cannot invite yourself." }
    }

    // 4. Check the invited user exists in the system
    const invitee = await getUserByEmail(email)
    if (!invitee) {
      return {
        success: false,
        error: "User not found. They must sign up first.",
      }
    }

    // 5. Check no duplicate pending invite
    const existing = await getExistingPendingInvitation(projectId, email)
    if (existing) {
      return {
        success: false,
        error: "This user already has a pending invitation for this project.",
      }
    }

    // 6. Create invitation (also creates notification + activity log)
    const invitation = await createInvitation(projectId, userId, email, role)

    // 7. Revalidate
    revalidatePath(`/projects/${projectId}`, "layout")
    revalidatePath("/team", "layout")

    return { success: true, invitationId: invitation.id }
  } catch (error) {
    return { success: false, error: "Failed to send invitation. Please try again." }
  }
}

/**
 * Invite multiple members at once (used during project creation).
 * Admin-only (creator is automatically admin).
 */
export async function inviteBulkAction(projectId: string, invitesJson: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    // 1. Permission check
    const { error: permError } = await requirePermission(projectId, userId, "member", "invite")
    if (permError) return { success: false, error: permError }

    // 2. Parse and validate
    let invites: unknown
    try {
      invites = JSON.parse(invitesJson)
    } catch {
      return { success: false, error: "Invalid invites data." }
    }

    const parsed = bulkInviteSchema.safeParse(invites)
    if (!parsed.success) {
      return { success: false, error: "Invalid invite data.", fieldErrors: parsed.error.flatten() }
    }

    // 3. Create invitations
    const results = await createBulkInvitations(projectId, userId, parsed.data)

    // 4. Revalidate
    revalidatePath(`/projects/${projectId}`, "layout")
    revalidatePath("/team", "layout")

    return { success: true, results }
  } catch (error) {
    return { success: false, error: "Failed to send invitations." }
  }
}

/* ==================== ACCEPT / DECLINE ==================== */

/**
 * Accept a project invitation.
 * The authenticated user must be the invitation recipient.
 */
export async function acceptInvitationAction(invitationId: string) {
  try {
    const { dbUserId: userId, email } = await requireAuth()

    // Validate input
    const parsed = respondInvitationSchema.safeParse({ invitationId })
    if (!parsed.success) {
      return { success: false, error: "Invalid invitation ID." }
    }

    // Run on-read expiry cleanup for this invitation
    await expireStaleInvitations()

    // Accept
    const result = await acceptInvitation(invitationId, userId, email)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Revalidate
    revalidatePath("/projects", "layout")
    revalidatePath("/team", "layout")
    revalidatePath(`/projects/${result.projectId}`, "layout")

    return { success: true, projectId: result.projectId }
  } catch (error) {
    return { success: false, error: "Failed to accept invitation." }
  }
}

/**
 * Decline a project invitation.
 * The authenticated user must be the invitation recipient.
 */
export async function declineInvitationAction(invitationId: string) {
  try {
    const { dbUserId: userId, email } = await requireAuth()

    const parsed = respondInvitationSchema.safeParse({ invitationId })
    if (!parsed.success) {
      return { success: false, error: "Invalid invitation ID." }
    }

    const result = await declineInvitation(invitationId, userId, email)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Revalidate
    revalidatePath("/team", "layout")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to decline invitation." }
  }
}

/* ==================== ADMIN: CANCEL / RESEND ==================== */

/**
 * Cancel a pending invitation. Admin-only.
 */
export async function cancelInvitationAction(projectId: string, invitationId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    // Permission check
    const { error: permError } = await requirePermission(projectId, userId, "member", "invite")
    if (permError) return { success: false, error: permError }

    const result = await cancelInvitation(invitationId)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath(`/projects/${projectId}`, "layout")
    revalidatePath("/team", "layout")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to cancel invitation." }
  }
}

/**
 * Resend an invitation. Admin-only.
 * Extends expiry if still pending, or creates a new one if declined/expired.
 */
export async function resendInvitationAction(projectId: string, invitationId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    // Permission check
    const { error: permError } = await requirePermission(projectId, userId, "member", "invite")
    if (permError) return { success: false, error: permError }

    const result = await resendInvitation(invitationId, userId)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath(`/projects/${projectId}`, "layout")
    revalidatePath("/team", "layout")

    return { success: true, action: result.action }
  } catch (error) {
    return { success: false, error: "Failed to resend invitation." }
  }
}

/* ==================== READ (for UI) ==================== */

/**
 * Get pending invitations for a project (team page).
 */
export async function getPendingInvitationsAction(projectId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    // Any member can see pending invites, but only admins can act on them
    const { error: permError } = await requirePermission(projectId, userId, "member", "view")
    if (permError) return { success: false, error: permError }

    // Run expiry cleanup before fetching
    await expireStaleInvitations()

    const invitations = await getPendingInvitationsByProject(projectId)

    return { success: true, data: invitations }
  } catch (error) {
    return { success: false, error: "Failed to load invitations." }
  }
}

/**
 * Get incoming invitations for the current user.
 */
export async function getMyInvitationsAction() {
  try {
    const { email } = await requireAuth()

    // Run expiry cleanup
    await expireStaleInvitations()

    const invitations = await getPendingInvitationsByEmail(email)

    return { success: true, data: invitations }
  } catch (error) {
    return { success: false, error: "Failed to load your invitations." }
  }
}
