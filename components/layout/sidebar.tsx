"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Target, BarChart2, Lightbulb, Bell, User, LogOut, Zap, CalendarCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"

const NAV = [
  { href: "/today", icon: CalendarCheck, label: "Today" },
  { href: "/habits", icon: Target, label: "Habits" },
  { href: "/stats", icon: BarChart2, label: "Stats" },
  { href: "/insights", icon: Lightbulb, label: "Insights" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuthStore()

  return (
    <nav className="flex h-full flex-col gap-1 px-2 py-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold tracking-tight">HabitLoop</span>
      </div>

      <div className="flex flex-1 flex-col gap-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link key={href} href={href}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-accent"
                    transition={{ type: "spring", duration: 0.3 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4 shrink-0" />
                <span className="relative z-10">{label}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>

      <div className="border-t border-border pt-2">
        <div className="px-3 py-1.5">
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </nav>
  )
}
