import {
  cn,
  calculateFractionalPosition,
  timeAgo,
  formatDate,
  calculateProgress,
  getFullName,
  formatFileSize,
} from "@/lib/utils"

describe("Utils Library", () => {
  // ---------------------------------------------------------------------------
  // 1. cn (Tailwind Class Merge)
  // ---------------------------------------------------------------------------
  describe("cn", () => {
    it("merges basic classes together", () => {
      expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white")
    })

    it("resolves tailwind conflicts correctly", () => {
      // twMerge should recognize that p-4 overrides p-2
      expect(cn("p-2", "p-4")).toBe("p-4")
      // bg-blue-500 overrides bg-red-500
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500")
    })

    it("handles conditional classes", () => {
      const isActive = true
      const isFailed = false
      expect(cn("base-class", isActive && "active", isFailed && "failed")).toBe("base-class active")
    })
  })

  // ---------------------------------------------------------------------------
  // 2. calculateFractionalPosition (Drag & Drop LexoRank style)
  // ---------------------------------------------------------------------------
  describe("calculateFractionalPosition", () => {
    it("returns 65536 when no positions are provided (first item ever)", () => {
      expect(calculateFractionalPosition()).toEqual({ position: 65536, needsRebalance: false })
    })

    it("adds 65536 when only prevPosition is provided (moved to bottom)", () => {
      expect(calculateFractionalPosition(100000, undefined)).toEqual({
        position: 165536,
        needsRebalance: false,
      })
    })

    it("subtracts 65536 when only nextPosition is provided (moved to top)", () => {
      expect(calculateFractionalPosition(undefined, 200000)).toEqual({
        position: 134464,
        needsRebalance: false,
      })
    })

    it("calculates the exact middle when both are provided", () => {
      expect(calculateFractionalPosition(100000, 200000)).toEqual({
        position: 150000,
        needsRebalance: false,
      })
    })

    it("flags needsRebalance when positions collide (no integers between)", () => {
      // 100 and 101 have no integers between them, so Math.round will snap to 101
      expect(calculateFractionalPosition(100, 101)).toEqual({
        position: 101,
        needsRebalance: true,
      })
    })
  })

  // ---------------------------------------------------------------------------
  // 3. timeAgo (Relative Time)
  // ---------------------------------------------------------------------------
  describe("timeAgo", () => {
    beforeAll(() => {
      // Freeze time to specifically March 24, 2026, 12:00:00 UTC
      jest.useFakeTimers()
      jest.setSystemTime(new Date("2026-03-24T12:00:00Z"))
    })

    afterAll(() => {
      // Restore real time after tests
      jest.useRealTimers()
    })

    it("returns 'just now' for times less than 60 seconds ago", () => {
      const thirtySecondsAgo = new Date("2026-03-24T11:59:30Z")
      expect(timeAgo(thirtySecondsAgo)).toBe("just now")
    })

    it("returns '1 minute ago' for singular minutes", () => {
      const oneMinuteAgo = new Date("2026-03-24T11:59:00Z")
      expect(timeAgo(oneMinuteAgo)).toBe("1 minute ago")
    })

    it("returns 'X minutes ago' for plural minutes", () => {
      const fiveMinutesAgo = new Date("2026-03-24T11:55:00Z")
      expect(timeAgo(fiveMinutesAgo)).toBe("5 minutes ago")
    })

    it("returns '1 hour ago'", () => {
      const oneHourAgo = new Date("2026-03-24T11:00:00Z")
      expect(timeAgo(oneHourAgo)).toBe("1 hour ago")
    })

    it("returns 'yesterday' for 1 day ago", () => {
      const yesterday = new Date("2026-03-23T12:00:00Z")
      expect(timeAgo(yesterday)).toBe("yesterday")
    })

    it("returns 'X days ago'", () => {
      const fiveDaysAgo = new Date("2026-03-19T12:00:00Z")
      expect(timeAgo(fiveDaysAgo)).toBe("5 days ago")
    })

    it("returns 'X months ago'", () => {
      const twoMonthsAgo = new Date("2026-01-15T12:00:00Z")
      expect(timeAgo(twoMonthsAgo)).toBe("2 months ago")
    })

    it("returns '1 year ago'", () => {
      const oneYearAgo = new Date("2025-03-24T12:00:00Z")
      expect(timeAgo(oneYearAgo)).toBe("1 year ago")
    })
  })

  // ---------------------------------------------------------------------------
  // 4. formatDate
  // ---------------------------------------------------------------------------
  describe("formatDate", () => {
    const testDate = new Date("2026-03-24T12:00:00Z")

    it("formats 'full' correctly", () => {
      // Note: toLocaleDateString output can vary slightly based on environment (Node vs Browser).
      // JSDOM usually defaults to en-US.
      expect(formatDate(testDate, "full")).toBe("Tuesday, March 24, 2026")
    })

    it("formats 'long' correctly", () => {
      expect(formatDate(testDate, "long")).toBe("March 24, 2026")
    })

    it("formats 'short' correctly", () => {
      expect(formatDate(testDate, "short")).toBe("Mar 24")
    })

    it("formats 'shortWithYear' correctly (and as default)", () => {
      expect(formatDate(testDate, "shortWithYear")).toBe("Mar 24, 2026")
      expect(formatDate(testDate)).toBe("Mar 24, 2026") // tests default fallback
    })
  })

  // ---------------------------------------------------------------------------
  // 5. calculateProgress
  // ---------------------------------------------------------------------------
  describe("calculateProgress", () => {
    it("calculates percentage accurately", () => {
      expect(calculateProgress({ tasks: 10, completedTasks: 5 })).toEqual({
        total: 10,
        completed: 5,
        percent: 50,
      })
    })

    it("rounds percentages to the nearest integer", () => {
      expect(calculateProgress({ tasks: 3, completedTasks: 1 })).toEqual({
        total: 3,
        completed: 1,
        percent: 33, // 33.333... rounded
      })
    })

    it("returns 0% safely if total tasks is 0 (avoids NaN error)", () => {
      expect(calculateProgress({ tasks: 0, completedTasks: 0 })).toEqual({
        total: 0,
        completed: 0,
        percent: 0,
      })
    })

    it("handles undefined inputs gracefully", () => {
      expect(calculateProgress(undefined)).toEqual({
        total: 0,
        completed: 0,
        percent: 0,
      })
    })
  })

  // ---------------------------------------------------------------------------
  // 6. getFullName
  // ---------------------------------------------------------------------------
  describe("getFullName", () => {
    it("combines first and last name", () => {
      expect(getFullName({ firstName: "John", lastName: "Doe" })).toBe("John Doe")
    })

    it("returns only first name if last name is missing", () => {
      expect(getFullName({ firstName: "Jane", lastName: null })).toBe("Jane")
    })

    it("returns 'Unknown User' if names are missing or empty", () => {
      expect(getFullName({ firstName: "", lastName: "" })).toBe("Unknown User")
      expect(getFullName(null)).toBe("Unknown User")
      expect(getFullName(undefined)).toBe("Unknown User")
    })
  })

  // ---------------------------------------------------------------------------
  // 7. formatFileSize
  // ---------------------------------------------------------------------------
  describe("formatFileSize", () => {
    it("returns '0 B' for 0 bytes", () => {
      expect(formatFileSize(0)).toBe("0 B")
    })

    it("formats KB correctly", () => {
      expect(formatFileSize(1024)).toBe("1 KB")
      expect(formatFileSize(1536)).toBe("1.5 KB")
    })

    it("formats MB correctly", () => {
      expect(formatFileSize(1048576)).toBe("1 MB")
      expect(formatFileSize(2621440)).toBe("2.5 MB")
    })

    it("formats GB correctly", () => {
      expect(formatFileSize(1073741824)).toBe("1 GB")
    })
  })
})
