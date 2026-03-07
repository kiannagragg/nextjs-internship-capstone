/* ============================================
   Phase 3: Replace mock data with real DB queries
   ============================================ */

import Link from "next/link"

interface RecentProject {
  id: string
  name: string
  updated: string
  progress: number
  status: string
  priority: string
  color: string
  members: { initials: string }[]
}

const mockProjects: RecentProject[] = [
  {
    id: "1",
    name: "API Documentation",
    updated: "Last updated 2 hrs ago",
    progress: 22,
    status: "Active",
    priority: "Medium",
    color: "#2D6EF7",
    members: [{ initials: "KG" }],
  },
  {
    id: "2",
    name: "API Documentation",
    updated: "Last updated 2 hrs ago",
    progress: 22,
    status: "Active",
    priority: "Medium",
    color: "#2D6EF7",
    members: [{ initials: "KG" }],
  },
  {
    id: "3",
    name: "API Documentation",
    updated: "Last updated 2 hrs ago",
    progress: 22,
    status: "Active",
    priority: "Medium",
    color: "#2D6EF7",
    members: [{ initials: "KG" }],
  },
  {
    id: "4",
    name: "API Documentation",
    updated: "Last updated 2 hrs ago",
    progress: 22,
    status: "Active",
    priority: "Medium",
    color: "#2D6EF7",
    members: [{ initials: "KG" }],
  },
]

export function RecentProjects() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Recent Projects
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-2">
        {mockProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-accent/50"
          >
            {/* Color dot */}
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: project.color }}
            />

            {/* Project info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{project.name}</p>
              <p className="text-xs text-muted-foreground">{project.updated}</p>
            </div>

            {/* Progress */}
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs text-muted-foreground">Progress</span>
              <div className="h-1.5 w-16 rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-brand"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs font-medium">{project.progress}%</span>
            </div>

            {/* Status + Priority badges */}
            <div className="hidden items-center gap-2 md:flex">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                {project.status}
              </span>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                {project.priority}
              </span>
            </div>

            {/* Member avatars */}
            <div className="hidden items-center -space-x-1.5 lg:flex">
              {project.members.map((member, i) => (
                <div
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-bold text-muted-foreground"
                >
                  {member.initials}
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
