import { eq, and, desc, asc, count, sql, or, exists, ilike } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  projects,
  projectMembers,
  lists,
  tasks,
  activityLogs,
  users,
  projectInvitations,
  type NewProject,
} from "@/lib/db/schema"
import { logActivity } from "./activity"

/**
 * Get all projects a user is a member of.
 * Filters, searches, and sorts directly at the database level using Drizzle.
 */
export async function getProjectsByUserId(
  userId: string,
  searchParams?: { query?: string; sort?: string; view?: string; page?: number; limit?: number }
) {
  const isArchivedView = searchParams?.view === "archived"
  const query = searchParams?.query || ""
  const page = searchParams?.page || 1
  const limit = searchParams?.limit || 20
  const offset = (page - 1) * limit

  // Dynamic sorting logic
  let orderByLogic
  switch (searchParams?.sort) {
    case "newest":
      orderByLogic = desc(projects.createdAt)
      break
    case "oldest":
      orderByLogic = asc(projects.createdAt)
      break
    case "desc":
      orderByLogic = desc(projects.title)
      break
    case "asc":
    default:
      orderByLogic = asc(projects.title)
      break
  }

  // 1. Query the Database (Now with Pagination)
  const userProjects = await db.query.projects.findMany({
    limit,
    offset,
    where: and(
      exists(
        db
          .select()
          .from(projectMembers)
          .where(and(eq(projectMembers.projectId, projects.id), eq(projectMembers.userId, userId)))
      ),
      isArchivedView
        ? eq(projects.isArchived, true)
        : or(eq(projects.isArchived, false), sql`${projects.isArchived} IS NULL`),
      query
        ? or(ilike(projects.title, `%${query}%`), ilike(projects.description, `%${query}%`))
        : undefined
    ),
    with: {
      members: { with: { user: true } },
      // Fetch tasks in the same query to avoid N+1 queries!
      tasks: {
        columns: { id: true, isCompleted: true },
      },
    },
    orderBy: [orderByLogic],
  })

  // 2. Enrich data purely in memory (No extra DB calls!)
  const enriched = userProjects.map((project) => {
    const userMembership = project.members.find((m) => m.userId === userId)

    // Calculate stats from the already-fetched tasks array
    const totalTasks = project.tasks.length
    const completedTasks = project.tasks.filter((t) => t.isCompleted).length

    return {
      ...project,
      memberRole: userMembership?.role ?? "viewer",
      isPinned: userMembership?.isPinned ?? false,
      members: project.members,
      _count: {
        tasks: totalTasks,
        completedTasks: completedTasks,
      },
    }
  })

  // 3. Surface Pinned projects
  enriched.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0
  })

  return enriched
}

/**
 * Get a single project by ID with full details.
 * Used for the Kanban board page.
 */
export async function getProjectById(projectId: string, userId?: string | null) {
  const project = await db.query.projects.findFirst({
    where: and(
      // 1. Must match the requested project ID
      eq(projects.id, projectId),

      // 2. Access Control: Must be public OR user must be a member
      or(
        eq(projects.visibility, "public"),
        userId
          ? exists(
              db
                .select()
                .from(projectMembers)
                .where(
                  and(eq(projectMembers.projectId, projects.id), eq(projectMembers.userId, userId))
                )
            )
          : // If no userId is provided, this condition evaluates to false
            eq(projects.id, "impossible_condition_to_fail_safely")
      )
    ),
    with: {
      createdBy: true,
      members: {
        with: {
          user: true,
        },
      },
      labels: true,
      lists: {
        orderBy: (lists, { asc }) => [asc(lists.position)],
        with: {
          tasks: {
            orderBy: (tasks, { asc }) => [asc(tasks.position)],
            with: {
              assignees: { with: { user: true } },
              labels: { with: { label: true } },
            },
          },
        },
      },
    },
  })

  return project ?? null
}

/**
 * Get the user's role in a project.
 * Returns null if user is not a member.
 */
export async function getUserProjectRole(projectId: string, userId: string) {
  const membership = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .limit(1)

  return membership[0]?.role ?? null
}

/**
 * Create a new project with default lists and admin membership.
 * Wraps everything in a single operation for consistency.
 */
/**
 * Create a new project with default lists and admin membership.
 * Wraps everything in a single operation for consistency.
 */
export async function createProject(
  data: Pick<
    NewProject,
    "title" | "description" | "color" | "priority" | "visibility" | "startDate" | "dueDate"
  >,
  creatorId: string
) {
  // 1. Insert the project
  const [project] = await db
    .insert(projects)
    .values({
      ...data,
      createdById: creatorId,
    })
    .returning()

  if (!project) {
    throw new Error("Failed to create project. Database returned undefined.")
  }

  // 2. Add creator as admin
  await db.insert(projectMembers).values({
    projectId: project.id,
    userId: creatorId,
    role: "admin",
  })

  // 3. Create default SYSTEM lists with specific types
  const defaultLists = [
    { title: "To Do", position: 0, color: "#64748B", type: "todo" as const, isSystem: true },
    {
      title: "In Progress",
      position: 1000,
      color: "#3B82F6",
      type: "in_progress" as const,
      isSystem: true,
    },
    { title: "Review", position: 2000, color: "#8B5CF6", type: "review" as const, isSystem: true },
    { title: "Done", position: 3000, color: "#10B981", type: "done" as const, isSystem: true },
  ]

  await db.insert(lists).values(
    defaultLists.map((list) => ({
      ...list,
      projectId: project.id,
      createdById: creatorId,
    }))
  )

  // 4. Log activity
  await db.insert(activityLogs).values({
    projectId: project.id,
    userId: creatorId,
    action: "created",
    entityType: "project",
    entityId: project.id,
    metadata: { title: project.title },
  })

  return project
}

/**
 * Create project invitations for emails.
 * NEW FUNCTION
 */
export async function createProjectInvitations(
  projectId: string,
  inviterId: string,
  invites: { email: string; role: "admin" | "contributor" | "viewer" }[]
) {
  if (!invites || invites.length === 0) return

  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 7) // Expires in 7 days

  const inviteRecords = invites.map((invite) => ({
    projectId,
    invitedByUserId: inviterId,
    email: invite.email,
    role: invite.role,
    token: crypto.randomUUID(), // Generates unique secure token
    expiresAt: expirationDate,
    status: "pending" as const,
  }))

  await db.insert(projectInvitations).values(inviteRecords)

  // Optional: You could log a single activity for inviting multiple people here
}

/**
 * Update project details.
 */
export async function updateProject(
  projectId: string,
  data: Partial<
    Pick<
      NewProject,
      | "title"
      | "description"
      | "color"
      | "priority"
      | "visibility"
      | "status"
      | "startDate"
      | "dueDate"
      | "isArchived"
    >
  >,
  userId: string
) {
  const [updated] = await db
    .update(projects)
    .set(data)
    .where(eq(projects.id, projectId))
    .returning()

  if (updated) {
    await db.insert(activityLogs).values({
      projectId,
      userId,
      action: "updated",
      entityType: "project",
      entityId: projectId,
      metadata: { ...data, title: updated.title },
    })
  }

  return updated ?? null
}

/**
 * Delete a project. CASCADE handles all related data.
 */
export async function deleteProject(projectId: string, userId: string) {
  const [project] = await db
    .select({ title: projects.title })
    .from(projects)
    .where(eq(projects.id, projectId))

  if (!project) throw new Error("Project not found")

  await db.delete(projects).where(eq(projects.id, projectId))

  await logActivity({
    projectId: null,
    userId,
    action: "deleted",
    entityType: "project",
    entityId: projectId,
    metadata: { title: project.title },
  })
}

/**
 * Archive/unarchive a project.
 */
export async function archiveProject(projectId: string, isArchived: boolean, userId: string) {
  const [updatedProject] = await db
    .update(projects)
    .set({
      isArchived,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning()

  if (!updatedProject) throw new Error("Project not found")

  const actionString = isArchived ? "archived" : "unarchived"

  // Replaced 'logActivity' with your standard Drizzle insert
  await db.insert(activityLogs).values({
    projectId,
    userId,
    action: actionString,
    entityType: "project",
    entityId: projectId,
    metadata: { title: updatedProject.title },
  })

  return updatedProject
}

/**
 * Mark project as completed/active.
 */
export async function setProjectStatus(
  projectId: string,
  status: "active" | "completed",
  userId: string
) {
  return updateProject(projectId, { status }, userId)
}

/**
 * Pin/unpin a project for a specific user.
 */
export async function togglePinProject(projectId: string, userId: string, isPinned: boolean) {
  await db
    .update(projectMembers)
    .set({ isPinned })
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
}

/**
 * Add a member to a project.
 */
export async function addProjectMember(
  projectId: string,
  userId: string,
  role: "admin" | "contributor" | "viewer",
  invitedByUserId: string
) {
  const [member] = await db.insert(projectMembers).values({ projectId, userId, role }).returning()

  await db.insert(activityLogs).values({
    projectId,
    userId: invitedByUserId,
    action: "invited",
    entityType: "member",
    entityId: userId,
    metadata: { role },
  })

  return member
}

/**
 * Remove a member from a project.
 */
export async function removeProjectMember(
  projectId: string,
  userId: string,
  removedByUserId: string
) {
  await db
    .delete(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))

  await db.insert(activityLogs).values({
    projectId,
    userId: removedByUserId,
    action: "removed",
    entityType: "member",
    entityId: userId,
  })
}

/**
 * Change a member's role in a project.
 */
export async function changeProjectMemberRole(
  projectId: string,
  userId: string,
  newRole: "admin" | "contributor" | "viewer",
  changedByUserId: string
) {
  const [updated] = await db
    .update(projectMembers)
    .set({ role: newRole })
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .returning()

  await db.insert(activityLogs).values({
    projectId,
    userId: changedByUserId,
    action: "role_changed",
    entityType: "member",
    entityId: userId,
    metadata: { newRole },
  })

  return updated ?? null
}
