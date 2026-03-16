"use client"
import Link from "next/link"
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

import { useProjectHeaderLogic } from "@/hooks/use-project-header"

// --- Helpers ---
function getInitials(firstName?: string | null, lastName?: string | null) {
  return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase() || "U"
}

const PRIORITY_STYLES = {
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
}

// --- Component ---
export function ProjectHeader({ project, isPinned }: any) {
  const { state, setters, handlers, viewData } = useProjectHeaderLogic(project, isPinned)
  const { progressData, updatedText, dueDateText } = viewData

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-border bg-background px-6 pb-4 pt-6">
        {/* Top Row: Breadcrumb */}
        <Link
          href="/projects"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} /> Projects / {project.title}
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
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold capitalize ${PRIORITY_STYLES[project.priority as keyof typeof PRIORITY_STYLES] || PRIORITY_STYLES.medium}`}
            >
              {project.priority}
            </span>
          </div>

          <div className="hidden h-6 w-px bg-border sm:block" />

          {/* Fixed Progress */}
          <div className="w-full sm:w-56">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium text-foreground">
                {progressData.percent}% ({progressData.completed}/{progressData.total})
              </span>
            </div>
            <Progress value={progressData.percent} className="h-1.5" />
          </div>

          <div className="hidden h-6 w-px bg-border sm:block" />

          {/* Members & Add Member Dialog */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {project.members?.slice(0, 5).map((member: any) => (
                <div
                  key={member.userId}
                  className="relative z-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-foreground text-xs font-bold text-background transition-transform hover:z-10 hover:scale-110"
                  title={`${member.user?.firstName} ${member.user?.lastName}`}
                >
                  {getInitials(member.user?.firstName, member.user?.lastName)}
                </div>
              ))}
            </div>

            <Dialog open={state.isAddMemberOpen} onOpenChange={setters.setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground transition-colors hover:border-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Add Member"
                >
                  <Plus size={16} />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add Team Member</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label className="text-foreground" htmlFor="email">
                      Email address
                    </Label>
                    <Input className="text-foreground" id="email" placeholder="name@example.com" />
                  </div>
                  <div className="grid gap-2 text-foreground">
                    <Label className="text-foreground" htmlFor="role">
                      Role
                    </Label>
                    <Select defaultValue="contributor">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="text-foreground">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="contributor">Contributor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    className="text-foreground"
                    variant="outline"
                    onClick={() => setters.setIsAddMemberOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handlers.handleInviteMember}>Send Invite</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="hidden h-6 w-px bg-border lg:block" />

          {/* Search Input */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="h-9 pl-9 text-foreground"
              value={state.searchQuery}
              onChange={(e) => setters.setSearchQuery(e.target.value)}
            />
          </div>

          {/* Spacer to push 3-dots to the right on large screens */}
          <div className="flex-1" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 text-foreground">
                <Filter size={16} />
                <span className="hidden sm:inline-flex">Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-foreground">Filter Tasks</h4>
                <p className="text-sm text-muted-foreground">Filter options coming soon!</p>
                {/* You can add Select dropdowns or Checkboxes here later for Priority, Assignee, etc. */}
              </div>
            </PopoverContent>
          </Popover>

          {/* 3-Dot Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 text-foreground">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem className="cursor-pointer" onClick={handlers.handleTogglePin}>
                <Pin className="mr-2 h-4 w-4" />
                {/* ✅ FIX: Uses optimisticPinned from hook (reads React Query cache), not stale server prop */}
                {state.optimisticPinned ? "Unpin project" : "Pin project"}
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer" onClick={handlers.handleToggleStatus}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {project.status === "completed" ? "Mark as Active" : "Mark as Done"}
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer" onClick={handlers.handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" /> Copy link
              </DropdownMenuItem>

              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handlers.openEditProjectModal}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Details
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer" onClick={handlers.handleToggleArchive}>
                  {project.isArchived ? (
                    <Upload className="mr-2 h-4 w-4" />
                  ) : (
                    <Archive className="mr-2 h-4 w-4" />
                  )}
                  {project.isArchived ? "Unarchive" : "Archive"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
                  onClick={() => setters.setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                </DropdownMenuItem>
              </>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ALERT DIALOG */}
      <AlertDialog open={state.showDeleteDialog} onOpenChange={setters.setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the <strong>{project.title}</strong> project. All
              associated lists, tasks, comments, and activity logs will be removed. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground" disabled={state.isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlers.handleDeleteConfirm}
              disabled={state.isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {state.isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
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
