import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError, getTodayInTimezone } from "@/lib/utils"
import { computeCurrentStreak, computeLongestStreak } from "@/lib/streak"

function daysAgo(today: string, n: number): string {
  const d = new Date(today + "T12:00:00Z")
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

function dateRange(from: string, to: string): string[] {
  const result: string[] = []
  const end = new Date(to + "T12:00:00Z")
  for (let d = new Date(from + "T12:00:00Z"); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    result.push(d.toISOString().slice(0, 10))
  }
  return result
}

function getDOW(date: string): number {
  return new Date(date + "T12:00:00Z").getUTCDay()
}

function getWeekStart(date: string): string {
  const d = new Date(date + "T12:00:00Z")
  const dow = d.getUTCDay()
  const daysToMon = dow === 0 ? 6 : dow - 1
  d.setUTCDate(d.getUTCDate() - daysToMon)
  return d.toISOString().slice(0, 10)
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { timezone: true },
    })

    const today = getTodayInTimezone(user?.timezone ?? "UTC")
    const from365 = daysAgo(today, 364)
    const from90 = daysAgo(today, 89)
    const from30 = daysAgo(today, 29)

    const [habits, checkins] = await Promise.all([
      prisma.habit.findMany({
        where: { userId: session.userId, isArchived: false },
        select: { id: true, name: true, color: true, icon: true, activeDays: true },
      }),
      prisma.checkIn.findMany({
        where: { userId: session.userId, date: { gte: from365, lte: today }, completed: true },
        select: { habitId: true, date: true },
      }),
    ])

    const checkinSet = new Set(checkins.map((c) => `${c.habitId}:${c.date}`))
    const checkinsByHabit: Record<string, string[]> = {}
    for (const c of checkins) {
      ;(checkinsByHabit[c.habitId] ??= []).push(c.date)
    }

    // Per-habit stats
    const habitStats = habits.map((h) => {
      const dates = checkinsByHabit[h.id] ?? []
      const from30Days = dateRange(from30, today).filter((d) => h.activeDays.includes(getDOW(d)))
      const completed30 = dates.filter((d) => d >= from30).length
      return {
        id: h.id,
        name: h.name,
        color: h.color,
        icon: h.icon,
        currentStreak: computeCurrentStreak(dates, today),
        longestStreak: computeLongestStreak(dates),
        totalCheckins: dates.length,
        completionRate30d: from30Days.length > 0 ? completed30 / from30Days.length : 0,
      }
    })

    // Heatmap: daily completion rate for last 365 days
    const allDays = dateRange(from365, today)
    const heatmapDays = allDays.map((date) => {
      const dow = getDOW(date)
      const expected = habits.filter((h) => h.activeDays.includes(dow)).length
      const completed = habits.filter(
        (h) => h.activeDays.includes(dow) && checkinSet.has(`${h.id}:${date}`)
      ).length
      return { date, rate: expected > 0 ? completed / expected : 0, count: completed }
    })

    // Weekly trend: last 8 complete weeks + current week
    const weekMap: Record<string, { completed: number; expected: number }> = {}
    for (const date of dateRange(daysAgo(today, 55), today)) {
      const ws = getWeekStart(date)
      const entry = (weekMap[ws] ??= { completed: 0, expected: 0 })
      const dow = getDOW(date)
      for (const h of habits) {
        if (h.activeDays.includes(dow)) {
          entry.expected++
          if (checkinSet.has(`${h.id}:${date}`)) entry.completed++
        }
      }
    }
    const weeklyTrend = Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, { completed, expected }]) => ({
        week,
        completed,
        expected,
        rate: expected > 0 ? Math.round((completed / expected) * 100) : 0,
      }))

    // Day-of-week stats: last 90 days
    const dowMap: Record<number, { completed: number; expected: number }> = {}
    for (let i = 0; i < 7; i++) dowMap[i] = { completed: 0, expected: 0 }
    for (const date of dateRange(from90, today)) {
      const dow = getDOW(date)
      for (const h of habits) {
        if (h.activeDays.includes(dow)) {
          dowMap[dow].expected++
          if (checkinSet.has(`${h.id}:${date}`)) dowMap[dow].completed++
        }
      }
    }
    const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const dowStats = Object.entries(dowMap).map(([day, { completed, expected }]) => ({
      day: Number(day),
      label: DOW_LABELS[Number(day)],
      rate: expected > 0 ? Math.round((completed / expected) * 100) : 0,
    }))

    const overview = {
      totalCheckins: checkins.length,
      currentStreak: habitStats.length > 0 ? Math.max(...habitStats.map((h) => h.currentStreak)) : 0,
      longestStreak: habitStats.length > 0 ? Math.max(...habitStats.map((h) => h.longestStreak)) : 0,
      completionRateThisWeek: weeklyTrend.at(-1)?.rate ?? 0,
      completionRateLastWeek: weeklyTrend.at(-2)?.rate ?? 0,
      totalHabits: habits.length,
    }

    return apiSuccess({ overview, weeklyTrend, dowStats, heatmapDays, habits: habitStats })
  } catch {
    return apiError("Something went wrong", 500)
  }
}
