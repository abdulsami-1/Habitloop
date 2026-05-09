import { NextRequest } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { habitSchema, reorderSchema } from "@/lib/validations"
import { apiSuccess, apiError } from "@/lib/utils"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)

    const habits = await prisma.habit.findMany({
      where: { userId: session.userId, isArchived: false },
      orderBy: { order: "asc" },
    })
    return apiSuccess({ habits })
  } catch {
    return apiError("Something went wrong", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)

    const body = await req.json()
    const parsed = habitSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422)

    const count = await prisma.habit.count({ where: { userId: session.userId } })
    const habit = await prisma.habit.create({
      data: { ...parsed.data, userId: session.userId, order: parsed.data.order ?? count },
    })
    return apiSuccess({ habit }, 201)
  } catch {
    return apiError("Something went wrong", 500)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)

    const body = await req.json()
    const parsed = reorderSchema.safeParse(body)
    if (!parsed.success) return apiError("Invalid reorder data", 422)

    const ids = parsed.data.habits.map((h) => h.id)
    const owned = await prisma.habit.findMany({
      where: { id: { in: ids }, userId: session.userId },
      select: { id: true },
    })
    if (owned.length !== ids.length) return apiError("Forbidden", 403)

    await prisma.$transaction(
      parsed.data.habits.map(({ id, order }) =>
        prisma.habit.update({ where: { id }, data: { order } })
      )
    )
    return apiSuccess({ message: "Reordered" })
  } catch {
    return apiError("Something went wrong", 500)
  }
}
