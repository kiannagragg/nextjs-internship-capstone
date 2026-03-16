"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, MoreHorizontal, Loader2, Trash2, Edit2, Lock } from "lucide-react"

import type { ListWithTasks } from "@/types"
import { useBoardStore } from "@/stores/board-store"
import { useTasks } from "@/hooks/use-tasks"
import { useLists } from "@/hooks/use-lists"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface KanbanBoardProps {
  project: any
  initialLists: any[]
  currentUserId: string
}

const PRESET_COLORS = ["#2D6EF7", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#64748B"]

export function KanbanBoard({ project, initialLists, currentUserId }: KanbanBoardProps) {
  const projectId = project?.id

  const { createTask, isPending: isTaskPending } = useTasks()
  const {
    lists: queryLists,
    createList,
    isCreatingList,
    updateList,
    isUpdatingList,
    deleteList,
    isDeletingList,
  } = useLists(projectId, initialLists)

  const { lists: storeLists, setBoardData } = useBoardStore()

  useEffect(() => {
    if (projectId && queryLists) {
      setBoardData(projectId, queryLists)
    }
  }, [projectId, queryLists, setBoardData])

  const userMembership = project?.members?.find((m: any) => m.userId === currentUserId)
  const userRole = userMembership?.role || "viewer"
  const canModifyBoard = userRole !== "viewer"

  // Check how many 'done' lists exist to enforce rules
  const doneListsCount = storeLists.filter((l) => l.type === "done").length
  const hasDoneList = doneListsCount > 0

  // Local UI State
  const [isAddingList, setIsAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState("")
  const [newListColor, setNewListColor] = useState(PRESET_COLORS[0])
  const [newListType, setNewListType] = useState<string>("custom")

  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editListTitle, setEditListTitle] = useState("")
  const [editListColor, setEditListColor] = useState("")
  const [editListType, setEditListType] = useState<string>("custom")

  // Updated state to track tasks count and migration target
  const [listToDelete, setListToDelete] = useState<{
    id: string
    title: string
    taskCount: number
  } | null>(null)
  const [migrationListId, setMigrationListId] = useState<string>("")

  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [addingTaskToListId, setAddingTaskToListId] = useState<string | null>(null)

  const taskInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (addingTaskToListId && taskInputRef.current) {
      taskInputRef.current.focus()
    }
  }, [addingTaskToListId])

  if (!project) return null

  // --- LIST ACTIONS ---
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListTitle.trim() || !projectId) return

    const title = newListTitle.trim()
    const color = newListColor || (PRESET_COLORS[0] as string)
    const type = newListType

    setNewListTitle("")
    setNewListColor(PRESET_COLORS[0])
    setNewListType("custom")
    setIsAddingList(false)

    await createList({ title, projectId, color, type })
  }

  const handleEditList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editListTitle.trim() || !editingListId) return

    const id = editingListId
    const title = editListTitle.trim()
    const color = editListColor
    const type = editListType

    setEditingListId(null)
    await updateList({ id, projectId, data: { title, color, type } })
  }

  const confirmDeleteList = async () => {
    if (!listToDelete) return
    const { id } = listToDelete

    // Only pass migrationListId if tasks exist and need moving
    const finalMigrationId = listToDelete.taskCount > 0 ? migrationListId : undefined

    setListToDelete(null)
    setMigrationListId("")

    await deleteList({ id, projectId, migrationListId: finalMigrationId })
  }

  const startEditing = (list: any) => {
    setEditingListId(list.id)
    setEditListTitle(list.title)
    setEditListColor(list.color || (PRESET_COLORS[0] as string))
    setEditListType(list.type || "custom")
  }

  // --- TASK ACTIONS ---
  const handleCreateTask = (listId: string) => {
    if (!newTaskTitle.trim()) return
    const title = newTaskTitle.trim()

    setNewTaskTitle("")
    setAddingTaskToListId(null)
    createTask(title, listId, projectId, currentUserId)
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

  return (
    <>
      <div className="flex h-full items-start gap-6 overflow-x-auto pb-4 pt-2">
        {storeLists.map((list: any) => {
          // Complex logic for deletion rules
          const isOnlyDoneList = list.type === "done" && doneListsCount <= 1
          const canDeleteThisList =
            !isOnlyDoneList &&
            (userRole === "admin" ||
              (userRole === "contributor" && list.createdById === currentUserId))

          return (
            <div
              key={list.id}
              className="flex max-h-full w-80 flex-shrink-0 flex-col rounded-xl border bg-secondary/30 shadow-sm"
            >
              {editingListId === list.id ? (
                <form
                  onSubmit={handleEditList}
                  className="rounded-t-xl border-b bg-background p-3 shadow-sm"
                >
                  <Input
                    autoFocus
                    value={editListTitle}
                    onChange={(e) => setEditListTitle(e.target.value)}
                    className="mb-2 h-8 text-sm font-medium text-foreground"
                  />

                  {/* Select Workflow Type */}
                  <Select value={editListType} onValueChange={setEditListType}>
                    <SelectTrigger className="mb-2 h-8 text-xs text-foreground">
                      <SelectValue placeholder="List Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done" disabled={hasDoneList && list.type !== "done"}>
                        Done
                      </SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="mb-3 flex gap-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditListColor(color)}
                        className={`h-5 w-5 flex-shrink-0 rounded-full border-2 transition-all ${
                          editListColor === color
                            ? "scale-110 border-foreground shadow-sm"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="h-7 flex-1 text-xs"
                      disabled={isUpdatingList}
                    >
                      {isUpdatingList ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 flex-1 text-xs text-foreground"
                      onClick={() => setEditingListId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex cursor-grab items-center justify-between p-3 active:cursor-grabbing">
                  <div className="flex items-center gap-2 font-semibold">
                    {list.color && (
                      <div
                        className="h-3 w-3 rounded-full shadow-sm"
                        style={{ backgroundColor: list.color }}
                      />
                    )}
                    <h3 className="flex items-center gap-2 text-lg text-foreground">
                      {list.title}
                      {list.isSystem && (
                        <span title="System Workflow List" className="flex items-center">
                          <Lock size={12} className="text-muted-foreground" />
                        </span>
                      )}
                    </h3>
                    <span className="flex h-5 items-center justify-center rounded-full bg-secondary px-2 text-xs font-medium text-muted-foreground">
                      {list.tasks?.length || 0}
                    </span>
                  </div>

                  {canModifyBoard && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-foreground hover:bg-secondary/80"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => startEditing(list as any)}>
                          <Edit2 size={14} className="mr-2" /> Edit List
                        </DropdownMenuItem>
                        {canDeleteThisList && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:bg-red-50 focus:text-red-600"
                              onClick={() =>
                                setListToDelete({
                                  id: list.id,
                                  title: list.title,
                                  taskCount: list.tasks?.length || 0,
                                })
                              }
                            >
                              <Trash2 size={14} className="mr-2" /> Delete List
                            </DropdownMenuItem>
                          </>
                        )}
                        {/* Show helper text if it's the last Done list */}
                        {isOnlyDoneList && (
                          <DropdownMenuItem
                            disabled
                            className="text-xs italic text-muted-foreground"
                          >
                            Cannot delete final &quot;Done&quot; list
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}

              <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-3 pt-0">
                {addingTaskToListId === list.id && (
                  <div className="mt-2 rounded-lg border bg-background p-2 shadow-sm">
                    <Textarea
                      ref={taskInputRef}
                      placeholder="Enter a title for this card..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => handleTaskKeyDown(e, list.id)}
                      className="min-h-[60px] resize-none border-none bg-transparent p-1 text-sm text-foreground shadow-none focus-visible:ring-0"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleCreateTask(list.id)}
                        disabled={isTaskPending || !newTaskTitle.trim()}
                      >
                        {isTaskPending ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          "Add Card"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-foreground"
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
              </div>

              {canModifyBoard && addingTaskToListId !== list.id && (
                <div className="p-2 pt-0">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    onClick={() => setAddingTaskToListId(list.id)}
                  >
                    <Plus size={16} /> Add a card
                  </Button>
                </div>
              )}
            </div>
          )
        })}

        {canModifyBoard && (
          <div className="w-80 flex-shrink-0">
            {isAddingList ? (
              <form
                onSubmit={handleCreateList}
                className="rounded-xl border bg-background p-3 shadow-sm"
              >
                <Input
                  autoFocus
                  placeholder="Enter list title..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="mb-3 h-9 text-sm text-foreground"
                />

                {/* Select Workflow Type for New List */}
                <Select value={newListType} onValueChange={setNewListType}>
                  <SelectTrigger className="mb-3 h-9 text-xs text-foreground">
                    <SelectValue placeholder="List Workflow Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done" disabled={hasDoneList}>
                      Done
                    </SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mb-3 flex gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewListColor(color)}
                      className={`h-5 w-5 flex-shrink-0 rounded-full border-2 transition-all ${
                        newListColor === color
                          ? "scale-110 border-foreground shadow-sm"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button type="submit" size="sm" disabled={isCreatingList || !newListTitle.trim()}>
                    {isCreatingList ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Add list"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-foreground"
                    onClick={() => {
                      setIsAddingList(false)
                      setNewListTitle("")
                      setNewListColor(PRESET_COLORS[0])
                      setNewListType("custom")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                className="h-12 w-full justify-start gap-2 rounded-xl border-dashed bg-secondary/30 text-foreground hover:bg-secondary/50"
                onClick={() => setIsAddingList(true)}
              >
                <Plus size={16} /> Add another list
              </Button>
            )}
          </div>
        )}
      </div>

      {/* SMART DELETION / TASK MIGRATION MODAL */}
      <AlertDialog
        open={!!listToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setListToDelete(null)
            setMigrationListId("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete List</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {listToDelete?.taskCount && listToDelete.taskCount > 0 ? (
                <div className="space-y-4">
                  <p>
                    This list contains <strong>{listToDelete.taskCount} tasks</strong>. Deleting it
                    will also delete those tasks unless you migrate them. Where should we move them?
                  </p>
                  <Select value={migrationListId} onValueChange={setMigrationListId}>
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Select destination list..." />
                    </SelectTrigger>
                    <SelectContent>
                      {storeLists
                        .filter((l) => l.id !== listToDelete.id)
                        .map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  Are you sure you want to delete the <strong>{listToDelete?.title}</strong> list?
                  This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground" disabled={isDeletingList}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDeleteList()
              }}
              // Disable deletion if there are tasks but no migration destination selected
              disabled={
                isDeletingList ||
                (listToDelete?.taskCount ? listToDelete.taskCount > 0 && !migrationListId : false)
              }
              className="bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50"
            >
              {isDeletingList ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete List"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
