export type InsightContent = {
  headline: string
  wentWell: string[]
  heldBack: string[]
  experiment: string
}

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
  if (typeof v === "string" && v.trim()) return [v.trim()]
  return []
}

export function normalizeInsightContent(raw: unknown): InsightContent {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { headline: "Weekly Reflection", wentWell: [], heldBack: [], experiment: "" }
  }
  const obj = raw as Record<string, unknown>
  const experiment =
    (typeof obj.experiment === "string" ? obj.experiment.trim() : "") ||
    (typeof obj.tip === "string" ? obj.tip.trim() : "")

  return {
    headline: typeof obj.headline === "string" && obj.headline.trim() ? obj.headline.trim() : "Weekly Reflection",
    wentWell: toStringArray(obj.wentWell ?? obj.summary),
    heldBack: toStringArray(obj.heldBack ?? obj.patterns),
    experiment,
  }
}

export function parseInsightContent(json: string): InsightContent {
  try {
    const match = json.match(/\{[\s\S]*\}/)
    if (!match) return normalizeInsightContent(null)
    return normalizeInsightContent(JSON.parse(match[0]))
  } catch {
    return { headline: "Weekly Reflection", wentWell: [], heldBack: [], experiment: "" }
  }
}
