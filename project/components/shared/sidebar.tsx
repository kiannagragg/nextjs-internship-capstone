"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderOpen, Users, Settings, X, BarChart3, Calendar } from "lucide-react"

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Team", href: "/team", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
]

const bottomNavItems = [{ name: "Settings", href: "/settings", icon: Settings }]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-border bg-background transition-transform duration-200 ease-in-out lg:static lg:w-[68px] lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} `}
    >
      {/* Logo area */}
      <div className="flex h-16 items-center justify-between px-4 lg:justify-center lg:px-0">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"
        >
          {/* FLOE logo: sine-wave S-curve */}
          <svg viewBox="0 0 40 40" fill="none" className="h-6 w-6">
            <path
              d="M3.33325 20C6.66659 35 16.6666 35 19.9999 20C23.3333 5 33.3333 5 36.6666 20"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-primary-foreground"
            />
          </svg>
        </Link>

        {/* Close — mobile only */}
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex flex-1 flex-col justify-between px-2 pb-4 lg:px-0">
        {/* Main items */}
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:flex-col lg:gap-1 lg:px-0 lg:py-2 ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  } `}
                >
                  {/* Active indicator — left bar on desktop */}
                  {active && (
                    <span className="absolute left-0 top-1/2 hidden h-10 w-[3px] -translate-y-1/2 rounded-r-full bg-foreground lg:block" />
                  )}

                  <item.icon size={24} strokeWidth={active ? 1.5 : 1} />
                  <span className="text-sm lg:text-[10px]">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Bottom — Settings */}
        <ul className="space-y-1">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:flex-col lg:gap-1 lg:px-0 lg:py-2 ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  } `}
                >
                  <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                  <span className="text-xs lg:text-[10px]">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
