"use client"
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, CheckCheck } from "lucide-react"
import { useNotificationsStore } from "@/store/notifications-store"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function NotificationsClient() {
  const { notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead } =
    useNotificationsStore()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  if (loading && notifications.length === 0) {
    return (
      <div className="max-w-2xl space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      {notifications.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      )}

      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-20 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <Bell className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No notifications</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              You&apos;ll see updates and insights here
            </p>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                  n.isRead ? "border-border/50 bg-card/50" : "border-primary/25 bg-card"
                )}
              >
                <div className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  n.isRead ? "bg-secondary" : "bg-primary/10"
                )}>
                  <Bell className={cn("h-3.5 w-3.5", n.isRead ? "text-muted-foreground" : "text-primary")} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium", n.isRead && "text-muted-foreground")}>
                      {n.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Mark as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
