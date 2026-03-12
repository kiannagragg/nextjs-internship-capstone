"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"

import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  toggleTaskCompletion,
  assignTask,
  unassignTask,
  reorderTasks,
  getTaskById,
} from "@/lib/db/queries/tasks"

import { getUserProjectRole } from "@/lib/db/queries/projects"

import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  assignTaskSchema,
} from "@/lib/validations/task"

/**
 * Create a new task
 */
export async function createTaskAction(data: unknown) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const validatedData = createTaskSchema.parse(data)
    const { listId, projectId, ...taskData } = validatedData

    const role = await getUserProjectRole(projectId, userId)
    if (!role) return { success: false, error: "Unauthorized: Not a project member." }
    if (role === "viewer")
      return { success: false, error: "Unauthorized: Viewers cannot create tasks." }

    const task = await createTask(taskData, listId, projectId, userId)

    revalidatePath(`/projects/${projectId}`)
    return { success: true, data: task }
  } catch (error) {
    return { success: false, error: "Failed to create task. Please check your inputs." }
  }
}

/**
 * Update an existing task
 */
export async function updateTaskAction(taskId: string, projectId: string, data: unknown) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const validatedData = updateTaskSchema.parse(data)

    const role = await getUserProjectRole(projectId, userId)
    if (!role) return { success: false, error: "Unauthorized: Not a project member." }
    if (role === "viewer")
      return { success: false, error: "Unauthorized: Viewers cannot edit tasks." }

    // RBAC: Contributor can only edit their own
    if (role === "contributor") {
      const existingTask = await getTaskById(taskId)
      if (existingTask?.createdById !== userId) {
        return {
          success: false,
          error: "Unauthorized: Contributors can only edit tasks they created.",
        }
      }
    }

    const updatedTask = await updateTask(taskId, validatedData, userId)

    revalidatePath(`/projects/${projectId}`)
    return { success: true, data: updatedTask }
  } catch (error) {
    return { success: false, error: "Failed to update task." }
  }
}

/**
 * Delete a task
 */
export async function deleteTaskAction(taskId: string, projectId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const role = await getUserProjectRole(projectId, userId)
    if (!role) return { success: false, error: "Unauthorized: Not a project member." }
    if (role === "viewer")
      return { success: false, error: "Unauthorized: Viewers cannot delete tasks." }

    if (role === "contributor") {
      const existingTask = await getTaskById(taskId)
      if (existingTask?.createdById !== userId) {
        return {
          success: false,
          error: "Unauthorized: Contributors can only delete tasks they created.",
        }
      }
    }

    await deleteTask(taskId, userId)

    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete task." }
  }
}

/**
 * Move a task between lists or update its position
 */
export async function moveTaskAction(data: unknown, projectId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const { taskId, targetListId, position } = moveTaskSchema.parse(data)

    const role = await getUserProjectRole(projectId, userId)
    if (!role) return { success: false, error: "Unauthorized: Not a project member." }
    if (role === "viewer")
      return { success: false, error: "Unauthorized: Viewers cannot move tasks." }

    const updatedTask = await moveTask(taskId, targetListId, position, userId)

    revalidatePath(`/projects/${projectId}`)
    return { success: true, data: updatedTask }
  } catch (error) {
    return { success: false, error: "Failed to move task." }
  }
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletionAction(
  taskId: string,
  projectId: string,
  isCompleted: boolean
) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const role = await getUserProjectRole(projectId, userId)
    if (!role) return { success: false, error: "Unauthorized: Not a project member." }
    if (role === "viewer")
      return { success: false, error: "Unauthorized: Viewers cannot modify tasks." }

    const updatedTask = await toggleTaskCompletion(taskId, isCompleted, userId)

    revalidatePath(`/projects/${projectId}`)
    return { success: true, data: updatedTask }
  } catch (error) {
    return { success: false, error: "Failed to update task status." }
  }
}

/**
 * Assign a user to a task
 */
export async function assignTaskAction(data: unknown, projectId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const { taskId, assigneeUserId } = assignTaskSchema.parse(data)

    const role = await getUserProjectRole(projectId, userId)
    if (!role) return { success: false, error: "Unauthorized: Not a project member." }
    if (role === "viewer")
      return { success: false, error: "Unauthorized: Viewers cannot assign tasks." }

    const assignment = await assignTask(taskId, assigneeUserId, userId)

    revalidatePath(`/projects/${projectId}`)
    return { success: true, data: assignment }
  } catch (error) {
    return { success: false, error: "Failed to assign user to task." }
  }
}

/**
 * Unassign a user from a task
 */
export async function unassignTaskAction(data: unknown, projectId: string) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const { taskId, assigneeUserId } = assignTaskSchema.parse(data)

    const role = await getUserProjectRole(projectId, userId)
    if (!role) return { success: false, error: "Unauthorized: Not a project member." }
    if (role === "viewer")
      return { success: false, error: "Unauthorized: Viewers cannot modify assignments." }

    await unassignTask(taskId, assigneeUserId, userId)

    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to remove user from task." }
  }
}

/**
 * Batch reorder tasks within a list (Called after Dnd-Kit drop)
 */
export async function reorderTasksAction(
  updates: { id: string; position: number }[],
  projectId: string
) {
  try {
    const { dbUserId: userId } = await requireAuth()

    const role = await getUserProjectRole(projectId, userId)
    if (!role) return { success: false, error: "Unauthorized: Not a project member." }
    if (role === "viewer")
      return { success: false, error: "Unauthorized: Viewers cannot reorder tasks." }

    await reorderTasks(updates)

    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to save new task order." }
  }
}
