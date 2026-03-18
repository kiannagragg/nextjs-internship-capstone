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

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, X, Paperclip } from "lucide-react"
import { useUIStore } from "@/stores/ui-store"
import { useProjects } from "@/hooks/use-projects"
import { useQuery } from "@tanstack/react-query"
import { getProjectListsAction } from "@/lib/actions/lists"
import { useGlobalTaskCreator } from "@/hooks/use-global-task"

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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/shared/date-picker"
import { RichTextEditor } from "@/components/shared/rich-text-editor"

export function CreateTaskModal() {
  const { isCreateTaskModalOpen, closeCreateTaskModal } = useUIStore()
  const { createGlobalTask } = useGlobalTaskCreator()
  const router = useRouter()

  // Projects Data
  const { projects, isLoading: isLoadingProjects } = useProjects()
  const availableProjects = projects?.filter((p) => p.status === "active" && !p.isArchived) || []

  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState("")
  const [listId, setListId] = useState("")
  const [priority, setPriority] = useState<string>("none")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [dueDate, setDueDate] = useState<Date | undefined>()

  // Labels State
  const [labels, setLabels] = useState<string[]>([])
  const [labelInput, setLabelInput] = useState("")

  // Files State
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [dueDateError, setDueDateError] = useState<string | null>(null)

  // Fetch lists dynamically
  const { data: projectLists = [], isLoading: isLoadingLists } = useQuery({
    queryKey: ["project-lists", projectId],
    queryFn: async () => {
      const result = await getProjectListsAction(projectId)
      return result.data || []
    },
    enabled: !!projectId,
  })

  // Handlers
  const handleAddLabel = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && labelInput.trim()) {
      e.preventDefault()
      if (!labels.includes(labelInput.trim())) {
        setLabels([...labels, labelInput.trim()])
      }
      setLabelInput("")
    }
  }

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((l) => l !== labelToRemove))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !projectId || !listId) return

    if (startDate && dueDate && dueDate < startDate) {
      setDueDateError("Due date cannot be earlier than the start date.")
      return
    }

    setDueDateError(null)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("projectId", projectId)
    formData.append("listId", listId)
    if (priority && priority !== "none") formData.append("priority", priority)
    if (startDate) formData.append("startDate", startDate.toISOString())
    if (dueDate) formData.append("dueDate", dueDate.toISOString())

    // Append arrays/files
    formData.append("labels", JSON.stringify(labels))
    files.forEach((file) => formData.append("attachments", file))

    createGlobalTask.mutate(formData, {
      onSuccess: () => {
        closeCreateTaskModal()
        router.push(`/projects/${projectId}`) // Redirect to the Kanban board
      },
    })
  }

  const handleClose = () => {
    if (!createGlobalTask.isPending) closeCreateTaskModal()
  }

  return (
    <Dialog open={isCreateTaskModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent max-h-[90vh] max-w-2xl overflow-y-auto text-foreground sm:rounded-xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="font-display text-xl font-bold tracking-tight text-foreground">
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Add a new task with details, dates, and attachments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
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

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Add more details to this task..."
              disabled={createGlobalTask.isPending}
            />
          </div>

          {/* Project & List Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Project <span className="text-destructive">*</span>
              </label>
              <Select
                value={projectId}
                onValueChange={(value) => {
                  setProjectId(value)
                  setListId("")
                }}
                disabled={isLoadingProjects || createGlobalTask.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                List <span className="text-destructive">*</span>
              </label>
              <Select
                value={listId}
                onValueChange={setListId}
                disabled={!projectId || isLoadingLists || createGlobalTask.isPending}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={!projectId ? "Select project first" : "Select a list"}
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
          </div>

          {/* Priority & Dates Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Select
                value={priority}
                onValueChange={setPriority}
                disabled={createGlobalTask.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                disabled={createGlobalTask.isPending}
                placeholder="Start date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Due Date</label>
              <DatePicker
                value={dueDate}
                onChange={(date) => {
                  setDueDate(date)
                  if (dueDateError) setDueDateError(null)
                }}
                disabled={createGlobalTask.isPending}
                disabledDates={(date) => (startDate ? date < startDate : false)}
                placeholder="Due date"
              />
              {dueDateError && <p className="text-xs text-destructive">{dueDateError}</p>}
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Labels</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(label)}
                    className="hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <Input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleAddLabel}
              placeholder="Type a label and press Enter..."
              disabled={createGlobalTask.isPending}
            />
          </div>

          {/* Attachments (Native) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Attachments</label>
            <div
              className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border p-4 transition-colors hover:bg-accent/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={18} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload files</span>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={createGlobalTask.isPending}
              />
            </div>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded bg-muted/50 p-2 text-xs text-foreground"
                  >
                    <span className="max-w-[80%] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter className="mt-8 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createGlobalTask.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title || !projectId || !listId || createGlobalTask.isPending}
            >
              {createGlobalTask.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {createGlobalTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
