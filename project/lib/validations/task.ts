import { z } from "zod"

const baseTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  startDate: z.date().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  listId: z.string(),
  projectId: z.string(),
})

export const createTaskSchema = baseTaskSchema.refine(
  (data) => {
    // Example: your existing refinement logic goes here
    if (data.startDate && data.dueDate) {
      return data.dueDate >= data.startDate
    }
    return true
  },
  {
    message: "Due date must be after start date",
    path: ["dueDate"],
  }
)

export const updateTaskSchema = baseTaskSchema
  .pick({
    title: true,
    description: true,
    priority: true,
    startDate: true,
    dueDate: true,
  })
  .extend({
    isCompleted: z.boolean().optional(),
  })
  // If updateTaskSchema also needs the date validation, add it here too!
  .refine(
    (data) => {
      if (data.startDate && data.dueDate) {
        return data.dueDate >= data.startDate
      }
      return true
    },
    {
      message: "Due date must be after start date",
      path: ["dueDate"],
    }
  )

export const moveTaskSchema = z.object({
  taskId: z.string().uuid("Invalid Task ID"),
  targetListId: z.string().uuid("Invalid Target List ID"),
  position: z.number().min(0, "Position must be 0 or greater"),
})

export const assignTaskSchema = z.object({
  taskId: z.string().uuid("Invalid Task ID"),
  assigneeUserId: z.string().uuid("Invalid User ID"),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type MoveTaskInput = z.infer<typeof moveTaskSchema>
export type AssignTaskInput = z.infer<typeof assignTaskSchema>
