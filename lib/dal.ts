import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) {
    redirect("/login")
  }
  return { isAuth: true, userId: session.userId }
})

export const getCurrentUser = cache(async () => {
  const session = await getSession()
  if (!session?.userId) return null
  try {
    return await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, timezone: true, createdAt: true },
    })
  } catch {
    return null
  }
})
