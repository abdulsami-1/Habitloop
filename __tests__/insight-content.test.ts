import { describe, it, expect } from "vitest"
import { normalizeInsightContent, parseInsightContent } from "@/lib/insight-content"

describe("normalizeInsightContent", () => {
  it("returns safe defaults for empty object", () => {
    const result = normalizeInsightContent({})
    expect(result.headline).toBe("Weekly Reflection")
    expect(result.wentWell).toEqual([])
    expect(result.heldBack).toEqual([])
    expect(result.experiment).toBe("")
  })

  it("preserves valid wentWell array", () => {
    const result = normalizeInsightContent({ wentWell: ["Great job on Reading"] })
    expect(result.wentWell).toEqual(["Great job on Reading"])
    expect(result.heldBack).toEqual([])
  })

  it("coerces wentWell string to single-element array", () => {
    const result = normalizeInsightContent({ wentWell: "You showed momentum." })
    expect(result.wentWell).toEqual(["You showed momentum."])
  })

  it("treats null heldBack as empty array", () => {
    const result = normalizeInsightContent({ heldBack: null })
    expect(result.heldBack).toEqual([])
  })

  it("filters non-string elements from heldBack array", () => {
    const result = normalizeInsightContent({ heldBack: ["valid", null, 42, "also valid"] })
    expect(result.heldBack).toEqual(["valid", "also valid"])
  })

  it("defaults missing experiment to empty string", () => {
    const result = normalizeInsightContent({ wentWell: ["x"], heldBack: ["y"] })
    expect(result.experiment).toBe("")
  })

  it("returns defaults for null input", () => {
    const result = normalizeInsightContent(null)
    expect(result).toEqual({ headline: "Weekly Reflection", wentWell: [], heldBack: [], experiment: "" })
  })

  it("returns defaults for array input", () => {
    const result = normalizeInsightContent([{ headline: "injected" }])
    expect(result.headline).toBe("Weekly Reflection")
  })

  it("returns defaults for non-object primitives", () => {
    expect(normalizeInsightContent(42).wentWell).toEqual([])
    expect(normalizeInsightContent("string").heldBack).toEqual([])
    expect(normalizeInsightContent(true).experiment).toBe("")
  })

  it("uses fallback headline when headline is empty string", () => {
    const result = normalizeInsightContent({ headline: "" })
    expect(result.headline).toBe("Weekly Reflection")
  })

  it("trims whitespace-only strings from arrays", () => {
    const result = normalizeInsightContent({ wentWell: ["  ", "real content"] })
    expect(result.wentWell).toEqual(["real content"])
  })
})

describe("parseInsightContent", () => {
  it("parses valid JSON with all fields", () => {
    const json = JSON.stringify({
      headline: "Strong Week",
      wentWell: ["Reading was consistent"],
      heldBack: ["Workout missed due to timing"],
      experiment: "Do one push-up before changing clothes.",
    })
    const result = parseInsightContent(json)
    expect(result.headline).toBe("Strong Week")
    expect(result.wentWell).toEqual(["Reading was consistent"])
    expect(result.heldBack).toEqual(["Workout missed due to timing"])
    expect(result.experiment).toBe("Do one push-up before changing clothes.")
  })

  it("does not crash on empty object JSON", () => {
    const result = parseInsightContent("{}")
    expect(result.headline).toBe("Weekly Reflection")
    expect(result.wentWell).toEqual([])
    expect(result.heldBack).toEqual([])
    expect(result.experiment).toBe("")
  })

  it("does not crash on completely invalid JSON", () => {
    const result = parseInsightContent("not json at all }{")
    expect(result.headline).toBe("Weekly Reflection")
    expect(result.wentWell).toEqual([])
  })

  it("does not crash on empty string", () => {
    const result = parseInsightContent("")
    expect(result.wentWell).toEqual([])
  })

  it("extracts JSON embedded in markdown fences", () => {
    const json = '```json\n{"headline":"Test","wentWell":["ok"],"heldBack":[],"experiment":"try this"}\n```'
    const result = parseInsightContent(json)
    expect(result.headline).toBe("Test")
    expect(result.wentWell).toEqual(["ok"])
  })

  it("normalizes partial object — only wentWell present", () => {
    const result = parseInsightContent(JSON.stringify({ wentWell: ["x"] }))
    expect(result.wentWell).toEqual(["x"])
    expect(result.heldBack).toEqual([])
    expect(result.experiment).toBe("")
    expect(result.headline).toBe("Weekly Reflection")
  })

  it("normalizes when heldBack is null in JSON", () => {
    const result = parseInsightContent(JSON.stringify({ headline: "Good", heldBack: null }))
    expect(result.heldBack).toEqual([])
  })

  it("does not crash on missing experiment field", () => {
    const result = parseInsightContent(JSON.stringify({ headline: "h", wentWell: ["w"], heldBack: ["b"] }))
    expect(result.experiment).toBe("")
  })
})
