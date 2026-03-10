import { FolderKanban } from "lucide-react"
import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import { getProjectsByUserId } from "@/lib/db/queries/projects"

// Components
import { CreateProjectButton } from "@/components/features/projects/create-project-button"
import { ProjectsToolbar } from "@/components/features/projects/projects-toolbar"
import { ProjectCard } from "@/components/features/projects/project-card"

export const metadata: Metadata = {
  title: "Projects | FLOE.",
  description: "Manage and organize your team projects",
}

interface ProjectsPageProps {
  searchParams: {
    query?: string
    sort?: string
  }
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { dbUserId: userId } = await requireAuth()

  // 1. Fetch raw data
  const rawProjects = await getProjectsByUserId(userId)
  const totalCount = rawProjects.length

  // 2. Extract URL parameters
  const query = searchParams?.query?.toLowerCase() || ""
  const sort = searchParams?.sort || "asc"

  // 3. Filter and Sort on the server
  let processedProjects = rawProjects

  if (query) {
    processedProjects = processedProjects.filter((p) => p.title.toLowerCase().includes(query))
  }

  processedProjects.sort((a, b) => {
    const comparison = a.title.localeCompare(b.title)
    return sort === "desc" ? -comparison : comparison
  })

  // 4. Split for rendering
  const pinnedProjects = processedProjects.filter((p) => p.isPinned)
  const otherProjects = processedProjects.filter((p) => !p.isPinned)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {totalCount} projects | {rawProjects.filter((p) => p.isPinned).length} pinned
          </p>
        </div>
        <CreateProjectButton />
      </div>

      {/* Empty State vs Real Data */}
      {totalCount === 0 ? (
        <ProjectsEmptyState />
      ) : (
        <>
          <ProjectsToolbar />

          {/* Pinned Projects Section */}
          {pinnedProjects.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Pinned Projects</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pinnedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {/* All Projects Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">All Projects</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {otherProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}

              {otherProjects.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No projects found matching your search.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ProjectsEmptyState() {
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
