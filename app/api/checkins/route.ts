import { NextRequest } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError } from "@/lib/utils"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)

    const { searchParams } = new URL(req.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (!from || !to) return apiError("from and to required", 400)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return apiError("Invalid date format", 400)
    }

    const checkins = await prisma.checkIn.findMany({
      where: {
        userId: session.userId,
        date: { gte: from, lte: to },
        completed: true,
      },
      select: { habitId: true, date: true, completed: true, note: true },
      orderBy: { date: "asc" },
    })

    return apiSuccess({ checkins })
  } catch {
    return apiError("Something went wrong", 500)
  }
}
