import { z } from "zod"

const ListTypeZodEnum = z.enum(["todo", "in_progress", "review", "done", "custom"])

export const createListSchema = z.object({
  title: z
    .string()
    .min(1, "List title is required")
    .max(100, "List title must be 100 characters or less"),
  color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color code")
    .optional(),
  projectId: z.string().uuid("Invalid Project ID"),
  type: ListTypeZodEnum.default("custom"),
})

export const updateListSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i)
    .optional(),
  type: ListTypeZodEnum.optional(),
})

export const reorderListsSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().uuid("Invalid List ID"),
      position: z.number().int("Position must be an integer"),
    })
  ),
})

export type CreateListInput = z.infer<typeof createListSchema>
export type UpdateListInput = z.infer<typeof updateListSchema>
export type ReorderListsInput = z.infer<typeof reorderListsSchema>
export type ListType = z.infer<typeof ListTypeZodEnum>
