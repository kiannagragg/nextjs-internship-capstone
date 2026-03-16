// TODO: Task 4.4 - Build task creation and editing functionality
// TODO: Task 5.4 - Implement optimistic UI updates for smooth interactions

/*
TODO: Implementation Notes for Interns:

Custom hook for task data management:
- Fetch tasks for a project
- Create new task
- Update task
- Delete task
- Move task between lists
- Bulk operations

Features:
- Optimistic updates for smooth UX
- Real-time synchronization
- Conflict resolution
- Undo functionality
- Batch operations

Example structure:
export function useTasks(projectId: string) {
  const queryClient = useQueryClient()
  
  const {
    data: tasks,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => queries.tasks.getByProject(projectId),
    enabled: !!projectId
  })
  
  const createTask = useMutation({
    mutationFn: queries.tasks.create,
    onMutate: async (newTask) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] })
      const previousTasks = queryClient.getQueryData(['tasks', projectId])
      queryClient.setQueryData(['tasks', projectId], (old: Task[]) => [...old, { ...newTask, id: 'temp-' + Date.now() }])
      return { previousTasks }
    },
    onError: (err, newTask, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks', projectId], context?.previousTasks)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    }
  })
  
  return {
    tasks,
    isLoading,
    error,
    createTask: createTask.mutate,
    isCreating: createTask.isPending
  }
}
*/

// Placeholder to prevent import errors
import { useTransition } from "react"
import { useBoardStore } from "@/stores/board-store"
import { createTaskAction, deleteTaskAction } from "@/lib/actions/tasks"
import { useToast } from "@/hooks/use-toast"
import type { TaskWithAssignees } from "@/types"

export function useTasks() {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // Bring in your Zustand store actions
  const { addTaskOptimistic, removeTaskOptimistic, lists } = useBoardStore()

  const createTask = (title: string, listId: string, projectId: string, currentUserId: string) => {
    const tempTaskId = `temp-${crypto.randomUUID()}`

    // 1. Optimistic Update Payload
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

    // Instantly update UI
    addTaskOptimistic(listId, optimisticTask)

    // 2. Server Action
    startTransition(async () => {
      const result = await createTaskAction({ title, listId, projectId })

      if (result?.error) {
        // Rollback on error
        removeTaskOptimistic(tempTaskId)
        toast({
          variant: "destructive",
          title: "Failed to create task",
          description: result.error,
        })
      }
    })
  }

  const deleteTask = (taskId: string, projectId: string) => {
    // 1. Optimistic Update
    removeTaskOptimistic(taskId)

    // 2. Server Action
    startTransition(async () => {
      const result = await deleteTaskAction(taskId, projectId)

      if (result?.error) {
        // If it fails, ideally we'd re-sync the board data to get the task back
        toast({
          variant: "destructive",
          title: "Failed to delete task",
          description: result.error,
        })
      } else {
        toast({
          title: "Task deleted",
          description: "Task has been removed successfully.",
        })
      }
    })
  }

  return { createTask, deleteTask, isPending }
}
