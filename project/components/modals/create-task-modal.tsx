// TODO: Task 4.4 - Build task creation and editing functionality
// TODO: Task 5.6 - Create task detail modals and editing interfaces

/*
TODO: Implementation Notes for Interns:

Modal for creating and editing tasks.

Features to implement:
- Task title and description
- Priority selection
- Assignee selection
- Due date picker
- Labels/tags
- Attachments
- Comments section (for edit mode)
- Activity history (for edit mode)

Form fields:
- Title (required)
- Description (rich text editor)
- Priority (low/medium/high)
- Assignee (team member selector)
- Due date (date picker)
- Labels (tag input)
- Attachments (file upload)

Integration:
- Use task validation schema
- Call task creation/update API
- Update board state optimistically
- Handle file uploads
- Real-time updates for comments
*/

"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useUIStore } from "@/stores/ui-store"
import { useProjects } from "@/hooks/use-projects"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createTaskAction } from "@/lib/actions/tasks"
import { getProjectListsAction } from "@/lib/actions/lists"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CreateTaskModal() {
  const { isCreateTaskModalOpen, closeCreateTaskModal } = useUIStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch available projects
  const { projects, isLoading: isLoadingProjects } = useProjects()
  const availableProjects = projects?.filter((p) => p.status === "active" && !p.isArchived) || []

  // Form State
  const [title, setTitle] = useState("")
  const [projectId, setProjectId] = useState("")
  const [listId, setListId] = useState("")

  // Fetch lists/columns dynamically based on the selected project
  const { data: projectLists = [], isLoading: isLoadingLists } = useQuery({
    queryKey: ["project-lists", projectId],
    queryFn: async () => {
      const result = await getProjectListsAction(projectId)
      return result.data || []
    },
    enabled: !!projectId,
  })

  const createGlobalTask = useMutation({
    mutationFn: (taskData: { title: string; projectId: string; listId: string }) =>
      createTaskAction(taskData),
    onSuccess: (result) => {
      if (result?.error) throw new Error(result.error)

      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["project-lists", projectId] })

      toast({ title: "Task created successfully!" })

      setTitle("")
      setProjectId("")
      setListId("")
      closeCreateTaskModal()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: error.message || "An unexpected error occurred.",
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !projectId || !listId) return
    createGlobalTask.mutate({ title, projectId, listId })
  }

  const handleClose = () => {
    closeCreateTaskModal()
  }

  return (
    <Dialog open={isCreateTaskModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent max-h-[90vh] max-w-md overflow-y-auto text-foreground sm:rounded-xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="font-display text-xl font-bold tracking-tight text-foreground">
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Add a new task and assign it to a specific project and list.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Task Title <span className="text-destructive">*</span>
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Update landing page copy"
              disabled={createGlobalTask.isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Assign to Project <span className="text-destructive">*</span>
            </label>
            <Select
              value={projectId}
              onValueChange={(value) => {
                setProjectId(value)
                setListId("") // Reset list selection when project changes
              }}
              disabled={
                isLoadingProjects || availableProjects.length === 0 || createGlobalTask.isPending
              }
            >
              <SelectTrigger className="text-foreground">
                <SelectValue
                  placeholder={isLoadingProjects ? "Loading projects..." : "Select a project"}
                />
              </SelectTrigger>
              <SelectContent>
                {availableProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SECOND DROPDOWN: Lists/Columns */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Assign to List <span className="text-destructive">*</span>
            </label>
            <Select
              value={listId}
              onValueChange={setListId}
              disabled={
                !projectId ||
                isLoadingLists ||
                projectLists.length === 0 ||
                createGlobalTask.isPending
              }
            >
              <SelectTrigger className="text-foreground">
                <SelectValue
                  placeholder={
                    !projectId
                      ? "Select a project first"
                      : isLoadingLists
                        ? "Loading lists..."
                        : "Select a list"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {projectLists.map((list: any) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-8 flex w-full flex-col space-y-3 border-t border-border pt-5 sm:flex-row sm:space-x-3 sm:space-y-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createGlobalTask.isPending}
              className="flex-1 text-foreground sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title || !projectId || !listId || createGlobalTask.isPending}
              className="flex-1 bg-foreground text-primary-foreground hover:bg-foreground/90 sm:flex-none"
            >
              {createGlobalTask.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
