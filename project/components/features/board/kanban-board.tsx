"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { Plus, MoreHorizontal, Loader2, Trash2, Edit2, ArrowLeftRight } from "lucide-react"

import type { ListWithTasks, TaskWithAssignees } from "@/types"
import { useBoardStore } from "@/stores/board-store"
import { createListAction, deleteListAction, updateListAction } from "@/lib/actions/lists"
import { createTaskAction } from "@/lib/actions/tasks"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

import { TaskCard } from "@/components/features/tasks/task-card"

interface KanbanBoardProps {
  projectId: string
  initialLists: ListWithTasks[]
  userRole: "admin" | "contributor" | "viewer"
  currentUserId: string
}

const PRESET_COLORS = [
  "#2D6EF7", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#64748B", // Slate
]

export function KanbanBoard({
  projectId,
  initialLists,
  userRole,
  currentUserId,
}: KanbanBoardProps) {
  const { toast } = useToast()

  // Zustand Store
  const {
    lists,
    setBoardData,
    removeListOptimistic,
    updateListOptimistic,
    addTaskOptimistic,
    removeTaskOptimistic,
  } = useBoardStore()

  // Local UI State
  const [isPending, startTransition] = useTransition()

  // List State
  const [isAddingList, setIsAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState("")
  const [newListColor, setNewListColor] = useState(PRESET_COLORS[0])
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editListTitle, setEditListTitle] = useState("")
  const [editListColor, setEditListColor] = useState("")
  const [listToDelete, setListToDelete] = useState<{ id: string; title: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Task State (NEW)
  const [addingTaskToListId, setAddingTaskToListId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const taskInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (addingTaskToListId && taskInputRef.current) {
      taskInputRef.current.focus()
    }
  }, [addingTaskToListId])

  // Sync server data to Zustand store on mount or when server data changes
  useEffect(() => {
    setBoardData(projectId, initialLists)
  }, [projectId, initialLists, setBoardData])

  // --- ACTIONS ---
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListTitle.trim()) return

    const title = newListTitle.trim()
    const color = newListColor

    // Reset Form
    setNewListTitle("")
    setNewListColor(PRESET_COLORS[0])
    setIsAddingList(false)

    startTransition(async () => {
      const result = await createListAction({
        title,
        projectId,
        color,
      })

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Failed to create list",
          description: result.error,
        })
      } else {
        toast({
          title: "List created!",
          description: `"${title}" has been added to your board.`,
        })
      }
    })
  }

  const handleEditList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editListTitle.trim() || !editingListId) return

    const id = editingListId
    const title = editListTitle.trim()
    const color = editListColor

    // Optimistic UI Update
    updateListOptimistic(id, { title, color })
    setEditingListId(null)

    startTransition(async () => {
      const result = await updateListAction(id, projectId, { title, color })

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Failed to update list",
          description: result.error,
        })
        // Revert on error
        setBoardData(projectId, initialLists)
      } else {
        toast({
          title: "List updated",
          description: "Your list details have been saved.",
        })
      }
    })
  }

  const confirmDeleteList = async () => {
    if (!listToDelete) return
    const { id, title } = listToDelete
    setListToDelete(null)

    // 1. Optimistic UI Update (instant feel)
    removeListOptimistic(id)

    // 2. Server mutation
    startTransition(async () => {
      const result = await deleteListAction(id, projectId)
      if (result?.error) {
        // If error, revert optimistic update by re-syncing server state
        setBoardData(projectId, initialLists)
        toast({
          variant: "destructive",
          title: "Failed to delete list",
          description: result.error,
        })
      } else {
        toast({
          title: "List deleted",
          description: `"${title}" has been removed permanently.`,
        })
      }
    })
  }

  const startEditing = (list: ListWithTasks) => {
    setEditingListId(list.id)
    setEditListTitle(list.title)
    setEditListColor(list.color || (PRESET_COLORS[0] as string))
  }

  // --- TASK ACTIONS (NEW) ---
  const handleCreateTask = async (listId: string) => {
    if (!newTaskTitle.trim()) return

    const title = newTaskTitle.trim()
    const tempTaskId = `temp-${crypto.randomUUID()}` // Generate temporary ID for optimistic UI

    // Close form instantly
    setNewTaskTitle("")
    setAddingTaskToListId(null)

    // 1. Optimistic Update
    const optimisticTask: TaskWithAssignees = {
      id: tempTaskId,
      title,
      description: null,
      priority: "medium",
      isCompleted: false,
      position: lists.find((l) => l.id === listId)?.tasks.length || 0,
      startDate: null,
      dueDate: null,
      createdById: currentUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      listId,
      projectId,
      assignees: [],
      labels: [],
    }

    addTaskOptimistic(listId, optimisticTask)

    // 2. Server Action
    startTransition(async () => {
      const result = await createTaskAction({
        title,
        listId,
        projectId,
      })

      if (result.error) {
        // Rollback
        removeTaskOptimistic(tempTaskId)
        toast({
          variant: "destructive",
          title: "Failed to create task",
          description: result.error,
        })
      } else if (result.data) {
        // Technically, Drizzle will revalidate the path and the useEffect will catch the real data,
        // but if we wanted to be perfectly precise, we'd replace the tempTask with result.data here.
      }
    })
  }

  const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, listId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleCreateTask(listId)
    }
    if (e.key === "Escape") {
      setAddingTaskToListId(null)
      setNewTaskTitle("")
    }
  }

  const canModifyBoard = userRole !== "viewer"

  return (
    <>
      <div className="flex h-full items-start gap-6 pt-2">
        {lists.map((list) => {
          // Contributors can only delete lists they created. Admins can delete any.
          const canDeleteThisList =
            userRole === "admin" ||
            (userRole === "contributor" && list.createdById === currentUserId)

          return (
            <div
              key={list.id}
              className="flex max-h-full w-80 flex-shrink-0 flex-col rounded-lg border bg-secondary/50"
            >
              {/* List Header OR Edit Form */}
              {editingListId === list.id ? (
                <form
                  onSubmit={handleEditList}
                  className="rounded-t-lg border-b bg-background p-3 shadow-sm"
                >
                  <Input
                    autoFocus
                    value={editListTitle}
                    onChange={(e) => setEditListTitle(e.target.value)}
                    className="mb-3 h-8 text-sm"
                    placeholder="List title"
                  />
                  <div className="mb-3 flex gap-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditListColor(color)}
                        className={`h-5 w-5 rounded-full transition-all ${
                          editListColor === color
                            ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="h-7 flex-1 text-xs">
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 flex-1 text-xs"
                      onClick={() => setEditingListId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2 font-semibold">
                    {list.color && (
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: list.color }}
                      />
                    )}
                    <h3 className="text-foreground">{list.title}</h3>
                    <span className="flex h-5 items-center justify-center rounded-full bg-secondary px-2 text-xs font-medium text-muted-foreground">
                      {list.tasks.length}
                    </span>
                  </div>

                  {/* List Actions Menu */}
                  {canModifyBoard && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => startEditing(list)}
                        >
                          <Edit2 size={14} /> Edit List
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2">
                          <ArrowLeftRight size={14} /> Move Left/Right
                        </DropdownMenuItem>
                        {canDeleteThisList && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
                              onClick={() => setListToDelete({ id: list.id, title: list.title })}
                            >
                              <Trash2 size={14} /> Delete List
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}

              {/* List Task Area */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 pt-3">
                {list.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {list.tasks.length === 0 && (
                  <div className="flex h-12 items-center justify-center rounded border border-dashed text-sm text-muted-foreground">
                    No tasks yet
                  </div>
                )}
              </div>

              {/* --- INLINE TASK CREATOR (NEW) --- */}
              {addingTaskToListId === list.id && (
                <div className="m-3 rounded-md border bg-card p-3 shadow-sm">
                  <Textarea
                    ref={taskInputRef}
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => handleTaskKeyDown(e, list.id)}
                    placeholder="What needs to be done?"
                    className="min-h-[60px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCreateTask(list.id)}
                      disabled={!newTaskTitle.trim() || isPending}
                    >
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAddingTaskToListId(null)
                        setNewTaskTitle("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Add Task Button (Only show if not currently adding a task to THIS list) */}
              {canModifyBoard && addingTaskToListId !== list.id && (
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    onClick={() => setAddingTaskToListId(list.id)}
                  >
                    <Plus size={16} />
                    Add task
                  </Button>
                </div>
              )}
            </div>
          )
        })}

        {/* --- ADD NEW LIST BUTTON / FORM --- */}
        {canModifyBoard && (
          <div className="w-80 flex-shrink-0">
            {isAddingList ? (
              <form
                ref={formRef}
                onSubmit={handleCreateList}
                className="rounded-lg border bg-background p-3 shadow-sm"
              >
                <Input
                  autoFocus
                  placeholder="Enter list title..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="mb-3 h-9"
                />

                {/* Color Picker Row */}
                <div className="mb-4 flex gap-1.5 px-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewListColor(color)}
                      className={`h-5 w-5 rounded-full transition-all ${
                        newListColor === color
                          ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button type="submit" size="sm" disabled={isPending || !newListTitle.trim()}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add list"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingList(false)
                      setNewListTitle("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-dashed bg-transparent hover:bg-secondary/50"
                onClick={() => setIsAddingList(true)}
              >
                <Plus size={16} />
                Add another list
              </Button>
            )}
          </div>
        )}
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AlertDialog open={!!listToDelete} onOpenChange={() => setListToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this list?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the <strong>{listToDelete?.title}</strong> list? This
              will permanently remove the list and all of the tasks inside it. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDeleteList()
              }}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete List"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
