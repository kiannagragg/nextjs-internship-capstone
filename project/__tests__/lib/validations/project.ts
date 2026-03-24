import {
  createProjectSchema,
  updateProjectSchema,
  inviteMemberSchema,
} from "@/lib/validations/project"

describe("Zod Validations: Projects", () => {
  // ---------------------------------------------------------------------------
  // 1. createProjectSchema
  // ---------------------------------------------------------------------------
  describe("createProjectSchema", () => {
    it("passes with valid minimal data", () => {
      const validData = { title: "My Awesome Project" }
      const result = createProjectSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("passes with valid full data (including date coercion)", () => {
      const validData = {
        title: "Q3 Marketing",
        description: "Launching the new campaign",
        color: "#2D6EF7",
        priority: "high",
        visibility: "public",
        startDate: "2026-03-01T00:00:00Z", // string should coerce to Date
        dueDate: "2026-03-31T00:00:00Z",
        invites: "[]",
      }
      const result = createProjectSchema.safeParse(validData)
      expect(result.success).toBe(true)

      // We can also verify Zod correctly transformed the date strings into actual Date objects!
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date)
      }
    })

    it("fails if title is missing or empty", () => {
      const invalidData = { title: "" }
      const result = createProjectSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Project title is required")
      }
    })

    it("fails if title exceeds 100 characters", () => {
      const invalidData = { title: "a".repeat(101) }
      const result = createProjectSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Project title must be 100 characters or less")
      }
    })

    it("fails with invalid hex color", () => {
      const invalidData = { title: "Test", color: "blue" } // Not a hex code
      const result = createProjectSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid hex color code")
      }
    })

    it("fails if due date is before start date (superRefine test)", () => {
      const invalidData = {
        title: "Test",
        startDate: "2026-03-31T00:00:00Z",
        dueDate: "2026-03-01T00:00:00Z", // Due BEFORE start
      }
      const result = createProjectSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Due date must be after the start date")
        expect(result.error.issues[0]?.path).toEqual(["dueDate"])
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 2. updateProjectSchema
  // ---------------------------------------------------------------------------
  describe("updateProjectSchema", () => {
    it("passes with a completely empty object (partial test)", () => {
      // Because updateProjectSchema uses .partial(), an empty object is perfectly valid!
      const result = updateProjectSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it("passes with valid update fields", () => {
      const validData = {
        status: "completed",
        isArchived: true,
      }
      const result = updateProjectSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("fails with invalid status enum", () => {
      const invalidData = { status: "pending" } // Not 'active' or 'completed'
      const result = updateProjectSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Status must be active or completed")
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 3. inviteMemberSchema
  // ---------------------------------------------------------------------------
  describe("inviteMemberSchema", () => {
    it("passes with valid email and role", () => {
      const validData = { email: "test@example.com", role: "admin" }
      const result = inviteMemberSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("fails with invalid email", () => {
      const invalidData = { email: "not-an-email", role: "viewer" }
      const result = inviteMemberSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Please enter a valid email address")
      }
    })

    it("fails with invalid role", () => {
      const invalidData = { email: "test@example.com", role: "owner" } // 'owner' is not in the enum
      const result = inviteMemberSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Role must be admin, contributor, or viewer")
      }
    })
  })
})
