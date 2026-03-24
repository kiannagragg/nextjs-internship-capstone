export type SettingsUser = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  imageUrl: string | null
  role: string | null
}

export type NotificationPreferences = {
  taskAssigned: boolean
  taskCompleted: boolean
  taskCommented: boolean
  projectUpdated: boolean
  memberJoined: boolean
  invitationReceived: boolean
}

export type AppearancePreferences = {
  theme: "light" | "dark" | "system"
  language: string
}

export type UserPreferences = {
  notifications: NotificationPreferences
  appearance: AppearancePreferences
}

export type SectionId = "profile" | "notifications" | "appearance" | "security"
