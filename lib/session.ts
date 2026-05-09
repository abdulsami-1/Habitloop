import "server-only"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

export type SessionPayload = {
  userId: string
  expiresAt: Date
}

if (!process.env.SESSION_SECRET) {
  throw new Error("[session] SESSION_SECRET env var is not set — cannot sign tokens")
}
const key = new TextEncoder().encode(process.env.SESSION_SECRET)

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ userId: payload.userId, expiresAt: payload.expiresAt.toISOString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key)
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] })
    return {
      userId: payload.userId as string,
      expiresAt: new Date(payload.expiresAt as string),
    }
  } catch {
    return null
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const token = await encrypt({ userId, expiresAt })
  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  return decrypt(token)
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function refreshSession() {
  const session = await getSession()
  if (!session) return null
  await createSession(session.userId)
  return session
}
