"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SettingsUser } from "@/types/settings"

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

interface SettingsProfileProps {
  user: SettingsUser | null
  onSave: (data: { role: string | null }) => Promise<any>
  isSaving: boolean
}

export function SettingsProfile({ user, onSave, isSaving }: SettingsProfileProps) {
  const extractRole = (u: SettingsUser | null) => {
    if (!u) return ""
    const rawRole = u.role || ""
    const matched = PROFESSIONAL_ROLES.find((r) => r.toLowerCase() === rawRole.toLowerCase())
    return matched || rawRole
  }

  const [role, setRole] = useState(() => extractRole(user))

  const [prevUserId, setPrevUserId] = useState(user?.id)
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id)
    setRole(extractRole(user))
  }

  const hasChanges = role !== extractRole(user)

  const handleSave = async () => {
    await onSave({ role: role.trim() || null })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">App Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your application-specific details</p>
      </div>

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
