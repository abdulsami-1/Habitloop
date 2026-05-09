import { NextRequest } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { habitUpdateSchema } from "@/lib/validations"
import { apiSuccess, apiError } from "@/lib/utils"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/habits/[id]">) {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)
    const { id } = await ctx.params

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit) return apiError("Not found", 404)
    if (habit.userId !== session.userId) return apiError("Forbidden", 403)
    return apiSuccess({ habit })
  } catch {
    return apiError("Something went wrong", 500)
  }
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/habits/[id]">) {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)
    const { id } = await ctx.params

    const existing = await prisma.habit.findUnique({ where: { id }, select: { userId: true } })
    if (!existing) return apiError("Not found", 404)
    if (existing.userId !== session.userId) return apiError("Forbidden", 403)

    const body = await req.json()
    const parsed = habitUpdateSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422)

    const habit = await prisma.habit.update({ where: { id }, data: parsed.data })
    return apiSuccess({ habit })
  } catch {
    return apiError("Something went wrong", 500)
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/habits/[id]">) {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)
    const { id } = await ctx.params

    const existing = await prisma.habit.findUnique({ where: { id }, select: { userId: true } })
    if (!existing) return apiError("Not found", 404)
    if (existing.userId !== session.userId) return apiError("Forbidden", 403)

    await prisma.habit.delete({ where: { id } })
    return apiSuccess({ message: "Deleted" })
  } catch {
    return apiError("Something went wrong", 500)
  }
}
