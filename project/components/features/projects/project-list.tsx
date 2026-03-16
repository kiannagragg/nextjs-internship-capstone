"use client"

import { useMemo } from "react"
import { FolderKanban, Loader2, AlertCircle } from "lucide-react"

import { useProjects } from "@/hooks/use-projects"
import { ProjectCard } from "./project-card"
import { CreateProjectButton } from "./create-project-button"
import type { ProjectCardData } from "@/types/index"

interface ProjectListProps {
  searchParams?: {
    query?: string
    view?: string
  }
}

export function ProjectList({ searchParams }: ProjectListProps) {
  const query = searchParams?.query || ""
  const view = searchParams?.view || "active"

  //Destructure isError and error from React Query hook
  const { projects, isLoading, isError, error } = useProjects(
    searchParams as Record<string, string>
  )

  // Memoize the filtering logic to prevent expensive recalculations on re-renders
  const { pinnedProjects, otherProjects } = useMemo(() => {
    if (!projects) return { pinnedProjects: [], otherProjects: [] }

    if (view === "active") {
      return {
        pinnedProjects: projects.filter((p: ProjectCardData) => p.isPinned),
        otherProjects: projects.filter((p: ProjectCardData) => !p.isPinned),
      }
    }

    // If we are looking at "archived" (or any other view), no pinned separation is needed
    return {
      pinnedProjects: [],
      otherProjects: projects,
    }
  }, [projects, view])

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // --- ERROR STATE ---
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50/50 py-20 text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        <AlertCircle className="mb-4 h-12 w-12 opacity-50" />
        <h3 className="text-lg font-medium">Failed to load projects</h3>
        <p className="mt-1 text-sm opacity-80">
          {error instanceof Error ? error.message : "Something went wrong. Please try again."}
        </p>
      </div>
    )
  }

  // --- EMPTY STATES ---
  if (!projects || projects.length === 0) {
    // True empty state (no projects exist yet)
    if (!query && view === "active") {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-card-foreground shadow-sm">
          <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">No projects yet</h3>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            Get started by creating your first project.
          </p>
          <CreateProjectButton />
        </div>
      )
    }

    // Search/Filter empty state (projects exist, but none match the current view/query)
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">No projects found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {query
            ? `No ${view} projects match your search "${query}".`
            : `You don't have any ${view} projects right now.`}
        </p>
      </div>
    )
  }

  // --- MAIN RENDER ---
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="mt-0 flex items-center justify-between gap-3">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {projects.length} {view === "archived" ? "archived" : ""} projects
          {view === "active" && pinnedProjects.length > 0 && ` ● ${pinnedProjects.length} pinned`}
        </p>
        <div className="h-px flex-1 bg-border" />
      </header>

      {/* Pinned Projects Section */}
      {pinnedProjects.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Pinned Projects</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pinnedProjects.map((project: ProjectCardData) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* All/Remaining Projects Section */}
      {otherProjects.length > 0 && (
        <section className="space-y-4">
          {pinnedProjects.length > 0 && view === "active" && (
            <h2 className="text-lg font-semibold text-foreground">All Projects</h2>
          )}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherProjects.map((project: ProjectCardData) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
