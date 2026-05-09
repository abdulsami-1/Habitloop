"use client"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useNotificationsStore } from "@/store/notifications-store"

const TITLES: Record<string, string> = {
  "/today": "Today",
  "/habits": "Habits",
  "/stats": "Stats",
  "/insights": "Insights",
  "/notifications": "Notifications",
  "/profile": "Profile",
}

export function Header() {
  const pathname = usePathname()
  const title = Object.entries(TITLES).find(([k]) => pathname === k || pathname.startsWith(k + "/"))?.[1] ?? "HabitLoop"
  const unreadCount = useNotificationsStore((s) => s.unreadCount)

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6">
      <h1 className="text-sm font-semibold">{title}</h1>
      <Button variant="ghost" size="icon" className="relative" asChild>
        <Link href="/notifications" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </Button>
    </header>
  )
}
