"use client"

import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Menu, Bell } from "lucide-react"

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Spacer — pushes right actions to the end */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Bell size={18} />
        </button>

        {/* Avatar — replace with Clerk <UserButton /> in Phase 2 */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          KG
        </div>
      </div>
    </header>
  )
}
