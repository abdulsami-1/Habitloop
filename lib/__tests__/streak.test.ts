import { describe, it, expect } from "vitest"
import { computeCurrentStreak, computeLongestStreak, computeStreaks } from "../streak"

const TODAY = "2026-05-08"

describe("computeCurrentStreak", () => {
  it("returns 0 for no completions", () => {
    expect(computeCurrentStreak([], TODAY)).toBe(0)
  })

  it("returns 1 when only today completed", () => {
    expect(computeCurrentStreak([TODAY], TODAY)).toBe(1)
  })

  it("counts consecutive days ending today", () => {
    expect(computeCurrentStreak(["2026-05-06", "2026-05-07", TODAY], TODAY)).toBe(3)
  })

  it("counts consecutive days when today not yet completed", () => {
    expect(computeCurrentStreak(["2026-05-06", "2026-05-07"], TODAY)).toBe(2)
  })

  it("allows 1 grace day by default", () => {
    // Completed May 6 and May 8, skipped May 7 (grace)
    expect(computeCurrentStreak(["2026-05-06", TODAY], TODAY, 1)).toBe(2)
  })

  it("breaks streak when gap exceeds grace days", () => {
    // Completed May 4 and May 8, gap of 3 days — only today counts
    expect(computeCurrentStreak(["2026-05-04", TODAY], TODAY, 1)).toBe(1)
  })

  it("returns 0 when last completion is too old", () => {
    expect(computeCurrentStreak(["2026-04-01"], TODAY, 1)).toBe(0)
  })

  it("grace day = 0 breaks on any miss", () => {
    expect(computeCurrentStreak(["2026-05-06", TODAY], TODAY, 0)).toBe(1)
  })
})

describe("computeLongestStreak", () => {
  it("returns 0 for empty", () => {
    expect(computeLongestStreak([])).toBe(0)
  })

  it("returns 1 for single entry", () => {
    expect(computeLongestStreak([TODAY])).toBe(1)
  })

  it("finds a 3-day run across two separate runs", () => {
    expect(computeLongestStreak([
      "2026-05-01", "2026-05-02", "2026-05-03",
      "2026-05-07", "2026-05-08",
    ])).toBe(3)
  })

  it("handles unsorted input", () => {
    expect(computeLongestStreak([
      "2026-05-08", "2026-05-06", "2026-05-07",
    ])).toBe(3)
  })
})

describe("computeStreaks", () => {
  it("correctly identifies todayCompleted", () => {
    const result = computeStreaks([TODAY], TODAY)
    expect(result.todayCompleted).toBe(true)
  })

  it("returns false todayCompleted when not done", () => {
    const result = computeStreaks(["2026-05-07"], TODAY)
    expect(result.todayCompleted).toBe(false)
  })

  it("returns all three fields", () => {
    const result = computeStreaks(["2026-05-07", TODAY], TODAY)
    expect(result).toMatchObject({ current: 2, longest: 2, todayCompleted: true })
  })
})
