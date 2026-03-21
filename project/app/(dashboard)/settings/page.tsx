"use client"

import { useState } from "react"
import {
  User,
  Bell,
  Shield,
  Palette,
  Loader2,
  Camera,
  ExternalLink,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react"
import { useTheme } from "@/components/shared/theme-provider"

import { useSettings } from "@/hooks/use-settings"
import { UserAvatar } from "@/components/shared/user-avatar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/* ==================== CONSTANTS ==================== */

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

const PROFESSIONAL_ROLES = [
  "Project Manager",
  "Developer",
  "Designer",
  "QA Engineer",
  "DevOps Engineer",
  "Data Analyst",
  "Product Owner",
  "Scrum Master",
  "Other",
]

const NOTIFICATION_OPTIONS = [
  {
    key: "taskAssigned" as const,
    label: "Task assigned to me",
    description: "When someone assigns you to a task",
  },
  {
    key: "taskCompleted" as const,
    label: "Task completed",
    description: "When a task you're assigned to is completed",
  },
  {
    key: "taskCommented" as const,
    label: "Task comments",
    description: "When someone comments on your task",
  },
  {
    key: "projectUpdated" as const,
    label: "Project updates",
    description: "When a project you're in is updated",
  },
  {
    key: "memberJoined" as const,
    label: "New members",
    description: "When someone joins your project",
  },
  {
    key: "invitationReceived" as const,
    label: "Invitations",
    description: "When you receive a project invitation",
  },
]

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
] as const

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
  { value: "fil", label: "Filipino" },
]

/* ==================== COMPONENT ==================== */

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("profile")

  const {
    user,
    preferences,
    isLoading,
    updateProfile,
    isUpdatingProfile,
    updateNotifications,
    isUpdatingNotifications,
    updateAppearance,
    isUpdatingAppearance,
  } = useSettings()

  const { setTheme, theme: currentTheme } = useTheme()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      {/* Layout: Nav + Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Navigation */}
        <nav className="rounded-xl border border-border bg-card p-3">
          <div className="space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="rounded-xl border border-border bg-card p-6">
          {activeSection === "profile" && (
            <ProfileSection user={user} onSave={updateProfile} isSaving={isUpdatingProfile} />
          )}
          {activeSection === "notifications" && (
            <NotificationsSection
              preferences={preferences?.notifications}
              onSave={updateNotifications}
              isSaving={isUpdatingNotifications}
            />
          )}
          {activeSection === "appearance" && (
            <AppearanceSection
              preferences={preferences?.appearance}
              onSave={updateAppearance}
              isSaving={isUpdatingAppearance}
            />
          )}
          {activeSection === "security" && <SecuritySection />}
        </div>
      </div>
    </div>
  )
}

/* ==================== PROFILE SECTION ==================== */

function ProfileSection({
  user,
  onSave,
  isSaving,
}: {
  user: any
  onSave: (data: any) => Promise<any>
  isSaving: boolean
}) {
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [role, setRole] = useState(user?.role || "")

  const [prevUserId, setPrevUserId] = useState(user?.id)
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id)
    setFirstName(user?.firstName || "")
    setLastName(user?.lastName || "")
    setRole(user?.role || "")
  }

  const hasChanges =
    firstName !== (user?.firstName || "") ||
    lastName !== (user?.lastName || "") ||
    role !== (user?.role || "")

  const handleSave = async () => {
    await onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role.trim() || null,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your personal information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="2xl" />
        <div>
          <p className="text-sm font-medium text-foreground">Profile Photo</p>
          <p className="text-xs text-muted-foreground">
            Managed through Clerk. Click your avatar in the top-right to change it.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">First Name</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            disabled={isSaving}
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Last Name</label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            disabled={isSaving}
            className="text-foreground"
          />
        </div>
      </div>

      {/* Email — read-only */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email</label>
        <Input value={user?.email || ""} disabled className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Email is managed by Clerk and cannot be changed here.
        </p>
      </div>

      {/* Professional Role */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Professional Role</label>
        <Select
          value={role || "none"}
          onValueChange={(val) => setRole(val === "none" ? "" : val)}
          disabled={isSaving}
        >
          <SelectTrigger className="text-foreground">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No role selected</SelectItem>
            {PROFESSIONAL_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Button
          variant="outline"
          className="text-foreground"
          onClick={() => {
            setFirstName(user?.firstName || "")
            setLastName(user?.lastName || "")
            setRole(user?.role || "")
          }}
          disabled={isSaving || !hasChanges}
        >
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}

/* ==================== NOTIFICATIONS SECTION ==================== */

function NotificationsSection({
  preferences,
  onSave,
  isSaving,
}: {
  preferences: any
  onSave: (data: any) => Promise<any>
  isSaving: boolean
}) {
  const handleToggle = async (key: string, value: boolean) => {
    const updated = { ...preferences, [key]: value }
    await onSave(updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground">Choose what you want to be notified about</p>
      </div>

      <div className="space-y-1">
        {NOTIFICATION_OPTIONS.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-muted/50"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
            <Switch
              checked={preferences?.[option.key] ?? true}
              onCheckedChange={(checked) => handleToggle(option.key, checked)}
              disabled={isSaving}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ==================== APPEARANCE SECTION ==================== */

function AppearanceSection({
  preferences,
  onSave,
  isSaving,
}: {
  preferences: any
  onSave: (data: any) => Promise<any>
  isSaving: boolean
}) {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    setTheme(newTheme)
    await onSave({ theme: newTheme, language: preferences?.language || "en" })
  }

  const handleLanguageChange = async (language: string) => {
    await onSave({ theme: preferences?.theme || "system", language })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize how the app looks and feels</p>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((option) => {
            const isActive = theme === option.value
            return (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                disabled={isSaving}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <option.icon
                  className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  {option.label}
                </span>
                {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Language</label>
        <Select
          value={preferences?.language || "en"}
          onValueChange={handleLanguageChange}
          disabled={isSaving}
        >
          <SelectTrigger className="w-full text-foreground sm:w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Language preference is saved but full internationalization is not yet implemented.
        </p>
      </div>
    </div>
  )
}

/* ==================== SECURITY SECTION ==================== */

function SecuritySection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground">
          Authentication and security settings are managed through Clerk
        </p>
      </div>

      <div className="space-y-4">
        {[
          { label: "Password", description: "Change your password or add a new one" },
          { label: "Two-factor authentication", description: "Add an extra layer of security" },
          { label: "Email addresses", description: "Manage your email addresses" },
          { label: "Active sessions", description: "Manage active sessions across devices" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-foreground"
              onClick={() => {
                // Open Clerk's user profile modal
                if (typeof window !== "undefined" && (window as any).Clerk) {
                  ;(window as any).Clerk.openUserProfile()
                }
              }}
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Manage
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-destructive/30 p-4">
        <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Account deletion is handled through Clerk. This action is permanent.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).Clerk) {
              ;(window as any).Clerk.openUserProfile()
            }
          }}
        >
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
          Manage Account
        </Button>
      </div>
    </div>
  )
}
