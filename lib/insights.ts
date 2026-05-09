import "server-only"
import { prisma } from "@/lib/prisma"
import { generateContent } from "@/lib/gemini"
import { getTodayInTimezone } from "@/lib/utils"
import { normalizeInsightContent, type InsightContent } from "@/lib/insight-content"
export type { InsightContent } from "@/lib/insight-content"

function getDOW(date: string): number {
  return new Date(date + "T12:00:00Z").getUTCDay()
}

function dateRange(from: string, to: string): string[] {
  const result: string[] = []
  const end = new Date(to + "T12:00:00Z")
  for (let d = new Date(from + "T12:00:00Z"); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    result.push(d.toISOString().slice(0, 10))
  }
  return result
}

function getWeekStart(date: string): string {
  const d = new Date(date + "T12:00:00Z")
  const dow = d.getUTCDay()
  d.setUTCDate(d.getUTCDate() - (dow === 0 ? 6 : dow - 1))
  return d.toISOString().slice(0, 10)
}

function buildPrompt(params: {
  userName: string | null
  weekStart: string
  weekEnd: string
  habitsList: string
  notesList: string
  totalCompleted: number
  hasNotes: boolean
}): string {
  const notesSection = params.hasNotes
    ? `\nCheck-in notes (use these directly — they describe what was actually happening):\n${params.notesList}`
    : `\nThe user has completed the following habits this week but has not added any notes. Generate encouragement and general pattern-based insights based only on which habits were completed and which were missed each day. Do not reference notes since none exist.`

  return `You are an elite behavioral coach writing a personal weekly reflection for ${params.userName ?? "this person"}. Respond with ONLY a JSON object — no markdown fences, no text outside the JSON.

{
  "headline": "short personal title referencing specific habit names, max 60 chars, no percentages",
  "wentWell": ["warm specific sentence about a habit that showed momentum", "optional second observation — omit if only one stands out"],
  "heldBack": ["one behavioral friction observation naming a specific habit and its likely cause", "another observation if a second habit struggled — otherwise omit this element"],
  "experiment": "one tiny, physical, concrete action for next week. Make it a cue-based micro-habit. Example: 'Place your book on your pillow each morning.' or 'Do one push-up before changing clothes.'"
}

RULES — follow all of them:
- Never use percentages, completion rates, or numbers like "0%" or "3/5"
- Sound like a thoughtful human coach, not a data dashboard
- Always name specific habits (never say "one of your habits")
- For heldBack, diagnose the likely behavioral cause: inconsistency, starting too big, low cue visibility, energy/timing mismatch, or routine conflict
- If check-in notes exist, quote or reference them directly to explain friction or momentum
- If no notes exist, infer from completion patterns alone — still be specific
- The experiment must be tied to a real habit from this week's data
- Every sentence must be grounded in this person's actual data below

Week: ${params.weekStart} to ${params.weekEnd}
Total completed check-ins: ${params.totalCompleted}

Habits this week (completion data):
${params.habitsList}${notesSection}`
}

export async function generateInsightForUser(
  userId: string,
  userName: string | null,
  timezone: string,
  force = false
): Promise<void> {
  const today = getTodayInTimezone(timezone)
  const weekStart = getWeekStart(today)

  if (!force) {
    const existing = await prisma.insight.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
    })
    if (existing) return
  }

  const [habits, checkins] = await Promise.all([
    prisma.habit.findMany({
      where: { userId, isArchived: false },
      select: { id: true, name: true, activeDays: true },
    }),
    prisma.checkIn.findMany({
      where: { userId, date: { gte: weekStart, lte: today }, completed: true },
      select: { habitId: true, date: true, note: true },
    }),
  ])

  if (habits.length === 0 || checkins.length === 0) {
    if (process.env.NODE_ENV === "development") console.log(`[insights] skip userId=${userId}: habits=${habits.length} checkins=${checkins.length}`)
    return
  }

  const checkinSet = new Set(checkins.map((c) => `${c.habitId}:${c.date}`))
  const weekDays = dateRange(weekStart, today)

  const notesByHabit: Record<string, { date: string; note: string }[]> = {}
  for (const c of checkins) {
    if (c.note?.trim()) {
      if (!notesByHabit[c.habitId]) notesByHabit[c.habitId] = []
      notesByHabit[c.habitId].push({ date: c.date, note: c.note.trim() })
    }
  }

  const habitStats = habits.map((h) => {
    const expected = weekDays.filter((d) => h.activeDays.includes(getDOW(d)))
    const completed = expected.filter((d) => checkinSet.has(`${h.id}:${d}`))
    return {
      name: h.name,
      expected: expected.length,
      completed: completed.length,
      notes: notesByHabit[h.id] ?? [],
    }
  })

  const totalCompleted = habitStats.reduce((s, h) => s + h.completed, 0)

  const habitsList = habitStats
    .map((h) => {
      const base = `- ${h.name}: ${h.completed}/${h.expected} days`
      if (h.notes.length === 0) return base
      const noteLines = h.notes.map((n) => `    [${n.date}] "${n.note}"`).join("\n")
      return `${base}\n${noteLines}`
    })
    .join("\n")

  const hasNotes = Object.keys(notesByHabit).length > 0
  const notesList = hasNotes
    ? Object.entries(notesByHabit)
        .map(([habitId, notes]) => {
          const habitName = habits.find((h) => h.id === habitId)?.name ?? habitId
          return notes.map((n) => `- ${habitName} (${n.date}): "${n.note}"`).join("\n")
        })
        .join("\n")
    : ""

  if (process.env.NODE_ENV === "development") console.log(`[insights] notes found: ${Object.values(notesByHabit).flat().length} across ${Object.keys(notesByHabit).length} habits`)

  const raw = await generateContent(
    buildPrompt({ userName, weekStart, weekEnd: today, habitsList, notesList, hasNotes, totalCompleted })
  )

  let content: InsightContent
  try {
    const match = raw.match(/\{[\s\S]*\}/)
    content = normalizeInsightContent(match ? JSON.parse(match[0]) : null)
  } catch {
    content = normalizeInsightContent(null)
  }

  if (!weekStart) throw new Error("weekStart is missing — cannot save insight")
  if (!content.headline) throw new Error("Malformed AI response: insight content is empty or missing headline")

  if (process.env.NODE_ENV === "development") console.log(`[insights] saving | userId=${userId} | weekStart=${weekStart} | headline="${content.headline}"`)

  await prisma.insight.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    create: { userId, weekStart, content: JSON.stringify(content) },
    update: { content: JSON.stringify(content) },
  })

  await prisma.notification.create({
    data: {
      userId,
      title: "Weekly insight ready",
      body: content.headline,
    },
  }).catch(() => {})
}

export async function generateWeeklyInsights(): Promise<void> {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, timezone: true },
  })
  for (const user of users) {
    try {
      await generateInsightForUser(user.id, user.name, user.timezone)
    } catch (err) {
      console.error(`[cron] Insight failed for user ${user.id}:`, err)
    }
  }
}
