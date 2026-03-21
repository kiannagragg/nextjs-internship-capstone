"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import {
  updateUserProfile,
  getUserPreferences,
  updateNotificationPreferences,
  updateAppearancePreferences,
} from "@/lib/db/queries/settings"
import {
  updateProfileSchema,
  notificationPreferencesSchema,
  appearancePreferencesSchema,
} from "@/lib/validations/settings"

/**
 * Get current user's preferences.
 */
export async function getUserPreferencesAction() {
  try {
    const { dbUserId: userId } = await requireAuth()
    const preferences = await getUserPreferences(userId)
    return { success: true, data: preferences }
  } catch (error) {
    return { success: false, error: "Failed to load preferences." }
  }
}

/**
 * Update profile (first name, last name, role, avatar).
 */
export async function updateProfileAction(data: unknown) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const parsed = updateProfileSchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    const updated = await updateUserProfile(userId, parsed.data)

    revalidatePath("/settings", "layout")
    revalidatePath("/", "layout")

    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: "Failed to update profile." }
  }
}

/**
 * Update notification preferences.
 */
export async function updateNotificationPreferencesAction(data: unknown) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const parsed = notificationPreferencesSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: "Invalid notification preferences." }
    }

    await updateNotificationPreferences(userId, parsed.data)

    revalidatePath("/settings", "layout")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update notification preferences." }
  }
}

/**
 * Update appearance preferences (theme, language).
 */
export async function updateAppearancePreferencesAction(data: unknown) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const parsed = appearancePreferencesSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: "Invalid appearance settings." }
    }

    await updateAppearancePreferences(userId, parsed.data)

    revalidatePath("/settings", "layout")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update appearance." }
  }
}
