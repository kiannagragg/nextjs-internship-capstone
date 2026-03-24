"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"

import { SettingsNav } from "@/components/features/settings/settings-nav"
import { SettingsProfile } from "@/components/features/settings/settings-profile"
import { SettingsNotifications } from "@/components/features/settings/settings-notifications"
import { SettingsAppearance } from "@/components/features/settings/settings-appearance"
import { SettingsSecurity } from "@/components/features/settings/settings-security"

import type { SectionId, SettingsUser } from "@/types/settings"

export function SettingsDashboard() {
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <SettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="rounded-xl border border-border bg-card p-6">
        {activeSection === "profile" && (
          <SettingsProfile
            user={user as SettingsUser | null}
            onSave={updateProfile}
            isSaving={isUpdatingProfile}
          />
        )}
        {activeSection === "notifications" && (
          <SettingsNotifications
            preferences={preferences?.notifications ?? null}
            onSave={updateNotifications}
            isSaving={isUpdatingNotifications}
          />
        )}
        {activeSection === "appearance" && (
          <SettingsAppearance
            preferences={preferences?.appearance ?? null}
            onSave={updateAppearance}
            isSaving={isUpdatingAppearance}
          />
        )}
        {activeSection === "security" && <SettingsSecurity />}
      </div>
    </div>
  )
}
