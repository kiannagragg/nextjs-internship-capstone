"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Pin,
  CheckCircle2,
  Copy,
  Edit,
  Archive,
  Trash2,
  Loader2,
  Upload,
  Calendar,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useToast } from "@/hooks/use-toast"
import { useUIStore } from "@/stores/ui-store"

// Server Actions
import {
  togglePinProjectAction,
  setProjectStatusAction,
  archiveProjectAction,
  deleteProjectAction,
} from "@/lib/actions/projects" // adjust path if needed

// Helpers
function getInitials(firstName?: string | null, lastName?: string | null) {
  return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase() || "U"
}

function formatDate(date: Date | string | null) {
  if (!date) return "No date"
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export function ProjectHeader({
  project,
  isAdmin,
  isPinned,
  progress,
  totalTasks,
  currentUserId,
}: any) {
  const router = useRouter()
  const { toast } = useToast()
  const { openEditProjectModal } = useUIStore()

  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // --- Handlers ---

  const handleTogglePin = () => {
    startTransition(async () => {
      const res = await togglePinProjectAction(project.id, isPinned)
      if (res.error) toast({ variant: "destructive", title: "Error", description: res.error })
    })
  }

  const handleToggleStatus = () => {
    startTransition(async () => {
      const newStatus = project.status === "completed" ? "active" : "completed"
      const res = await setProjectStatusAction(project.id, newStatus)
      if (res.error) {
        toast({ variant: "destructive", title: "Error", description: res.error })
      } else {
        toast({ title: "Status updated", description: `Project marked as ${newStatus}.` })
      }
    })
  }

  const handleToggleArchive = () => {
    startTransition(async () => {
      const res = await archiveProjectAction(project.id, !project.isArchived)
      if (res.error) {
        toast({ variant: "destructive", title: "Error", description: res.error })
      } else {
        toast({ title: project.isArchived ? "Project unarchived" : "Project archived" })
      }
    })
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/projects/${project.id}`
    navigator.clipboard.writeText(url)
    toast({ title: "Link copied!", description: "Project link copied to clipboard." })
  }

  const handleDeleteConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDeleting(true)
    try {
      const res = await deleteProjectAction(project.id)
      if (res.success) {
        toast({ title: "Project deleted" })
        router.push("/projects") // Push away to avoid 404 on current page
      } else {
        toast({ variant: "destructive", title: "Error", description: res.error })
        setIsDeleting(false)
        setShowDeleteDialog(false)
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete project." })
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const priorityStyles = {
    high: "bg-red-500/10 text-red-600 dark:text-red-400",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    low: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  }

  // Helper function to calculate "mins/hrs/days ago"
  const getTimeAgo = (dateString: Date | string | null) => {
    if (!dateString) return "Unknown"

    const date = new Date(dateString)
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    let interval = seconds / 86400 // days
    if (interval >= 1) return `${Math.floor(interval)}d ago`

    interval = seconds / 3600 // hours
    if (interval >= 1) return `${Math.floor(interval)}h ago`

    interval = seconds / 60 // minutes
    if (interval >= 1) return `${Math.floor(interval)}m ago`

    return "Just now"
  }

  const updatedText = getTimeAgo(project.updatedAt)

  const dueDateText = project.dueDate
    ? new Date(project.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No due date"

  return (
    <>
      <div
        className={`flex flex-col gap-4 border-b border-border bg-background px-6 pb-4 pt-6 ${isPending ? "pointer-events-none opacity-70 transition-opacity" : ""}`}
      >
        {/* Top Row: Breadcrumb */}
        <Link
          href="/projects"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Projects / {project.title}
        </Link>

        {/* Title Row */}
        <div>
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: project.color || "#3b82f6" }}
            />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.title}</h1>
          </div>
          <div className="mt-1.5 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-muted-foreground/70" />
              <span>Updated {updatedText}</span>
            </div>

            <div className={`flex items-center gap-1.5 ${!project.dueDate ? "opacity-60" : ""}`}>
              <Calendar size={14} className="text-muted-foreground/70" />
              <span>Due: {dueDateText}</span>
            </div>
          </div>
        </div>

        {/* Toolbar Row */}
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {/* Badges */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold capitalize ${project.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-500/10 text-slate-600 dark:text-slate-400"}`}
            >
              {project.status === "active" && (
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
              {project.status}
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold capitalize ${priorityStyles[project.priority as keyof typeof priorityStyles]}`}
            >
              {project.priority}
            </span>
          </div>

          <div className="hidden h-6 w-px bg-border sm:block" />

          {/* Progress */}
          <div className="w-full sm:w-56">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium text-foreground">
                {progress}% ({totalTasks} Tasks)
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          <div className="hidden h-6 w-px bg-border sm:block" />

          {/* Members & Add Member Button */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {project.members?.slice(0, 3).map((member: any) => (
                <div
                  key={member.userId}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-foreground text-xs font-bold text-background"
                >
                  {getInitials(member.user?.firstName, member.user?.lastName)}
                </div>
              ))}
            </div>

            {isAdmin && (
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                    <Plus size={16} />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" placeholder="name@example.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select defaultValue="contributor">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="contributor">Contributor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Mock Invite Sent!",
                          description: "Server action for standalone invites coming soon.",
                        })
                        setIsAddMemberOpen(false)
                      }}
                    >
                      Send Invite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="hidden h-6 w-px bg-border lg:block" />

          {/* Search Input */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="h-9 pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 gap-2">
                <Filter size={16} />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Filter Tasks</h4>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select>
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue placeholder="Everyone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me">My Tasks</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="overdue" className="text-sm font-normal">
                    Overdue only
                  </Label>
                  <Switch id="overdue" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="next7" className="text-sm font-normal">
                    Due within 7 days
                  </Label>
                  <Switch id="next7" />
                </div>
                <Button variant="ghost" className="w-full text-xs" size="sm">
                  Clear all filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Spacer to push 3-dots to the right on large screens */}
          <div className="flex-1" />

          {/* 3-Dot Project Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={handleTogglePin}>
                <Pin size={14} /> {isPinned ? "Unpin Project" : "Pin Project"}
              </DropdownMenuItem>

              {isAdmin && (
                <DropdownMenuItem className="cursor-pointer gap-2" onClick={handleToggleStatus}>
                  <CheckCircle2 size={14} />{" "}
                  {project.status === "completed" ? "Mark as Active" : "Mark as Done"}
                </DropdownMenuItem>
              )}

              {isAdmin && (
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onClick={() => openEditProjectModal(project)}
                >
                  <Edit size={14} /> Edit Project
                </DropdownMenuItem>
              )}

              <DropdownMenuItem className="cursor-pointer gap-2" onClick={handleCopyLink}>
                <Copy size={14} /> Copy Link
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={handleToggleArchive}>
                    {project.isArchived ? <Upload size={14} /> : <Archive size={14} />}
                    {project.isArchived ? "Unarchive Project" : "Archive Project"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 size={14} /> Delete Project
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ALERT DIALOG COMPONENT */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the <strong>{project.title}</strong> project. All
              associated lists, tasks, and activity logs will be removed. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
