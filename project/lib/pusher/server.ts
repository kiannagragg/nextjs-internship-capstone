/* ============================================
   Pusher Server Instance

   Used in server actions to trigger events
   after successful DB mutations.

   NEVER import this file in client components —
   it uses PUSHER_SECRET which is server-only.
   ============================================ */

import Pusher from "pusher"
import { type PusherEventName, getProjectChannel } from "./events"

/* ==================== INSTANCE ==================== */

let pusherInstance: Pusher | null = null

/**
 * Get or create the server-side Pusher instance.
 * Lazy-initialized singleton to avoid creating
 * the instance at import time (which would fail
 * if env vars aren't loaded yet).
 */
function getPusherServer(): Pusher {
  if (!pusherInstance) {
    const appId = process.env.PUSHER_APP_ID
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const secret = process.env.PUSHER_SECRET
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

    if (!appId || !key || !secret || !cluster) {
      throw new Error(
        "Missing Pusher environment variables. " +
          "Required: PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_KEY, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_CLUSTER"
      )
    }

    pusherInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    })
  }

  return pusherInstance
}

/* ==================== BROADCAST ==================== */

/**
 * Broadcast an event to all subscribers of a project channel.
 *
 * Call this in server actions AFTER a successful DB mutation.
 * Failures are logged but never thrown — real-time is best-effort
 * and should not break the primary action.
 *
 * @example
 * await broadcastToProject(projectId, PUSHER_EVENTS.TASK_CREATED, {
 *   taskId: task.id,
 *   listId: task.listId,
 *   title: task.title,
 *   createdBy: userId,
 * })
 */
export async function broadcastToProject<T>(
  projectId: string,
  event: PusherEventName,
  data: T
): Promise<void> {
  try {
    const pusher = getPusherServer()
    const channel = getProjectChannel(projectId)

    await pusher.trigger(channel, event, data)
  } catch (error) {
    // Log but don't throw — real-time is non-critical
    //console.error(`[Pusher] Failed to broadcast ${event} to project ${projectId}:`, error)
  }
}

/**
 * Broadcast to multiple project channels at once.
 * Pusher supports triggering on up to 100 channels in a single call.
 *
 * Useful when an action affects multiple projects (rare, but possible).
 */
export async function broadcastToProjects<T>(
  projectIds: string[],
  event: PusherEventName,
  data: T
): Promise<void> {
  if (projectIds.length === 0) return

  try {
    const pusher = getPusherServer()
    const channels = projectIds.map(getProjectChannel)

    // Pusher supports max 100 channels per trigger call
    const batches = []
    for (let i = 0; i < channels.length; i += 100) {
      batches.push(channels.slice(i, i + 100))
    }

    await Promise.all(batches.map((batch) => pusher.trigger(batch, event, data)))
  } catch (error) {
    //console.error(`[Pusher] Failed to broadcast ${event} to multiple projects:`, error)
  }
}

/**
 * Authenticate a user for a private channel.
 * Called by the auth endpoint — do not use directly in actions.
 */
export function authenticateChannel(socketId: string, channelName: string) {
  const pusher = getPusherServer()
  return pusher.authorizeChannel(socketId, channelName)
}
