"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import {
  createListAction,
  deleteListAction,
  updateListAction,
  getProjectListsAction,
  moveListAction,
} from "@/lib/actions/lists"
import type { ListWithTasks } from "@/types"

export function useLists(projectId: string, initialData?: ListWithTasks[]) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const queryKey = ["project-lists", projectId]

  // Fetch Lists Query
  const {
    data: lists = [],
    isLoading: isLoadingLists,
    isError: isErrorLists,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!projectId) return []
      const result = await getProjectListsAction(projectId)
      if (result.error) throw new Error(result.error)
      return result.data || []
    },
    enabled: !!projectId,
    initialData,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { title: string; projectId: string; color: string; type: any }) =>
      createListAction(data),
    onSuccess: (result) => {
      if (result?.error) {
        toast({ variant: "destructive", title: "Creation failed", description: result.error })
        return
      }
      queryClient.invalidateQueries({ queryKey })
      toast({ title: "List created!" })
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Creation failed", description: err.message })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, projectId, data }: any) => updateListAction(id, projectId, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousLists = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: any) =>
        old?.map((list: any) => (list.id === id ? { ...list, ...data } : list))
      )
      return { previousLists }
    },
    onSuccess: (result) => {
      if (result?.error) {
        queryClient.invalidateQueries({ queryKey })
        toast({ variant: "destructive", title: "Update failed", description: result.error })
      } else {
        toast({
          title: "List updated",
          description: "Your changes have been saved successfully.",
        })
      }
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(queryKey, context?.previousLists)
      toast({ variant: "destructive", title: "Update failed", description: err.message })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, projectId, migrationListId }: any) =>
      deleteListAction(id, projectId, migrationListId),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousLists = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: any) => old?.filter((list: any) => list.id !== id))
      return { previousLists }
    },
    onSuccess: (result) => {
      if (result?.error) throw new Error(result.error)
      toast({ title: "List deleted" })
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(queryKey, context?.previousLists)
      toast({ variant: "destructive", title: "Deletion failed", description: err.message })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  const moveMutation = useMutation({
    mutationFn: ({ listId, position }: { listId: string; position: number }) =>
      moveListAction(listId, projectId, position),
    onMutate: async ({ listId, position }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousLists = queryClient.getQueryData<ListWithTasks[]>(queryKey)

      queryClient.setQueryData<ListWithTasks[]>(queryKey, (old) => {
        if (!old) return []

        // Optimistically update the list's position and re-sort the array
        const updatedLists = old.map((list) => (list.id === listId ? { ...list, position } : list))
        return updatedLists.sort((a, b) => a.position - b.position)
      })

      return { previousLists }
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(queryKey, context?.previousLists)
      toast({ variant: "destructive", title: "Failed to move list", description: err.message })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    lists,
    isLoadingLists,
    isErrorLists,
    createList: createMutation.mutateAsync,
    isCreatingList: createMutation.isPending,
    updateList: updateMutation.mutateAsync,
    isUpdatingList: updateMutation.isPending,
    deleteList: deleteMutation.mutateAsync,
    isDeletingList: deleteMutation.isPending,
    moveList: moveMutation.mutateAsync,
    isMovingList: moveMutation.isPending,
  }
}
