import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { getProjectById } from "@/lib/db/queries/projects"

import { KanbanBoard } from "@/components/features/board/kanban-board"
import { ProjectHeader } from "@/components/features/projects/project-header"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { dbUserId: userId } = await requireAuth()

  const project = await getProjectById(resolvedParams.id, userId)

  if (!project) {
    notFound()
  }

  // RBAC Check
  const userMembership = project.members.find((m) => m.userId === userId)
  const role = userMembership?.role || "viewer"
  const isAdmin = role === "admin"

  const isPinned = userMembership?.isPinned || false

  // Calculate Progress
  const totalTasks = project.lists.reduce((acc, list) => acc + list.tasks.length, 0)
  const completedTasks = project.lists.reduce(
    (acc, list) => acc + list.tasks.filter((t) => t.isCompleted).length,
    0
  )
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background">
      {/* 1. INTERACTIVE HEADER COMPONENT */}
      <ProjectHeader 
        project={project} 
        isAdmin={isAdmin}
        isPinned={isPinned} 
        progress={progress}
        totalTasks={totalTasks}
        currentUserId={userId}
      />

      {/* 2. KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6 pt-2">
        <KanbanBoard
          projectId={project.id}
          initialLists={project.lists}
          userRole={role}
          currentUserId={userId}
        />
      </div>
    </div>
  )
}