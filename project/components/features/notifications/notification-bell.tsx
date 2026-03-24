"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, CheckCheck, Trash2, UserPlus, MessageSquare, ArrowRight } from "lucide-react"
import { timeAgo } from "@/lib/utils"

import { useNotifications } from "@/hooks/use-notifications"
import { useMyInvitations } from "@/hooks/use-invitations"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  invitation: UserPlus,
  task_assigned: ArrowRight,
  comment_added: MessageSquare,
  project_updated: Bell,
  task_moved: ArrowRight,
  mention: MessageSquare,
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const {
    notifications,
    unreadCount,
    isLoadingNotifications,
    markAsRead,
    markAllAsRead,
    isMarkingAllRead,
    deleteNotification,
  } = useNotifications({ limit: 10 })

  const { myInvitations, acceptInvitation, declineInvitation, isAccepting, isDeclining } =
    useMyInvitations()

  const totalBadge = unreadCount + myInvitations.length

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center justify-center rounded-lg border border-border bg-card p-3 text-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-foreground" />

          {totalBadge > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {totalBadge > 99 ? "99+" : totalBadge}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Pending Invitations */}
        {myInvitations.length > 0 && (
          <div className="border-b border-border">
            <div className="px-4 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Pending Invitations
              </p>
            </div>
            {myInvitations.map((invite: any) => {
              const inviterName =
                [invite.invitedBy?.firstName, invite.invitedBy?.lastName]
                  .filter(Boolean)
                  .join(" ") || "Someone"
              return (
                <div
                  key={invite.id}
                  className="flex items-center justify-between border-t border-border/50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      <span className="font-medium">{inviterName}</span> invited you to{" "}
                      <span className="font-medium">{invite.project?.title}</span>
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">as {invite.role}</p>
                  </div>
                  <div className="ml-3 flex shrink-0 gap-1.5">
                    <Button
                      size="sm"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => acceptInvitation(invite.id)}
                      disabled={isAccepting || isDeclining}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-xs text-foreground"
                      onClick={() => declineInvitation(invite.id)}
                      disabled={isAccepting || isDeclining}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Notification List */}
        <div className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent max-h-[360px] overflow-y-auto">
          {notifications.length === 0 && myInvitations.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification: any) => {
              const Icon = NOTIFICATION_ICONS[notification.type] || Bell
              return (
                <div
                  key={notification.id}
                  className={`group flex cursor-pointer gap-3 border-b border-border/50 px-4 py-3 transition-colors hover:bg-muted/50 ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon */}
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      !notification.isRead
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${!notification.isRead ? "font-medium text-foreground" : "text-foreground/80"}`}
                    >
                      {notification.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
