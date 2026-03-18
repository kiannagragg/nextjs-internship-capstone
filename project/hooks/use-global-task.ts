import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { createTaskAction } from "@/lib/actions/tasks"
import { useUIStore } from "@/stores/ui-store"

export function useGlobalTaskCreator() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { closeCreateTaskModal } = useUIStore()

  const createGlobalTask = useMutation({
    mutationFn: async (formData: FormData) => {
      // NOTE: For now, backend doesn't support FormData yet
      return createTaskAction(formData)
    },
    onSuccess: (result: any, variables: FormData) => {
      if (result?.error) throw new Error(result.error)
      const projectId = variables.get("projectId") as string

      queryClient.invalidateQueries({ queryKey: ["projects"] })

      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["project-lists", projectId] })
      }

      toast({ title: "Task created successfully!" })
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

  return { createGlobalTask }
}
