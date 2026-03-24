import type { Metadata } from "next"
import { SettingsDashboard } from "@/components/features/settings/settings-dashboard"

export const metadata: Metadata = {
  title: "Settings | FLOE.",
  description: "Manage your account and application preferences",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      {/* Interactive settings — client component */}
      <SettingsDashboard />
    </div>
  )
}
