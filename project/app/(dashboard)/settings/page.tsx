"use client"

import { useState } from "react"
import { UserProfile } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { User, Bell, Shield, Palette, Loader2, Sun, Moon, Check } from "lucide-react"
import { useTheme } from "@/components/shared/theme-provider"

import { useSettings } from "@/hooks/use-settings"

import { Button } from "@/components/ui/button"
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
  { id: "security", label: "Account & Security", icon: Shield },
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
        <nav className="h-fit rounded-xl border border-border bg-card p-3">
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
  const extractRole = (u: any) => {
    if (!u) return ""
    const rawRole = u.publicMetadata?.role || u.unsafeMetadata?.role || u.role || ""
    const matchedRole = PROFESSIONAL_ROLES.find((r) => r.toLowerCase() === rawRole.toLowerCase())
    return matchedRole || rawRole
  }

  const [role, setRole] = useState(() => extractRole(user))
  const [prevUserId, setPrevUserId] = useState(user?.id)

  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id)
    setRole(extractRole(user))
  }

  const hasChanges = role !== extractRole(user)

  const handleSave = async () => {
    await onSave({
      role: role.trim() || null,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">App Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your application-specific details</p>
      </div>

      {/* Professional Role */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Professional Role</label>
        <Select
          value={role || "none"}
          onValueChange={(val) => setRole(val === "none" ? "" : val)}
          disabled={isSaving}
        >
          <SelectTrigger className="text-foreground sm:w-[280px]">
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
          onClick={() => setRole(extractRole(user))}
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
      </div>
    </div>
  )
}

/* ==================== SECURITY / ACCOUNT SECTION ==================== */

function SecuritySection() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  if (!mounted) {
    setMounted(true)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Account & Security</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal details, password, and active sessions securely.
        </p>
      </div>

      <style jsx global>{`
        .dark .cl-rootBox {
          color: #f5f5f5;
        }
        .dark .cl-rootBox h1,
        .dark .cl-rootBox h2,
        .dark .cl-rootBox h3 {
          color: #f5f5f5;
        }
        .dark .cl-rootBox p,
        .dark .cl-rootBox span,
        .dark .cl-rootBox label {
          color: #d4d4d4;
        }
        .dark .cl-rootBox [class^="cl-internal-"] {
          color: inherit;
        }
      `}</style>

      <div className="flex justify-start rounded-xl">
        <UserProfile
          key={`clerk-profile-${theme}`}
          routing="hash"
          appearance={{
            baseTheme: isDark ? dark : undefined,
            variables: isDark
              ? {
                  colorBackground: "#1a1a1a",
                  colorText: "#f5f5f5",
                  colorTextSecondary: "#a3a3a3",
                  colorInputBackground: "#262626",
                  colorInputText: "#f5f5f5",
                  colorPrimary: "#3b82f6",
                  colorDanger: "#ef4444",
                  colorNeutral: "#d4d4d4",
                }
              : undefined,
            elements: {
              rootBox: "w-full max-w-none shadow-none",
              cardBox: "w-full max-w-none shadow-none border-none bg-transparent",
              navbar: "block",
              pageScrollBox: "p-4",
              ...(isDark && {
                formFieldLabel: { color: "#d4d4d4" },
                formFieldInput: {
                  backgroundColor: "#262626",
                  borderColor: "#404040",
                  color: "#f5f5f5",
                },
                headerTitle: { color: "#f5f5f5" },
                headerSubtitle: { color: "#a3a3a3" },
                profileSectionTitle: { color: "#f5f5f5" },
                profileSectionTitleText: { color: "#f5f5f5" },
                profileSectionContent: { color: "#d4d4d4" },
                profileSectionPrimaryButton: { color: "#f5f5f5" },
                userPreviewMainIdentifier: { color: "#f5f5f5" },
                userPreviewSecondaryIdentifier: { color: "#f5f5f5" },
                navbarButton: { color: "#d4d4d4" },
                navbarButtonActive: { color: "#f5f5f5" },
                badge: { color: "#d4d4d4", backgroundColor: "#333333" },
                menuButton: { color: "#d4d4d4" },
                menuItem: { color: "#d4d4d4" },
                accordionTriggerButton: { color: "#d4d4d4" },
                accordionContent: { color: "#d4d4d4" },
                activeDeviceListItem: { color: "#d4d4d4" },
                activeDevice: { color: "#d4d4d4" },
                deviceInfo: { color: "#a3a3a3" },
              }),
            },
          }}
        />
      </div>
    </div>
  )
}
