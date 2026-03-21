/* ============================================
   Settings Queries

   Profile updates and user preferences.
   ============================================ */
import { clerkClient } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import type { UserPreferences } from "@/lib/db/schema"

/**
 * Update user profile fields (first name, last name, professional role, avatar).
 */
export async function updateUserProfile(
  userId: string,
  data: {
    firstName?: string
    lastName?: string
    role?: string | null
    imageUrl?: string | null
  }
) {
  const [updated] = await db.update(users).set(data).where(eq(users.id, userId)).returning()

  if (!updated) return null

  // 2. Sync name to Clerk so the UserButton reflects changes
  try {
    const clerk = await clerkClient()
    await clerk.users.updateUser(updated.clerkId, {
      firstName: data.firstName ?? undefined,
      lastName: data.lastName ?? undefined,
    })
  } catch (error) {
    // Non-critical — DB is updated, Clerk sync failed
    //console.error("[updateUserProfile] Clerk sync failed:", error)
  }

  return updated
}
/**
 * Get the user's full preferences, merged with defaults.
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const { DEFAULT_USER_PREFERENCES } = await import("@/lib/db/schema")

  const [user] = await db
    .select({ preferences: users.preferences })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const stored = (user?.preferences as Partial<UserPreferences>) || {}

  // Deep merge with defaults so new preference keys are always present
  return {
    notifications: {
      ...DEFAULT_USER_PREFERENCES.notifications,
      ...stored.notifications,
    },
    appearance: {
      ...DEFAULT_USER_PREFERENCES.appearance,
      ...stored.appearance,
    },
  }
}

/**
 * Update notification preferences.
 */
export async function updateNotificationPreferences(
  userId: string,
  notificationPrefs: UserPreferences["notifications"]
) {
  const current = await getUserPreferences(userId)

  const updated: UserPreferences = {
    ...current,
    notifications: notificationPrefs,
  }

  const [result] = await db
    .update(users)
    .set({ preferences: updated })
    .where(eq(users.id, userId))
    .returning()

  return result ?? null
}

/**
 * Update appearance preferences (theme, language).
 */
export async function updateAppearancePreferences(
  userId: string,
  appearancePrefs: UserPreferences["appearance"]
) {
  const current = await getUserPreferences(userId)

  const updated: UserPreferences = {
    ...current,
    appearance: appearancePrefs,
  }

  const [result] = await db
    .update(users)
    .set({ preferences: updated })
    .where(eq(users.id, userId))
    .returning()

  return result ?? null
}

/**
 * Check if a user has a specific notification enabled.
 * Used before creating notifications.
 */
export async function isNotificationEnabled(
  userId: string,
  notificationType: keyof UserPreferences["notifications"]
): Promise<boolean> {
  const prefs = await getUserPreferences(userId)
  return prefs.notifications[notificationType] ?? true
}
