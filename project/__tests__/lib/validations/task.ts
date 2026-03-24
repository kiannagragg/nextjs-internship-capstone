import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  assignTaskSchema,
  attachmentMetadataSchema,
} from "@/lib/validations/task"

describe("Zod Validations: Tasks", () => {
  // ---------------------------------------------------------------------------
  // 1. createTaskSchema
  // ---------------------------------------------------------------------------
  describe("createTaskSchema", () => {
    it("passes with valid minimal data", () => {
      const validData = {
        title: "Fix the navigation bug",
        listId: "list-123",
        projectId: "proj-456",
      }
      const result = createTaskSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("passes with valid full data (including date coercion)", () => {
      const validData = {
        title: "Deploy to production",
        description: "Make sure all tests pass first.",
        priority: "high",
        startDate: "2026-03-24T09:00:00Z", // string coerces to Date
        dueDate: "2026-03-25T17:00:00Z",
        listId: "list-123",
        projectId: "proj-456",
      }
      const result = createTaskSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("fails if title is missing or empty", () => {
      const invalidData = { title: "", listId: "list-1", projectId: "proj-1" }
      const result = createTaskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title is required")
      }
    })

    it("fails if due date is before start date", () => {
      const invalidData = {
        title: "Time Travel Task",
        listId: "list-1",
        projectId: "proj-1",
        startDate: "2026-03-25T00:00:00Z",
        dueDate: "2026-03-24T00:00:00Z", // Due BEFORE start
      }
      const result = createTaskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Due date must be after start date")
        expect(result.error.issues[0]?.path).toEqual(["dueDate"])
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 2. updateTaskSchema
  // ---------------------------------------------------------------------------
  describe("updateTaskSchema", () => {
    it("passes with an empty object (partial test)", () => {
      const result = updateTaskSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it("passes with valid update fields", () => {
      const validData = {
        isCompleted: true,
        labels: ["bug", "ui"],
        priority: "medium",
      }
      const result = updateTaskSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("fails if due date is before start date on update", () => {
      const invalidData = {
        startDate: "2026-03-25T00:00:00Z",
        dueDate: "2026-03-24T00:00:00Z", // Due BEFORE start
      }
      const result = updateTaskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Due date must be after start date")
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 3. moveTaskSchema
  // ---------------------------------------------------------------------------
  describe("moveTaskSchema", () => {
    it("passes with valid move data", () => {
      const validData = { taskId: "task-1", listId: "list-2", position: 65536 }
      const result = moveTaskSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("fails if required fields are missing", () => {
      const invalidData = { position: 100 }
      const result = moveTaskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // 4. assignTaskSchema
  // ---------------------------------------------------------------------------
  describe("assignTaskSchema", () => {
    it("passes with valid assign data", () => {
      const validData = { taskId: "task-1", assigneeUserId: "user-123" }
      const result = assignTaskSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("fails if User ID is missing", () => {
      const invalidData = { taskId: "task-1", assigneeUserId: "" }
      const result = assignTaskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("User ID is required")
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 5. attachmentMetadataSchema
  // ---------------------------------------------------------------------------
  describe("attachmentMetadataSchema", () => {
    it("passes with valid metadata", () => {
      const validData = {
        url: "https://utfs.io/f/some-file.png",
        name: "screenshot.png",
        size: 1024,
        type: "image/png",
      }
      const result = attachmentMetadataSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("fails with an invalid URL", () => {
      const invalidData = {
        url: "not-a-url",
        name: "screenshot.png",
        size: 1024,
        type: "image/png",
      }
      const result = attachmentMetadataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid URL")
      }
    })
  })
})
