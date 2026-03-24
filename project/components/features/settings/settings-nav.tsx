"use client"

import { User, Bell, Shield, Palette } from "lucide-react"
import type { SectionId } from "@/types/settings"

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Account & Security", icon: Shield },
]

interface SettingsNavProps {
  activeSection: SectionId
  onSectionChange: (section: SectionId) => void
}

export function SettingsNav({ activeSection, onSectionChange }: SettingsNavProps) {
  return (
    <nav className="h-fit rounded-xl border border-border bg-card p-3">
      <div className="space-y-1">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
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
  )
}
