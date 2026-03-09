"use client"

import { useState } from "react"
import { Search, Filter, Globe, Lock, Pin } from "lucide-react"
// If you create a separate component later, import it here:
// import { ProjectCard } from "@/components/features/projects/project-card"

// Added a basic type to help with IntelliSense based on your schema
type ProjectData = {
  id: string
  title: string
  description?: string | null
  color?: string | null
  visibility: "public" | "private"
  isPinned: boolean
  // Add other fields you need like status, priority, _count, etc.
}

export function ProjectsClient({ initialProjects }: { initialProjects: ProjectData[] }) {
  const [searchQuery, setSearchQuery] = useState("")

  // Basic client-side filtering
  const filteredProjects = initialProjects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedProjects = filteredProjects.filter((p) => p.isPinned)
  const otherProjects = filteredProjects.filter((p) => !p.isPinned)

  // Helper function to render the visibility badge
  const renderVisibilityBadge = (visibility: "public" | "private") => {
    if (visibility === "public") {
      return (
        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Globe size={12} />
          Public
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <Lock size={12} />
        Private
      </span>
    )
  }

  // Inline Card Component to keep the code DRY
  const renderCard = (project: ProjectData) => (
    <div
      key={project.id}
      className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-[#1C1C1C]"
    >
      <div>
        <div className="mb-2 flex items-start justify-between">
          <div className="flex flex-col items-start gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {project.title}
            </h3>
            {/* The new visibility badge injected here */}
            {renderVisibilityBadge(project.visibility)}
          </div>

          {/* Pin Icon indicator */}
          {project.isPinned && <Pin size={16} className="fill-blue-500 text-blue-500" />}
        </div>

        {project.description && (
          <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {project.description}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
        <span className="text-xs text-gray-400">
          {/* You can replace this with your project._count.tasks from the DB later */}0 Tasks
        </span>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
          View Project
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-[#1C1C1C] dark:focus:border-blue-500"
          />
        </div>
        <button className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
          <Filter size={16} className="mr-2" />
          Filter
        </button>
      </div>

      {pinnedProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Pinned Projects
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pinnedProjects.map(renderCard)}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">All Projects</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {otherProjects.map(renderCard)}
          {otherProjects.length === 0 && (
            <p className="text-sm text-gray-500">No projects found matching your search.</p>
          )}
        </div>
      </div>
    </div>
  )
}
