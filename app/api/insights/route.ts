import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError, apiInfo, apiRateLimit } from "@/lib/utils"
import { getTodayInTimezone } from "@/lib/utils"
import { createRateLimiter } from "@/lib/rate-limit"

// Per-user AI rate limiter: 10 generations per minute
const insightsLimiter = createRateLimiter(10, 60_000)

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)

    const insights = await prisma.insight.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, weekStart: true, content: true, isRead: true, createdAt: true },
    })

    return apiSuccess({ insights })
  } catch (err) {
    console.error("[insights] GET error:", err instanceof Error ? err.stack : err)
    return apiError("Something went wrong", 500)
  }
}

export async function POST() {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)

    // Per-user rate limit: 10 generations per minute
    const { allowed, retryAfter } = insightsLimiter.check(session.userId)
    if (!allowed) {
      return apiRateLimit("Insight generation rate limit reached. Try again shortly.", retryAfter)
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return apiError("AI insights not configured", 503)
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, timezone: true },
    })
    if (!user) return apiError("User not found", 404)

    const today = getTodayInTimezone(user.timezone)
    const sevenDaysAgo = (() => {
      const d = new Date(today + "T12:00:00Z")
      d.setUTCDate(d.getUTCDate() - 6)
      return d.toISOString().slice(0, 10)
    })()

    const [habitCount, recentCheckins] = await Promise.all([
      prisma.habit.count({ where: { userId: session.userId, isArchived: false } }),
      prisma.checkIn.findMany({
        where: { userId: session.userId, date: { gte: sevenDaysAgo, lte: today }, completed: true },
        select: { note: true },
      }),
    ])

    if (habitCount === 0) {
      return apiInfo("You have not created any habits yet. Create some habits and start tracking them before generating insights.")
    }
    if (recentCheckins.length === 0) {
      return apiInfo("You have not completed any habits this week. Check in to your habits for a few days before generating insights.")
    }
    if (recentCheckins.length < 3) {
      return apiInfo("You need at least 3 completed habit check-ins before generating insights. Keep tracking and try again in a few days.")
    }

    // Log usage for per-user abuse monitoring
    console.info(`[insights] generate | userId=${session.userId} | ts=${new Date().toISOString()}`)

    const { generateInsightForUser } = await import("@/lib/insights")
    await generateInsightForUser(session.userId, user.name, user.timezone, true)

    const insight = await prisma.insight.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, weekStart: true, content: true, isRead: true, createdAt: true },
    })

    return apiSuccess({ insight }, 201)
  } catch (err) {
    console.error("[insights] POST error:", err instanceof Error ? err.stack : err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}
