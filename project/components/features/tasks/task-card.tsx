"use client"

import { Calendar, MoreHorizontal, Edit, Copy, Trash } from "lucide-react"
import { TaskWithAssignees } from "@/types"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskCardProps {
  task: TaskWithAssignees
  onClick?: (task: TaskWithAssignees) => void
  onDelete?: (taskId: string) => void // 👈 Added this prop
}

export function TaskCard({ task, onClick, onDelete }: TaskCardProps) {
  const { toast } = useToast()

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

  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/projects/${task.projectId}?taskId=${task.id}`
    navigator.clipboard.writeText(url)

    toast({
      title: "Link copied!",
      description: "Task link has been copied to your clipboard.",
    })
  }

  return (
    <div
      onClick={() => onClick?.(task)}
      className={`group relative mb-2 flex cursor-pointer flex-col gap-3 rounded-md border bg-card p-3 shadow-sm transition-all hover:ring-1 hover:ring-primary ${
        task.isCompleted ? "opacity-60" : "opacity-100" // 👈 Visual fade for completed tasks
      }`}
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
          <div />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={14} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onClick?.(task)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(task.id) // 👈 Wire up delete
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task Title */}
      <h4
        className={`line-clamp-2 text-sm font-medium leading-snug ${
          task.isCompleted ? "text-muted-foreground line-through" : "text-card-foreground"
        }`}
      >
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
