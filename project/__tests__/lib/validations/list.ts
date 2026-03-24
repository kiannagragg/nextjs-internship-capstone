import { createListSchema, updateListSchema, reorderListsSchema } from "@/lib/validations/list"

// A valid mock UUID for our tests
const MOCK_UUID = "123e4567-e89b-12d3-a456-426614174000"

describe("Zod Validations: Lists", () => {
  // ---------------------------------------------------------------------------
  // 1. createListSchema
  // ---------------------------------------------------------------------------
  describe("createListSchema", () => {
    it("passes with valid minimal data", () => {
      const validData = {
        title: "Backlog",
        projectId: MOCK_UUID,
        // color and type are optional/defaulted
      }
      const result = createListSchema.safeParse(validData)
      expect(result.success).toBe(true)

      // Check that the default type was applied
      if (result.success) {
        expect(result.data.type).toBe("custom")
      }
    })

    it("passes with valid full data", () => {
      const validData = {
        title: "In Progress",
        color: "#FFA500",
        projectId: MOCK_UUID,
        type: "in_progress",
      }
      const result = createListSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("fails if title is missing or empty", () => {
      const invalidData = { title: "", projectId: MOCK_UUID }
      const result = createListSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("List title is required")
      }
    })

    it("fails if title exceeds 100 characters", () => {
      const invalidData = { title: "a".repeat(101), projectId: MOCK_UUID }
      const result = createListSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("List title must be 100 characters or less")
      }
    })

    it("fails with invalid hex color", () => {
      const invalidData = { title: "Test", projectId: MOCK_UUID, color: "red" }
      const result = createListSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid hex color code")
      }
    })

    it("fails if projectId is not a valid UUID", () => {
      const invalidData = { title: "Test", projectId: "not-a-uuid" }
      const result = createListSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid Project ID")
      }
    })

    it("fails with invalid list type", () => {
      const invalidData = { title: "Test", projectId: MOCK_UUID, type: "archived" }
      const result = createListSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // 2. updateListSchema
  // ---------------------------------------------------------------------------
  describe("updateListSchema", () => {
    it("passes with an empty object (all fields optional)", () => {
      const result = updateListSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it("passes with partial valid updates", () => {
      const validData = {
        title: "Updated Title",
        color: "#000000",
      }
      const result = updateListSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("fails with empty title string", () => {
      const invalidData = { title: "" }
      const result = updateListSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // 3. reorderListsSchema
  // ---------------------------------------------------------------------------
  describe("reorderListsSchema", () => {
    it("passes with valid updates array", () => {
      const validData = {
        updates: [
          { id: MOCK_UUID, position: 65536 },
          { id: "987fcdeb-51a2-43d7-9012-345678901234", position: 131072 },
        ],
      }
      const result = reorderListsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("passes with an empty array", () => {
      const validData = { updates: [] }
      const result = reorderListsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("fails if id in updates array is not a UUID", () => {
      const invalidData = {
        updates: [{ id: "list-1", position: 1000 }],
      }
      const result = reorderListsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid List ID")
      }
    })

    it("fails if position is not an integer", () => {
      const invalidData = {
        updates: [{ id: MOCK_UUID, position: 100.5 }], // Floats not allowed
      }
      const result = reorderListsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Position must be an integer")
      }
    })
  })
})
