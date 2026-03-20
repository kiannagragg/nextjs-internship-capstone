"use client"

/* ============================================
   useProjectChannel Hook

   Subscribes to a project's Pusher channel and
   invalidates React Query caches when events
   arrive so the UI updates automatically.

   Usage:
     useProjectChannel(projectId)

   That's it. Drop it into any component that
   renders project data and it handles the rest.
   ============================================ */

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { Channel } from "pusher-js"
import { usePusher } from "@/components/providers/pusher-provider"
import { PUSHER_EVENTS, getProjectChannel } from "@/lib/pusher/events"

/**
 * Subscribe to real-time events for a project.
 * Automatically invalidates relevant React Query caches
 * when events are received.
 *
 * @param projectId - The project to subscribe to (null to skip)
 */
export function useProjectChannel(projectId: string | null) {
  const pusher = usePusher()
  const queryClient = useQueryClient()
  const channelRef = useRef<Channel | null>(null)

  useEffect(() => {
    if (!pusher || !projectId) return

    const channelName = getProjectChannel(projectId)
    const channel = pusher.subscribe(channelName)
    channelRef.current = channel

    /* ==================== TASK EVENTS ==================== */

    channel.bind(PUSHER_EVENTS.TASK_CREATED, () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    })

    channel.bind(PUSHER_EVENTS.TASK_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
    })

    channel.bind(PUSHER_EVENTS.TASK_MOVED, () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    })

    channel.bind(PUSHER_EVENTS.TASK_DELETED, () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    })

    channel.bind(PUSHER_EVENTS.TASK_ASSIGNED, () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
    })

    channel.bind(PUSHER_EVENTS.TASK_UNASSIGNED, () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
    })

    channel.bind(PUSHER_EVENTS.TASK_COMPLETED, () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    })

    /* ==================== LIST EVENTS ==================== */

    channel.bind(PUSHER_EVENTS.LIST_CREATED, () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    })

    channel.bind(PUSHER_EVENTS.LIST_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    })

    channel.bind(PUSHER_EVENTS.LIST_DELETED, () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    })

    channel.bind(PUSHER_EVENTS.LIST_REORDERED, () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    })

    /* ==================== MEMBER EVENTS ==================== */

    channel.bind(PUSHER_EVENTS.MEMBER_JOINED, () => {
      queryClient.invalidateQueries({ queryKey: ["members", projectId] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    })

    channel.bind(PUSHER_EVENTS.MEMBER_REMOVED, () => {
      queryClient.invalidateQueries({ queryKey: ["members", projectId] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    })

    channel.bind(PUSHER_EVENTS.MEMBER_ROLE_CHANGED, () => {
      queryClient.invalidateQueries({ queryKey: ["members", projectId] })
    })

    /* ==================== INVITATION EVENTS ==================== */

    channel.bind(PUSHER_EVENTS.INVITATION_CREATED, () => {
      queryClient.invalidateQueries({ queryKey: ["invitations", projectId] })
    })

    channel.bind(PUSHER_EVENTS.INVITATION_RESPONDED, () => {
      queryClient.invalidateQueries({ queryKey: ["invitations", projectId] })
      queryClient.invalidateQueries({ queryKey: ["members", projectId] })
    })

    /* ==================== COMMENT EVENTS ==================== */

    channel.bind(PUSHER_EVENTS.COMMENT_ADDED, () => {
      queryClient.invalidateQueries({ queryKey: ["comments", projectId] })
    })

    channel.bind(PUSHER_EVENTS.COMMENT_DELETED, () => {
      queryClient.invalidateQueries({ queryKey: ["comments", projectId] })
    })

    /* ==================== PROJECT EVENTS ==================== */

    channel.bind(PUSHER_EVENTS.PROJECT_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    })

    /* ==================== CLEANUP ==================== */

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      channelRef.current = null
    }
  }, [pusher, projectId, queryClient])
}
