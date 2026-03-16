import type { Metadata } from "next"
import { CreateProjectButton } from "@/components/features/projects/create-project-button"
import { ProjectsToolbar } from "@/components/features/projects/projects-toolbar"
import { ProjectList } from "@/components/features/projects/project-list"

export const metadata: Metadata = {
  title: "Projects | FLOE.",
  description: "Manage and organize your team projects",
}

interface ProjectsPageProps {
  searchParams: Promise<{
    query?: string
    sort?: string
    view?: string
  }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedParams = await searchParams

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold capitalize text-foreground">
            {resolvedParams.view === "archived" ? "Archived Projects" : "Projects"}
          </h1>
        </div>
        <CreateProjectButton />
      </div>

      {/* Toolbar */}
      <ProjectsToolbar />

      {/* The Client Component that uses React Query */}
      <ProjectList searchParams={resolvedParams} />
    </div>
  )
}
