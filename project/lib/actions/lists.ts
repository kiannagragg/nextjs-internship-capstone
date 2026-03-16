"use server"

import { revalidatePath } from "next/cache"
import { eq, and, count } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { lists, projectMembers } from "@/lib/db/schema"
import { requireAuth } from "@/lib/auth"
import {
  getListsByProjectId,
  createList,
  updateList,
  deleteList,
  reorderLists,
} from "@/lib/db/queries/lists"
import {
  createListSchema,
  updateListSchema,
  reorderListsSchema,
  type CreateListInput,
  type UpdateListInput,
  type ReorderListsInput,
} from "@/lib/validations/list"

// --- INTERNAL HELPER: RBAC Check ---
async function verifyProjectAccess(projectId: string, userId: string) {
  const [membership] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .limit(1)

  if (!membership) throw new Error("Unauthorized: Not a member of this project")
  return membership.role
}

// Counts how many "done" lists currently exist in the project
async function getDoneListCount(projectId: string) {
  const [res] = await db
    .select({ value: count() })
    .from(lists)
    .where(and(eq(lists.projectId, projectId), eq(lists.type, "done")))

  return res?.value ?? 0
}

// --- SERVER ACTIONS ---
export async function getProjectListsAction(projectId: string) {
  try {
    const { dbUserId } = await requireAuth()

    // Optional: Check if user has access to this project before returning data
    await verifyProjectAccess(projectId, dbUserId)

    const lists = await getListsByProjectId(projectId)
    return { data: lists }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to fetch lists" }
  }
}

export async function createListAction(data: CreateListInput) {
  try {
    const { dbUserId } = await requireAuth()
    const parsed = createListSchema.parse(data)

    // Check RBAC (Viewers cannot create lists)
    const role = await verifyProjectAccess(parsed.projectId, dbUserId)
    if (role === "viewer") {
      throw new Error("Unauthorized: Viewers cannot create lists")
    }

    if (parsed.type === "done") {
      const doneCount = await getDoneListCount(parsed.projectId)
      if (doneCount > 0) throw new Error("A 'Done' list already exists in this project.")
    }

    // Mutate
    const list = await createList(
      { title: parsed.title, color: parsed.color, type: parsed.type },
      parsed.projectId,
      dbUserId
    )

    // Revalidate
    revalidatePath(`/projects/${parsed.projectId}`)
    return { list }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: (error as any).issues[0].message }
    return { error: error instanceof Error ? error.message : "Failed to create list" }
  }
}

export async function updateListAction(listId: string, projectId: string, data: UpdateListInput) {
  try {
    const { dbUserId } = await requireAuth()
    const parsed = updateListSchema.parse(data)

    const [existingList] = await db
      .select({ createdById: lists.createdById, type: lists.type })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1)

    if (!existingList) throw new Error("List not found")

    const role = await verifyProjectAccess(projectId, dbUserId)
    if (role === "viewer") throw new Error("Unauthorized: Viewers cannot edit lists")
    if (role === "contributor" && existingList.createdById !== dbUserId) {
      throw new Error("Unauthorized: Contributors can only edit lists they created")
    }

    if (parsed.type && parsed.type !== existingList.type) {
      if (parsed.type === "done") {
        const doneCount = await getDoneListCount(projectId)
        if (doneCount > 0) throw new Error("A 'Done' list already exists.")
      }
      if (existingList.type === "done") {
        const doneCount = await getDoneListCount(projectId)
        if (doneCount <= 1)
          throw new Error("Cannot change type. At least one 'Done' list must exist.")
      }
    }

    const updated = await updateList(listId, parsed, dbUserId)

    revalidatePath(`/projects/${projectId}`)
    return { list: updated }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: (error as any).issues[0].message }
    return { error: error instanceof Error ? error.message : "Failed to update list" }
  }
}

export async function deleteListAction(
  listId: string,
  projectId: string,
  migrationListId?: string
) {
  try {
    const { dbUserId } = await requireAuth()

    const [existingList] = await db
      .select({ createdById: lists.createdById, type: lists.type })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1)

    if (!existingList) throw new Error("List not found")

    const role = await verifyProjectAccess(projectId, dbUserId)
    if (role === "viewer") throw new Error("Unauthorized: Viewers cannot delete lists")
    if (role === "contributor" && existingList.createdById !== dbUserId) {
      throw new Error("Unauthorized: Contributors can only delete lists they created")
    }

    if (existingList.type === "done") {
      const doneCount = await getDoneListCount(projectId)
      if (doneCount <= 1)
        throw new Error("Cannot delete the final 'Done' list. Completion logic must exist.")
    }

    await deleteList(listId, dbUserId, migrationListId)

    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete list" }
  }
}

export async function reorderListsAction(projectId: string, data: ReorderListsInput) {
  try {
    const { dbUserId } = await requireAuth()
    const parsed = reorderListsSchema.parse(data)

    // Check RBAC (Anyone but a viewer can reorganize the board)
    const role = await verifyProjectAccess(projectId, dbUserId)
    if (role === "viewer") {
      throw new Error("Unauthorized: Viewers cannot reorder lists")
    }

    // Mutate
    await reorderLists(parsed.updates)

    // Revalidate
    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: (error as any).issues[0].message }
    return { error: error instanceof Error ? error.message : "Failed to reorder lists" }
  }
}
