"use client"

import { Sun, Moon, Check } from "lucide-react"
import { useTheme } from "@/components/shared/theme-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AppearancePreferences } from "@/types/settings"

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

interface SettingsAppearanceProps {
  preferences: AppearancePreferences | null
  onSave: (data: AppearancePreferences) => Promise<any>
  isSaving: boolean
}

export function SettingsAppearance({ preferences, onSave, isSaving }: SettingsAppearanceProps) {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    setTheme(newTheme)
    await onSave({ theme: newTheme, language: preferences?.language || "en" })
  }

  const handleLanguageChange = async (language: string) => {
    await onSave({ theme: (theme as "light" | "dark") || "light", language })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize how the app looks and feels</p>
      </div>

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
