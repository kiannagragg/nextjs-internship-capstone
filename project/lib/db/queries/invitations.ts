/* ============================================
   Invitation Queries
   
   Handles all DB operations for project
   invitations: create, fetch, accept, decline,
   cancel, resend, and expiry cleanup.
   ============================================ */

import { eq, and, count, desc, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  projectInvitations,
  projectMembers,
  activityLogs,
  notifications,
  projects,
  users,
} from "@/lib/db/schema"
import { getUserByEmail } from "./users"
import { isNotificationEnabled } from "./settings"

/* ==================== CREATE ==================== */

/**
 * Create a single project invitation.
 * Generates a unique token and sets 7-day expiry.
 * Also creates a notification for the invitee.
 *
 * Does NOT check permissions — caller (server action) must verify.
 */
export async function createInvitation(
  projectId: string,
  invitedByUserId: string,
  email: string,
  role: "contributor" | "viewer"
) {
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // 1. Insert invitation
  const [invitation] = await db
    .insert(projectInvitations)
    .values({
      projectId,
      invitedByUserId,
      email,
      role,
      token,
      expiresAt,
    })
    .returning()

  if (!invitation) {
    throw new Error("Failed to create invitation.")
  }

  // 2. Get project title for the notification message
  const [project] = await db
    .select({ title: projects.title })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  // 3. Get inviter name for the notification
  const [inviter] = await db
    .select({ firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(eq(users.id, invitedByUserId))
    .limit(1)

  const inviterName = [inviter?.firstName, inviter?.lastName].filter(Boolean).join(" ") || "Someone"
  const projectTitle = project?.title || "a project"

  // 4. Create notification for the invitee (if they exist in the system)
  const invitee = await getUserByEmail(email)
  if (invitee) {
    const shouldNotify = await isNotificationEnabled(invitee.id, "invitationReceived")
    if (shouldNotify) {
      await db.insert(notifications).values({
        userId: invitee.id,
        type: "invitation",
        title: "Project Invitation",
        message: `${inviterName} invited you to join "${projectTitle}" as a ${role}.`,
        actionUrl: `/invitations/${token}`,
        metadata: { projectId, role, token, invitedByUserId },
      })
    }
  }

  // 5. Log activity
  await db.insert(activityLogs).values({
    projectId,
    userId: invitedByUserId,
    action: "invited",
    entityType: "member",
    entityId: invitation.id,
    metadata: { email, role },
  })

  return invitation
}

/**
 * Create multiple invitations at once.
 * Used during project creation (create-project-modal).
 * Skips invites for emails that already have a pending invitation.
 */
export async function createBulkInvitations(
  projectId: string,
  invitedByUserId: string,
  invites: { email: string; role: "contributor" | "viewer" }[]
) {
  const results: { email: string; success: boolean; error?: string }[] = []

  for (const invite of invites) {
    // Check for existing pending invite
    const existing = await getExistingPendingInvitation(projectId, invite.email)
    if (existing) {
      results.push({
        email: invite.email,
        success: false,
        error: "Already has a pending invitation",
      })
      continue
    }

    // Check user exists
    const user = await getUserByEmail(invite.email)
    if (!user) {
      results.push({ email: invite.email, success: false, error: "User not found" })
      continue
    }

    // Check not already a member
    const isMember = await isProjectMember(projectId, user.id)
    if (isMember) {
      results.push({ email: invite.email, success: false, error: "Already a project member" })
      continue
    }

    await createInvitation(projectId, invitedByUserId, invite.email, invite.role)
    results.push({ email: invite.email, success: true })
  }

  return results
}

/* ==================== READ ==================== */

/**
 * Get an invitation by its unique token.
 * Includes project and inviter details for the accept/decline page.
 */
export async function getInvitationByToken(token: string) {
  const invitation = await db.query.projectInvitations.findFirst({
    where: eq(projectInvitations.token, token),
    with: {
      project: true,
      invitedBy: true,
    },
  })

  return invitation ?? null
}

/**
 * Get an invitation by its ID.
 */
export async function getInvitationById(invitationId: string) {
  const invitation = await db.query.projectInvitations.findFirst({
    where: eq(projectInvitations.id, invitationId),
    with: {
      project: true,
      invitedBy: true,
    },
  })

  return invitation ?? null
}

/**
 * Get all pending invitations for a project.
 * Used on the team page (Admin view).
 */
export async function getPendingInvitationsByProject(projectId: string) {
  return db.query.projectInvitations.findMany({
    where: and(
      eq(projectInvitations.projectId, projectId),
      eq(projectInvitations.status, "pending")
    ),
    with: {
      invitedBy: {
        columns: { id: true, firstName: true, lastName: true, imageUrl: true },
      },
    },
    orderBy: [desc(projectInvitations.createdAt)],
  })
}

/**
 * Get all pending invitations addressed to a specific user (by email).
 * Used for the notification bell / incoming invites list.
 */
export async function getPendingInvitationsByEmail(email: string) {
  return db.query.projectInvitations.findMany({
    where: and(eq(projectInvitations.email, email), eq(projectInvitations.status, "pending")),
    with: {
      project: {
        columns: { id: true, title: true, color: true },
      },
      invitedBy: {
        columns: { id: true, firstName: true, lastName: true, imageUrl: true },
      },
    },
    orderBy: [desc(projectInvitations.createdAt)],
  })
}

/**
 * Check if a user already has a pending invitation for a project.
 * Used to prevent duplicate invites.
 */
export async function getExistingPendingInvitation(projectId: string, email: string) {
  const invitation = await db.query.projectInvitations.findFirst({
    where: and(
      eq(projectInvitations.projectId, projectId),
      eq(projectInvitations.email, email),
      eq(projectInvitations.status, "pending")
    ),
  })

  return invitation ?? null
}

/**
 * Check if a user is already a member of a project.
 */
async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  const [result] = await db
    .select({ id: projectMembers.id })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .limit(1)

  return !!result
}

/* ==================== ACCEPT / DECLINE ==================== */

/**
 * Accept an invitation.
 * Updates invitation status and creates a project member row.
 *
 * Since neon-http doesn't support transactions, we order operations
 * so that the member row is created with onConflictDoNothing
 * (idempotent) and the invitation status is updated last.
 */
export async function acceptInvitation(invitationId: string, userId: string, userEmail: string) {
  // 1. Fetch and validate
  const invitation = await getInvitationById(invitationId)

  if (!invitation) {
    return { success: false as const, error: "Invitation not found." }
  }

  if (invitation.email !== userEmail) {
    return { success: false as const, error: "This invitation was sent to a different email." }
  }

  if (invitation.status !== "pending") {
    return { success: false as const, error: `Invitation has already been ${invitation.status}.` }
  }

  if (new Date() > invitation.expiresAt) {
    // Mark as expired while we're here
    await db
      .update(projectInvitations)
      .set({ status: "expired" })
      .where(eq(projectInvitations.id, invitationId))
    return { success: false as const, error: "This invitation has expired." }
  }

  // 2. Create member row (idempotent — won't fail if already exists)
  await db
    .insert(projectMembers)
    .values({
      projectId: invitation.projectId,
      userId,
      role: invitation.role,
    })
    .onConflictDoNothing()

  // 3. Update invitation status
  await db
    .update(projectInvitations)
    .set({ status: "accepted" })
    .where(eq(projectInvitations.id, invitationId))

  // 4. Log activity
  await db.insert(activityLogs).values({
    projectId: invitation.projectId,
    userId,
    action: "invited",
    entityType: "member",
    entityId: userId,
    metadata: { role: invitation.role, viaInvitation: true, accepted: true },
  })

  // 5. Notify the admin who sent the invite
  const [acceptingUser] = await db
    .select({ firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const accepterName =
    [acceptingUser?.firstName, acceptingUser?.lastName].filter(Boolean).join(" ") || "A user"

  const shouldNotifyAccept = await isNotificationEnabled(invitation.invitedByUserId, "memberJoined")
  if (shouldNotifyAccept) {
    await db.insert(notifications).values({
      userId: invitation.invitedByUserId,
      type: "invitation",
      title: "Invitation Accepted",
      message: `${accepterName} accepted your invitation to "${invitation.project.title}".`,
      actionUrl: `/projects/${invitation.projectId}`,
      metadata: { projectId: invitation.projectId, acceptedByUserId: userId },
    })
  }

  return { success: true as const, projectId: invitation.projectId }
}

/**
 * Decline an invitation.
 * Updates status and notifies the inviter.
 */
export async function declineInvitation(invitationId: string, userId: string, userEmail: string) {
  const invitation = await getInvitationById(invitationId)

  if (!invitation) {
    return { success: false as const, error: "Invitation not found." }
  }

  if (invitation.email !== userEmail) {
    return { success: false as const, error: "This invitation was sent to a different email." }
  }

  if (invitation.status !== "pending") {
    return { success: false as const, error: `Invitation has already been ${invitation.status}.` }
  }

  // 1. Update status
  await db
    .update(projectInvitations)
    .set({ status: "declined" })
    .where(eq(projectInvitations.id, invitationId))

  // 2. Notify inviter
  const [decliningUser] = await db
    .select({ firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const declinerName =
    [decliningUser?.firstName, decliningUser?.lastName].filter(Boolean).join(" ") || "A user"

  const shouldNotifyDecline = await isNotificationEnabled(
    invitation.invitedByUserId,
    "memberJoined"
  )
  if (shouldNotifyDecline) {
    await db.insert(notifications).values({
      userId: invitation.invitedByUserId,
      type: "invitation",
      title: "Invitation Declined",
      message: `${declinerName} declined your invitation to "${invitation.project.title}".`,
      actionUrl: `/projects/${invitation.projectId}`,
      metadata: { projectId: invitation.projectId, declinedByUserId: userId },
    })
  }

  return { success: true as const }
}

/* ==================== ADMIN ACTIONS ==================== */

/**
 * Cancel a pending invitation (Admin action).
 */
export async function cancelInvitation(invitationId: string) {
  const invitation = await getInvitationById(invitationId)

  if (!invitation) {
    return { success: false as const, error: "Invitation not found." }
  }

  if (invitation.status !== "pending") {
    return { success: false as const, error: "Only pending invitations can be cancelled." }
  }

  await db
    .update(projectInvitations)
    .set({ status: "declined" })
    .where(eq(projectInvitations.id, invitationId))

  return { success: true as const }
}

/**
 * Resend an invitation (Admin action).
 * Resets the expiry date to 7 days from now.
 * If the invitation was declined/expired, creates a fresh one instead.
 */
export async function resendInvitation(invitationId: string, invitedByUserId: string) {
  const invitation = await getInvitationById(invitationId)

  if (!invitation) {
    return { success: false as const, error: "Invitation not found." }
  }

  if (invitation.status === "accepted") {
    return { success: false as const, error: "This invitation was already accepted." }
  }

  if (invitation.status === "pending") {
    // Still pending — just extend the expiry
    const newExpiry = new Date()
    newExpiry.setDate(newExpiry.getDate() + 7)

    await db
      .update(projectInvitations)
      .set({ expiresAt: newExpiry })
      .where(eq(projectInvitations.id, invitationId))

    return { success: true as const, action: "extended" as const }
  }

  // Declined or expired — create a brand new invitation
  const newInvitation = await createInvitation(
    invitation.projectId,
    invitedByUserId,
    invitation.email,
    invitation.role as "contributor" | "viewer"
  )

  if (!newInvitation) {
    return { success: false as const, error: "Failed to create new invitation." }
  }

  return { success: true as const, action: "recreated" as const, invitationId: newInvitation?.id }
}

/* ==================== EXPIRY CLEANUP ==================== */

/**
 * Mark all past-due pending invitations as expired.
 * Call from a cron job or run on-read as a cleanup step.
 */
export async function expireStaleInvitations() {
  const result = await db
    .update(projectInvitations)
    .set({ status: "expired" })
    .where(
      and(eq(projectInvitations.status, "pending"), sql`${projectInvitations.expiresAt} < now()`)
    )
    .returning({ id: projectInvitations.id })

  return result.length
}
