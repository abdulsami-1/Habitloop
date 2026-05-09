import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { signupSchema } from "@/lib/validations"
import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/session"
import { apiSuccess, apiError, apiRateLimit } from "@/lib/utils"
import { createRateLimiter } from "@/lib/rate-limit"

const signupLimiter = createRateLimiter(5, 15 * 60 * 1000)

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

function isDuplicateEmail(err: unknown): boolean {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false
  if (err.code !== "P2002") return false
  const target = (err.meta as { target?: string | string[] } | undefined)?.target
  if (!target) return true
  return Array.isArray(target) ? target.includes("email") : target === "email"
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req)
    const { allowed, retryAfter } = signupLimiter.check(ip)
    if (!allowed) {
      return apiRateLimit("Too many registration attempts. Try again later.", retryAfter)
    }

    const body = await req.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Validation error", 400)
    }
    const { email, password, name } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return apiError("An account with this email already exists.", 409)

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name ?? null },
      select: { id: true, email: true, name: true, timezone: true },
    })

    await createSession(user.id)
    return apiSuccess({ user }, 201)
  } catch (err) {
    if (isDuplicateEmail(err)) {
      return apiError("An account with this email already exists.", 409)
    }
    console.error("[signup] unexpected error:", err instanceof Error ? err.stack : err)
    return apiError("Unable to create account. Please try again.", 500)
  }
}
