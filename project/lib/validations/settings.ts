import { z } from "zod"

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50).optional(),
  lastName: z.string().min(1, "Last name is required").max(50).optional(),
  role: z.string().max(50).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
})

export const notificationPreferencesSchema = z.object({
  taskAssigned: z.boolean(),
  taskCompleted: z.boolean(),
  taskCommented: z.boolean(),
  projectUpdated: z.boolean(),
  memberJoined: z.boolean(),
  invitationReceived: z.boolean(),
})

export const appearancePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.string().min(2).max(10),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>
export type AppearancePreferencesInput = z.infer<typeof appearancePreferencesSchema>
