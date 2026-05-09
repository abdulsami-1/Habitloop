import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError } from "@/lib/utils"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)

    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, title: true, body: true, isRead: true, createdAt: true },
    })

    const unreadCount = notifications.filter((n) => !n.isRead).length
    return apiSuccess({ notifications, unreadCount })
  } catch {
    return apiError("Something went wrong", 500)
  }
}

export async function PATCH() {
  try {
    const session = await getSession()
    if (!session?.userId) return apiError("Unauthorized", 401)

    await prisma.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    })

    return apiSuccess({ message: "All marked read" })
  } catch {
    return apiError("Something went wrong", 500)
  }
}
