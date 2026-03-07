/* ============================================
   Phase 3: Replace mock data with real activity logs
   ============================================ */

interface ActivityItem {
  user: string
  initials: string
  action: string
  time: string
  project: string
  projectColor: string
}

const mockActivity: ActivityItem[] = [
  {
    user: "John K.",
    initials: "JK",
    action: 'moved "Fix login redirect bug" to Done',
    time: "2 min. ago",
    project: "API Documentation",
    projectColor: "#2D6EF7",
  },
  {
    user: "John K.",
    initials: "JK",
    action: 'moved "Fix login redirect bug" to Done',
    time: "2 min. ago",
    project: "API Documentation",
    projectColor: "#2D6EF7",
  },
  {
    user: "John K.",
    initials: "JK",
    action: 'moved "Fix login redirect bug" to Done',
    time: "2 min. ago",
    project: "API Documentation",
    projectColor: "#2D6EF7",
  },
  {
    user: "John K.",
    initials: "JK",
    action: 'moved "Fix login redirect bug" to Done',
    time: "2 min. ago",
    project: "API Documentation",
    projectColor: "#2D6EF7",
  },
]

export function RecentActivity() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Recent Activity</h2>
        <button className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          View All
        </button>
      </div>

      <div className="space-y-1">
        {mockActivity.map((activity, i) => (
          <div key={i} className="rounded-lg p-3 transition-colors hover:bg-accent/50">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activity.initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  {activity.time}
                  <span className="opacity-40">&bull;</span>
                  <span className="inline-flex items-center gap-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: activity.projectColor }}
                    />
                    {activity.project}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
