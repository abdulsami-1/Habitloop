"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarCheck, Target, BarChart2, Lightbulb, User } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/today", icon: CalendarCheck, label: "Today" },
  { href: "/habits", icon: Target, label: "Habits" },
  { href: "/stats", icon: BarChart2, label: "Stats" },
  { href: "/insights", icon: Lightbulb, label: "Insights" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background md:hidden">
      <div className="flex">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
