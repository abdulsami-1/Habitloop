import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError } from "@/lib/utils"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, timezone: true, createdAt: true },
    })
    if (!user) return apiError("User not found", 404)
    return apiSuccess({ user })
  } catch (err) {
    console.error("[api/auth/me] GET error:", err instanceof Error ? err.stack : err)
    return apiError("Something went wrong", 500)
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)

    const { profileSchema } = await import("@/lib/validations")
    const body = await req.json()
    const parsed = profileSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422)

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: parsed.data,
      select: { id: true, email: true, name: true, timezone: true },
    })
    return apiSuccess({ user })
  } catch (err) {
    console.error("[api/auth/me] PUT error:", err instanceof Error ? err.stack : err)
    return apiError("Something went wrong", 500)
  }
}
