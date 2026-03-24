/* ============================================
   Pusher Event Definitions

   Single source of truth for all real-time
   event names and their payload types.

   Imported by both server (to trigger) and
   client (to bind/listen).
   ============================================ */

/* ==================== EVENT NAMES ==================== */

export const PUSHER_EVENTS = {
  // Member events
  MEMBER_JOINED: "member:joined",
  MEMBER_REMOVED: "member:removed",
  MEMBER_ROLE_CHANGED: "member:role-changed",

  // Invitation events
  INVITATION_CREATED: "invitation:created",
  INVITATION_RESPONDED: "invitation:responded",

  // Task events
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_MOVED: "task:moved",
  TASK_DELETED: "task:deleted",
  TASK_ASSIGNED: "task:assigned",
  TASK_UNASSIGNED: "task:unassigned",
  TASK_COMPLETED: "task:completed",

  // List events
  LIST_CREATED: "list:created",
  LIST_UPDATED: "list:updated",
  LIST_DELETED: "list:deleted",
  LIST_REORDERED: "list:reordered",

  // Comment events
  COMMENT_ADDED: "comment:added",
  COMMENT_DELETED: "comment:deleted",

  // Project events
  PROJECT_UPDATED: "project:updated",
} as const

export type PusherEventName = (typeof PUSHER_EVENTS)[keyof typeof PUSHER_EVENTS]

/* ==================== CHANNEL HELPERS ==================== */

/**
 * Get the private channel name for a project.
 * Format: private-project-{projectId}
 */
export function getProjectChannel(projectId: string): string {
  return `private-project-${projectId}`
}

/* ==================== PAYLOAD TYPES ==================== */

// Member payloads
export type MemberJoinedPayload = {
  userId: string
  name: string
  role: string
  imageUrl: string | null
}

export type MemberRemovedPayload = {
  userId: string
}

export type MemberRoleChangedPayload = {
  userId: string
  oldRole: string
  newRole: string
}

// Invitation payloads
export type InvitationCreatedPayload = {
  invitationId: string
  email: string
  role: string
}

export type InvitationRespondedPayload = {
  invitationId: string
  status: "accepted" | "declined"
}

// Task payloads
export type TaskCreatedPayload = {
  taskId: string
  listId: string
  title: string
  createdBy: string
}

export type TaskUpdatedPayload = {
  taskId: string
  changes: Record<string, unknown>
}

export type TaskMovedPayload = {
  taskId: string
  fromListId: string
  toListId: string
  position: number
}

export type TaskDeletedPayload = {
  taskId: string
  listId: string
}

export type TaskAssignedPayload = {
  taskId: string
  assigneeId: string
  assignedBy: string
}

export type TaskUnassignedPayload = {
  taskId: string
  assigneeId: string
  removedBy: string
}

export type TaskCompletedPayload = {
  taskId: string
  isCompleted: boolean
}

// List payloads
export type ListCreatedPayload = {
  listId: string
  title: string
  position: number
  color: string | null
}

export type ListUpdatedPayload = {
  listId: string
  changes: Record<string, unknown>
}

export type ListDeletedPayload = {
  listId: string
}

export type ListReorderedPayload = {
  updates: { listId: string; position: number }[]
}

// Comment payloads
export type CommentAddedPayload = {
  commentId: string
  taskId: string
  userId: string
  content: string
}

export type CommentDeletedPayload = {
  commentId: string
  taskId: string
}

// Project payloads
export type ProjectUpdatedPayload = {
  changes: Record<string, unknown>
}

/* ==================== EVENT → PAYLOAD MAP ==================== */

/**
 * Maps each event name to its payload type.
 * Used for type-safe event binding on the client.
 */
export type PusherEventPayloadMap = {
  [PUSHER_EVENTS.MEMBER_JOINED]: MemberJoinedPayload
  [PUSHER_EVENTS.MEMBER_REMOVED]: MemberRemovedPayload
  [PUSHER_EVENTS.MEMBER_ROLE_CHANGED]: MemberRoleChangedPayload
  [PUSHER_EVENTS.INVITATION_CREATED]: InvitationCreatedPayload
  [PUSHER_EVENTS.INVITATION_RESPONDED]: InvitationRespondedPayload
  [PUSHER_EVENTS.TASK_CREATED]: TaskCreatedPayload
  [PUSHER_EVENTS.TASK_UPDATED]: TaskUpdatedPayload
  [PUSHER_EVENTS.TASK_MOVED]: TaskMovedPayload
  [PUSHER_EVENTS.TASK_DELETED]: TaskDeletedPayload
  [PUSHER_EVENTS.TASK_ASSIGNED]: TaskAssignedPayload
  [PUSHER_EVENTS.TASK_UNASSIGNED]: TaskUnassignedPayload
  [PUSHER_EVENTS.TASK_COMPLETED]: TaskCompletedPayload
  [PUSHER_EVENTS.LIST_CREATED]: ListCreatedPayload
  [PUSHER_EVENTS.LIST_UPDATED]: ListUpdatedPayload
  [PUSHER_EVENTS.LIST_DELETED]: ListDeletedPayload
  [PUSHER_EVENTS.LIST_REORDERED]: ListReorderedPayload
  [PUSHER_EVENTS.COMMENT_ADDED]: CommentAddedPayload
  [PUSHER_EVENTS.COMMENT_DELETED]: CommentDeletedPayload
  [PUSHER_EVENTS.PROJECT_UPDATED]: ProjectUpdatedPayload
}
