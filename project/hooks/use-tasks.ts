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
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  moveTaskAction,
  rebalanceTasksAction,
} from "@/lib/actions/tasks"
import type { ListWithTasks, TaskWithAssignees } from "@/types"

export function useTasks(projectId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const queryKey = ["project-lists", projectId]

  const createMutation = useMutation({
    mutationFn: (data: any) => createTaskAction(data),
    onMutate: async (newTaskData) => {
      await queryClient.cancelQueries({ queryKey })
      const previousLists = queryClient.getQueryData<ListWithTasks[]>(queryKey)

      const tempTask: TaskWithAssignees = {
        id: `temp-${Date.now()}`,
        title: newTaskData.title,
        description: newTaskData.description || null,
        priority: newTaskData.priority || "medium",
        position: 999999,
        isCompleted: false,
        completedAt: null,
        startDate: null,
        dueDate: null,
        listId: newTaskData.listId,
        projectId: newTaskData.projectId,
        createdById: "temp-user",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        assignees: [],
        labels: [],
      }

      queryClient.setQueryData<ListWithTasks[]>(queryKey, (old) => {
        if (!old) return []
        return old.map((list) => {
          if (list.id === newTaskData.listId) {
            return { ...list, tasks: [...list.tasks, tempTask] }
          }
          return list
        })
      })

      return { previousLists }
    },
    onSuccess: (result) => {
      if (result?.error) throw new Error(result.error)
      queryClient.invalidateQueries({ queryKey })
      toast({ title: "Task created" })
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(queryKey, context?.previousLists)
      toast({ variant: "destructive", title: "Failed to create task", description: err.message })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) =>
      updateTaskAction(taskId, projectId, data),
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousLists = queryClient.getQueryData<ListWithTasks[]>(queryKey)

      queryClient.setQueryData<ListWithTasks[]>(queryKey, (old) => {
        if (!old) return []
        return old.map((list) => ({
          ...list,
          tasks: list.tasks.map((task) => (task.id === taskId ? { ...task, ...data } : task)),
        }))
      })

      return { previousLists }
    },
    onSuccess: (result) => {
      if (result?.error) throw new Error(result.error)
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(queryKey, context?.previousLists)
      toast({ variant: "destructive", title: "Failed to update task", description: err.message })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTaskAction(taskId, projectId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey })
      const previousLists = queryClient.getQueryData<ListWithTasks[]>(queryKey)

      queryClient.setQueryData<ListWithTasks[]>(queryKey, (old) => {
        if (!old) return []
        return old.map((list) => ({
          ...list,
          tasks: list.tasks.filter((task) => task.id !== taskId),
        }))
      })

      return { previousLists }
    },
    onSuccess: (result) => {
      if (result?.error) throw new Error(result.error)
      toast({ title: "Task deleted" })
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(queryKey, context?.previousLists)
      toast({ variant: "destructive", title: "Failed to delete task", description: err.message })
    },
  })

  const moveMutation = useMutation({
    // 1. Check for the server error HERE so React Query catches it
    mutationFn: async (data: { taskId: string; listId: string; position: number }) => {
      // Note: If your Server Action schema expects projectId inside the object,
      // change `data` to `{ ...data, projectId }`
      const result = await moveTaskAction(data, projectId)

      if (result?.error) {
        throw new Error(result.error) // This now correctly triggers onError!
      }

      return result
    },
    onMutate: async ({ taskId, listId, position }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousLists = queryClient.getQueryData<ListWithTasks[]>(queryKey)

      queryClient.setQueryData<ListWithTasks[]>(queryKey, (old) => {
        if (!old) return []

        let taskToMove: TaskWithAssignees | undefined
        old.forEach((list) => {
          const found = list.tasks.find((t) => t.id === taskId)
          if (found) taskToMove = { ...found, listId: listId, position }
        })

        if (!taskToMove) return old

        // Remove from old list, add to new list, and sort
        return old.map((list) => {
          let newTasks = list.tasks.filter((t) => t.id !== taskId)

          if (list.id === listId) {
            newTasks.push(taskToMove!)
            newTasks.sort((a, b) => a.position - b.position)
          }

          return { ...list, tasks: newTasks }
        })
      })

      return { previousLists }
    },
    onSuccess: () => {
      // 2. Clean success block - only runs if no error was thrown above
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: any, _, context) => {
      // 3. This will finally run and show us the ghost!
      queryClient.setQueryData(queryKey, context?.previousLists)
      toast({ variant: "destructive", title: "Failed to move task", description: err.message })
    },
  })

  const rebalanceMutation = useMutation({
    mutationFn: (listId: string) => rebalanceTasksAction(listId, projectId),
    onSuccess: (result) => {
      if (result?.error) throw new Error(result.error)
      // Force the UI to refetch the freshly spaced tasks
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Background sync failed",
        description: "Failed to rebalance task positions, but your tasks are still safe.",
      })
    },
  })

  return {
    createTask: createMutation.mutateAsync,
    isCreatingTask: createMutation.isPending,
    updateTask: updateMutation.mutateAsync,
    isUpdatingTask: updateMutation.isPending,
    deleteTask: deleteMutation.mutateAsync,
    isDeletingTask: deleteMutation.isPending,
    moveTask: moveMutation.mutateAsync,
    isMovingTask: moveMutation.isPending,
    rebalanceTasks: rebalanceMutation.mutateAsync,
    isRebalancing: rebalanceMutation.isPending,
  }
}
