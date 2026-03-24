"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { UserProfile } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "@/components/shared/theme-provider"

export function SettingsSecurity() {
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

      <div className="flex justify-start rounded-xl">
        <UserProfile
          key={`clerk-profile-${theme}`}
          routing="hash"
          appearance={{
            theme: isDark ? dark : undefined,
            variables: isDark
              ? {
                  colorBackground: "#1a1a1a",
                  colorForeground: "#f5f5f5",
                  colorMuted: "#a3a3a3",
                  colorInput: "#262626",
                  colorInputForeground: "#f5f5f5",
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
                navbar: { backgroundColor: "#1a1a1a" },
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
