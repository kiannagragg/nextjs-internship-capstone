"use client"

import { Calendar, MoreHorizontal } from "lucide-react"
import { TaskWithAssignees } from "@/types"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface TaskCardProps {
  task: TaskWithAssignees
  onClick?: (task: TaskWithAssignees) => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  // Helper to determine priority badge colors
  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100"
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100"
      case "low":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  // Native JS date formatter (e.g., "Oct 12")
  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div
      onClick={() => onClick?.(task)}
      className="group relative mb-2 flex cursor-pointer flex-col gap-3 rounded-md border bg-card p-3 shadow-sm transition-all hover:ring-1 hover:ring-primary"
    >
      {/* Top Row: Priority Badge & Actions */}
      <div className="flex items-start justify-between">
        {task.priority ? (
          <Badge
            variant="secondary"
            className={`text-[10px] font-semibold uppercase tracking-wider ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </Badge>
        ) : (
          <div /> // Spacer if no priority
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            // TODO: Open quick actions menu
          }}
        >
          <MoreHorizontal size={14} className="text-muted-foreground" />
        </Button>
      </div>

      {/* Task Title */}
      <h4 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
        {task.title}
      </h4>

      {/* Bottom Row: Date & Assignees */}
      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 rounded-sm bg-secondary/50 px-1.5 py-0.5">
              <Calendar size={12} />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatars */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-2 overflow-hidden">
            {task.assignees.map(({ user }) => (
              <Avatar key={user.id} className="inline-block h-6 w-6 border-2 border-background">
                <AvatarImage src={user.imageUrl || ""} alt={user.firstName || "User"} />
                <AvatarFallback className="text-[10px]">
                  {user.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
