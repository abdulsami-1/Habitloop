import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { loginSchema } from "@/lib/validations"
import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/session"
import { apiSuccess, apiError, apiRateLimit } from "@/lib/utils"
import { createRateLimiter } from "@/lib/rate-limit"

// IP-based rate limiter: 5 attempts per 15 min per IP
const ipLimiter = createRateLimiter(5, 15 * 60 * 1000)

// Per-account lockout: 5 failed attempts per 15 min per email
const accountFailures = createRateLimiter(5, 15 * 60 * 1000)

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req)

    const ipCheck = ipLimiter.check(ip)
    if (!ipCheck.allowed) {
      return apiRateLimit("Too many login attempts. Try again later.", ipCheck.retryAfter)
    }

    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) return apiError("Invalid credentials", 422)

    const { email, password } = parsed.data

    // Check per-account lockout before hitting DB
    const accountCheck = accountFailures.check(email)
    if (!accountCheck.allowed) {
      return apiRateLimit(
        "Account temporarily locked due to too many failed attempts. Try again later.",
        accountCheck.retryAfter,
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Record failure against email even when account doesn't exist to prevent timing enumeration
      return apiError("Invalid credentials", 401)
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return apiError("Invalid credentials", 401)
    }

    // Successful login: clear both rate limits
    ipLimiter.clear(ip)
    accountFailures.clear(email)

    await createSession(user.id)
    return apiSuccess({
      user: { id: user.id, email: user.email, name: user.name, timezone: user.timezone },
    })
  } catch {
    return apiError("Something went wrong", 500)
  }
}
