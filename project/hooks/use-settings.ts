"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import {
  getUserPreferencesAction,
  updateProfileAction,
  updateNotificationPreferencesAction,
  updateAppearancePreferencesAction,
} from "@/lib/actions/settings"
import { getCurrentDbUserAction } from "@/lib/actions/users"

export function useSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Current user profile
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["current-db-user"],
    queryFn: async () => {
      const result = await getCurrentDbUserAction()
      if (result.error) throw new Error(result.error)
      return result.data
    },
    staleTime: Infinity,
  })

  // Preferences
  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      const result = await getUserPreferencesAction()
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    staleTime: 60_000,
  })

  // Update profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => updateProfileAction(data),
    onSuccess: (result) => {
      if (!result.success) {
        toast({ variant: "destructive", title: "Failed", description: result.error })
        return
      }
      queryClient.invalidateQueries({ queryKey: ["current-db-user"] })
      toast({ title: "Profile updated" })
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Failed", description: err.message })
    },
  })

  // Update notification preferences
  const updateNotificationsMutation = useMutation({
    mutationFn: (data: any) => updateNotificationPreferencesAction(data),
    onMutate: async (newPrefs) => {
      await queryClient.cancelQueries({ queryKey: ["user-preferences"] })
      const previous = queryClient.getQueryData(["user-preferences"])
      queryClient.setQueryData(["user-preferences"], (old: any) =>
        old ? { ...old, notifications: newPrefs } : old
      )
      return { previous }
    },
    onSuccess: (result, _, context) => {
      if (!result.success) {
        queryClient.setQueryData(["user-preferences"], context?.previous)
        toast({ variant: "destructive", title: "Failed", description: result.error })
        return
      }
      toast({ title: "Notification preferences updated" })
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(["user-preferences"], context?.previous)
      toast({ variant: "destructive", title: "Failed", description: err.message })
    },
  })

  // Update appearance preferences
  const updateAppearanceMutation = useMutation({
    mutationFn: (data: any) => updateAppearancePreferencesAction(data),
    onMutate: async (newPrefs) => {
      await queryClient.cancelQueries({ queryKey: ["user-preferences"] })
      const previous = queryClient.getQueryData(["user-preferences"])
      queryClient.setQueryData(["user-preferences"], (old: any) =>
        old ? { ...old, appearance: newPrefs } : old
      )
      return { previous }
    },
    onSuccess: (result, _, context) => {
      if (!result.success) {
        queryClient.setQueryData(["user-preferences"], context?.previous)
        toast({ variant: "destructive", title: "Failed", description: result.error })
        return
      }
      toast({ title: "Appearance updated" })
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(["user-preferences"], context?.previous)
      toast({ variant: "destructive", title: "Failed", description: err.message })
    },
  })

  return {
    user: user ?? null,
    preferences: preferences ?? null,
    isLoading: isLoadingUser || isLoadingPreferences,

    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,

    updateNotifications: updateNotificationsMutation.mutateAsync,
    isUpdatingNotifications: updateNotificationsMutation.isPending,

    updateAppearance: updateAppearanceMutation.mutateAsync,
    isUpdatingAppearance: updateAppearanceMutation.isPending,
  }
}
