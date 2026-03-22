"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  Archive,
  Paperclip,
  Search,
} from "lucide-react"
import { timeAgo } from "@/lib/utils"
import { getActivityLogsAction } from "@/lib/actions/activity"
import { useTeamMembers } from "@/hooks/use-team-member"
import { UserAvatar } from "@/components/shared/user-avatar"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/* ==================== TYPES ==================== */

interface ActivityMetadata {
  title?: string
  taskTitle?: string
  to?: string
  from?: string
  role?: string
  newRole?: string
  email?: string
  memberName?: string
  assigneeName?: string
  assigneeId?: string
  type?: string
  fileName?: string
  fileNames?: string[]
  count?: number
  viaInvitation?: boolean
  accepted?: boolean
  listType?: string
  [key: string]: any
}

/* ==================== HELPERS ==================== */

function getActivityIcon(action: string, metadata?: ActivityMetadata) {
  const className = "h-4 w-4"

  if (
    action === "updated" &&
    metadata &&
    (metadata.type === "attachments_added" || metadata.type === "attachment_deleted")
  ) {
    return <Paperclip className={className} />
  }

  switch (action) {
    case "created":
      return <Plus className={className} />
    case "moved":
      return <ArrowRight className={className} />
    case "updated":
      return <Pencil className={className} />
    case "completed":
      return <CheckCircle2 className={`${className} text-emerald-500`} />
    case "restored":
      return <CheckCircle2 className={className} />
    case "assigned":
      return <UserPlus className={className} />
    case "unassigned":
      return <UserMinus className={className} />
    case "commented":
      return <MessageCircle className={className} />
    case "deleted":
      return <Trash2 className={className} />
    case "invited":
      return <UserPlus className={className} />
    case "removed":
      return <UserMinus className={className} />
    case "role_changed":
      return <Users className={className} />
    case "archived":
    case "unarchived":
      return <Archive className={className} />
    default:
      return <Activity className={className} />
  }
}

function formatActivityMessage(
  action: string,
  entityType: string,
  metadata: ActivityMetadata | null
) {
  const title = metadata?.title || metadata?.taskTitle || "an item"

  switch (action) {
    case "created":
      if (entityType === "task") return `created task "${title}"`
      if (entityType === "list") return `created list "${title}"`
      if (entityType === "project") return `created project "${title}"`
      if (metadata?.type === "calendar_event") return `created event "${title}"`
      return `created ${entityType} "${title}"`

    case "updated":
      if (metadata?.type === "attachments_added") {
        const count = metadata.count || metadata.fileNames?.length || 0
        const fileNames = metadata.fileNames || []
        if (count === 1 && fileNames.length === 1) return `attached "${fileNames[0]}" to a task`
        return `attached ${count} file${count !== 1 ? "s" : ""} to a task`
      }
      if (metadata?.type === "attachment_deleted") {
        return `removed attachment "${metadata.fileName || "a file"}"`
      }
      if (entityType === "task") return `updated task "${title}"`
      if (entityType === "project") return `updated project "${title}"`
      return `updated ${entityType} "${title}"`

    case "deleted":
      if (entityType === "task") return `deleted task "${title}"`
      if (entityType === "list") return `deleted list "${title}"`
      if (entityType === "project") return `deleted project "${title}"`
      if (entityType === "comment") return `deleted a comment`
      return `deleted ${entityType} "${title}"`

    case "moved":
      if (metadata?.from && metadata?.to) {
        return `moved "${metadata.taskTitle || title}" from ${metadata.from} to ${metadata.to}`
      }
      return `moved "${title}" to another list`

    case "completed":
      return `completed "${title}"`

    case "restored":
      return `reopened "${title}"`

    case "assigned":
      if (metadata?.assigneeName)
        return `assigned ${metadata.assigneeName} to "${metadata.taskTitle || title}"`
      return `assigned someone to "${title}"`

    case "unassigned":
      if (metadata?.assigneeName)
        return `removed ${metadata.assigneeName} from "${metadata.taskTitle || title}"`
      return `removed an assignee from "${title}"`

    case "commented":
      if (metadata?.taskTitle) return `commented on "${metadata.taskTitle}"`
      return `added a comment`

    case "invited":
      if (metadata?.email) return `invited ${metadata.email} as ${metadata.role || "member"}`
      if (metadata?.viaInvitation && metadata?.accepted) return `joined the project`
      return `invited a new member${metadata?.role ? ` as ${metadata.role}` : ""}`

    case "removed":
      if (metadata?.memberName) return `removed ${metadata.memberName} from the project`
      return `removed a member`

    case "role_changed":
      if (metadata?.memberName && metadata?.from && metadata?.to) {
        return `changed ${metadata.memberName}'s role from ${metadata.from} to ${metadata.to}`
      }
      if (metadata?.newRole) return `changed a member's role to ${metadata.newRole}`
      return `changed a member's role`

    case "archived":
      return `archived "${title}"`

    case "unarchived":
      return `restored "${title}" from archive`

    default:
      return `modified a ${entityType}`
  }
}

function getActivityCategory(action: string, entityType: string): string {
  if (entityType === "task" || entityType === "comment") return "tasks"
  if (
    entityType === "member" ||
    action === "invited" ||
    action === "removed" ||
    action === "role_changed"
  )
    return "members"
  if (entityType === "project") return "projects"
  if (entityType === "list") return "lists"
  return "other"
}

const FILTER_OPTIONS = [
  { value: "all", label: "All Activity" },
  { value: "tasks", label: "Tasks" },
  { value: "members", label: "Members" },
  { value: "projects", label: "Projects" },
  { value: "lists", label: "Lists" },
]

/* ==================== COMPONENT ==================== */

export default function ActivityPage() {
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const { memberProjects } = useTeamMembers(null)

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activity-logs", projectFilter],
    queryFn: async () => {
      const result = await getActivityLogsAction(
        projectFilter === "all" ? undefined : projectFilter
      )
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })

  // Client-side filtering
  const filteredActivities = useMemo(() => {
    let filtered = activities

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (a: any) => getActivityCategory(a.action, a.entityType) === categoryFilter
      )
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((a: any) => {
        const userName = `${a.user?.firstName || ""} ${a.user?.lastName || ""}`.toLowerCase()
        const meta = a.metadata as ActivityMetadata | null
        const title = (meta?.title || meta?.taskTitle || "").toLowerCase()
        const projectTitle = (a.project?.title || "").toLowerCase()
        const message = formatActivityMessage(a.action, a.entityType, meta).toLowerCase()
        return (
          userName.includes(q) ||
          title.includes(q) ||
          projectTitle.includes(q) ||
          message.includes(q)
        )
      })
    }

    return filtered
  }, [activities, categoryFilter, searchQuery])

  // Group by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, any[]> = {}

    for (const activity of filteredActivities) {
      const date = new Date(activity.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })

      if (!groups[date]) groups[date] = []
      groups[date].push(activity)
    }

    return groups
  }, [filteredActivities])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activity</h1>
        <p className="mt-1 text-muted-foreground">Full history of actions across your projects</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-foreground"
          />
        </div>

        {/* Project filter */}
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[300px] text-foreground">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {memberProjects.map((project: any) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: project.color || "#3b82f6" }}
                  />
                  <span>{project.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <Activity className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-muted-foreground">
            {searchQuery || categoryFilter !== "all"
              ? "No matching activity found"
              : "No activity yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([date, items]) => (
            <div key={date}>
              {/* Date header */}
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {date}
              </h3>

              {/* Activity entries */}
              <div className="space-y-1">
                {items.map((activity: any) => {
                  const meta = activity.metadata as ActivityMetadata | null
                  const message = formatActivityMessage(activity.action, activity.entityType, meta)

                  return (
                    <div
                      key={activity.id}
                      className="group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50"
                    >
                      {/* Icon */}
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                        {getActivityIcon(activity.action, meta as ActivityMetadata)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <span className="font-semibold text-foreground">
                            {`${activity.user?.firstName || "Unknown"} ${activity.user?.lastName || ""}`.trim()}
                          </span>{" "}
                          <span className="text-muted-foreground">{message}</span>
                        </p>

                        {/* Project + time */}
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{timeAgo(activity.createdAt)}</span>
                          {activity.project && (
                            <>
                              <span className="opacity-40">&bull;</span>
                              <Link
                                href={`/projects/${activity.projectId}`}
                                className="inline-flex items-center gap-1 transition-colors hover:text-foreground hover:underline"
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: activity.project.color || "#3b82f6" }}
                                />
                                {activity.project.title}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
