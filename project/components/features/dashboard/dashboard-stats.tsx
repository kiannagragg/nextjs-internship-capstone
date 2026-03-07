/* ============================================
   Phase 3: Replace mock data with real DB queries
   ============================================ */

import {
  FolderOpen,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react"

interface StatCard {
  label: string
  value: number
  trend: string
  trendUp: boolean
  icon: LucideIcon
  iconColor: string
  iconBg: string
}

const stats: StatCard[] = [
  {
    label: "Active Projects",
    value: 6,
    trend: "+1 this week",
    trendUp: true,
    icon: FolderOpen,
    iconColor: "text-brand",
    iconBg: "bg-brand/10",
  },
  {
    label: "Pending Tasks",
    value: 6,
    trend: "1 overdue",
    trendUp: false,
    icon: Clock,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
  {
    label: "Completed Tasks",
    value: 6,
    trend: "+3 this week",
    trendUp: true,
    icon: CheckCircle,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  {
    label: "Team Members",
    value: 6,
    trend: "+1 this month",
    trendUp: true,
    icon: Users,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-xl border border-border p-5"
        >
          {/* Icon — top right */}
          <div
            className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconBg}`}
          >
            <stat.icon size={16} className={stat.iconColor} />
          </div>

          {/* Value */}
          <div className="mt-6 font-display text-4xl font-bold tracking-tight">{stat.value}</div>

          {/* Trend badge */}
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                stat.trendUp
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {stat.trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {stat.trend}
            </span>
          </div>

          {/* Label */}
          <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
