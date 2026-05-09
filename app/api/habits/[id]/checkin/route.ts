import { NextRequest } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { checkinSchema } from "@/lib/validations"
import { apiSuccess, apiError, getTodayInTimezone } from "@/lib/utils"
import { z } from "zod"

const noteUpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(500).trim().nullable().optional(),
})

export async function POST(req: NextRequest, ctx: RouteContext<"/api/habits/[id]/checkin">) {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)
    const { id } = await ctx.params

    const habit = await prisma.habit.findUnique({ where: { id }, select: { userId: true } })
    if (!habit) return apiError("Not found", 404)
    if (habit.userId !== session.userId) return apiError("Forbidden", 403)

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { timezone: true },
    })

    const body = await req.json().catch(() => ({}))
    const parsed = checkinSchema.safeParse({
      date: body.date ?? getTodayInTimezone(user?.timezone ?? "UTC"),
      note: body.note,
    })
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422)

    const { date, note } = parsed.data

    const existing = await prisma.checkIn.findUnique({
      where: { userId_habitId_date: { userId: session.userId, habitId: id, date } },
    })

    if (existing) {
      await prisma.checkIn.delete({ where: { id: existing.id } })
      return apiSuccess({ checkin: null, action: "deleted" })
    }

    const checkin = await prisma.checkIn.create({
      data: { userId: session.userId, habitId: id, date, note, completed: true },
    })
    return apiSuccess({ checkin, action: "created" }, 201)
  } catch {
    return apiError("Something went wrong", 500)
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/habits/[id]/checkin">) {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)
    const { id } = await ctx.params

    const habit = await prisma.habit.findUnique({ where: { id }, select: { userId: true } })
    if (!habit) return apiError("Not found", 404)
    if (habit.userId !== session.userId) return apiError("Forbidden", 403)

    const body = await req.json().catch(() => ({}))
    const parsed = noteUpdateSchema.safeParse(body)
    if (!parsed.success) return apiError("Invalid request", 400)

    const { date, note } = parsed.data

    const existing = await prisma.checkIn.findUnique({
      where: { userId_habitId_date: { userId: session.userId, habitId: id, date } },
    })
    if (!existing) return apiError("Check-in not found", 404)

    const checkin = await prisma.checkIn.update({
      where: { id: existing.id },
      data: { note: note?.trim() || null },
      select: { id: true, note: true },
    })
    return apiSuccess({ checkin })
  } catch {
    return apiError("Something went wrong", 500)
  }
}
