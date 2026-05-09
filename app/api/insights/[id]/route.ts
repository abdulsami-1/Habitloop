import { NextRequest } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError } from "@/lib/utils"

export async function PUT(_req: NextRequest, ctx: RouteContext<"/api/insights/[id]">) {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)
    const { id } = await ctx.params

    const existing = await prisma.insight.findUnique({ where: { id }, select: { userId: true } })
    if (!existing) return apiError("Not found", 404)
    if (existing.userId !== session.userId) return apiError("Forbidden", 403)

    const insight = await prisma.insight.update({
      where: { id },
      data: { isRead: true },
      select: { id: true, isRead: true },
    })
    return apiSuccess({ insight })
  } catch {
    return apiError("Something went wrong", 500)
  }
}
