import { NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/lib/session"

const PUBLIC_ROUTES = ["/login", "/register"]
const AUTH_ROUTES = ["/login", "/register"]

// 60 req/min/IP — module-level, single-instance only (replace with Redis for multi-instance)
const apiRateStore = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_REQUESTS = 60

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const token = req.cookies.get("session")?.value
  const session = await decrypt(token)

  const isPublic = PUBLIC_ROUTES.some((r) => path.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r))
  const isApi = path.startsWith("/api")

  if (isApi) {
    const ip = getIp(req)
    const now = Date.now()
    const entry = apiRateStore.get(ip)
    if (!entry || now > entry.resetAt) {
      apiRateStore.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    } else if (entry.count >= MAX_REQUESTS) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return NextResponse.json(
        { success: false, error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      )
    } else {
      entry.count++
    }
    return NextResponse.next()
  }

  if (!session?.userId && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (session?.userId && isAuthRoute) {
    return NextResponse.redirect(new URL("/habits", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
}
