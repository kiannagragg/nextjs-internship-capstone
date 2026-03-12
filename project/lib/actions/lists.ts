"use server"

import { revalidatePath } from "next/cache"
import { eq, and } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { lists, projectMembers } from "@/lib/db/schema"
import { requireAuth } from "@/lib/auth"
import { createList, updateList, deleteList, reorderLists } from "@/lib/db/queries/lists"
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

// --- SERVER ACTIONS ---

export async function createListAction(data: CreateListInput) {
  try {
    const { dbUserId } = await requireAuth()

    // 1. Validate Input
    const parsed = createListSchema.parse(data)

    // 2. Check RBAC (Viewers cannot create lists)
    const role = await verifyProjectAccess(parsed.projectId, dbUserId)
    if (role === "viewer") {
      throw new Error("Unauthorized: Viewers cannot create lists")
    }

    // 3. Mutate
    const list = await createList(
      { title: parsed.title, color: parsed.color },
      parsed.projectId,
      dbUserId
    )

    // 4. Revalidate
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

    // 1. Fetch the list to check ownership
    const [existingList] = await db
      .select({ createdById: lists.createdById })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1)

    if (!existingList) throw new Error("List not found")

    // 2. Check RBAC
    const role = await verifyProjectAccess(projectId, dbUserId)
    if (role === "viewer") throw new Error("Unauthorized: Viewers cannot edit lists")
    if (role === "contributor" && existingList.createdById !== dbUserId) {
      throw new Error("Unauthorized: Contributors can only edit lists they created")
    }

    // 3. Mutate
    const updated = await updateList(listId, parsed, dbUserId)

    // 4. Revalidate
    revalidatePath(`/projects/${projectId}`)
    return { list: updated }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: (error as any).issues[0].message }
    return { error: error instanceof Error ? error.message : "Failed to update list" }
  }
}

export async function deleteListAction(listId: string, projectId: string) {
  try {
    const { dbUserId } = await requireAuth()

    // 1. Fetch the list to check ownership
    const [existingList] = await db
      .select({ createdById: lists.createdById })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1)

    if (!existingList) throw new Error("List not found")

    // 2. Check RBAC
    const role = await verifyProjectAccess(projectId, dbUserId)
    if (role === "viewer") throw new Error("Unauthorized: Viewers cannot delete lists")
    if (role === "contributor" && existingList.createdById !== dbUserId) {
      throw new Error("Unauthorized: Contributors can only delete lists they created")
    }

    // 3. Mutate
    await deleteList(listId, dbUserId)

    // 4. Revalidate
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

    // 1. Check RBAC (Anyone but a viewer can reorganize the board)
    const role = await verifyProjectAccess(projectId, dbUserId)
    if (role === "viewer") {
      throw new Error("Unauthorized: Viewers cannot reorder lists")
    }

    // 2. Mutate
    await reorderLists(parsed.updates)

    // 3. Revalidate
    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: (error as any).issues[0].message }
    return { error: error instanceof Error ? error.message : "Failed to reorder lists" }
  }
}
