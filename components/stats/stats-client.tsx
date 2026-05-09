"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Activity, Flame, Trophy, CalendarDays } from "lucide-react"
import { StatCard } from "@/components/stats/stat-card"
import { Heatmap } from "@/components/stats/heatmap"
import { HabitLeaderboard } from "@/components/stats/habit-leaderboard"
import { Skeleton } from "@/components/ui/skeleton"

const WeeklyChart = dynamic(() => import("@/components/stats/weekly-chart").then((m) => m.WeeklyChart), {
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full" />,
})

const DowChart = dynamic(() => import("@/components/stats/dow-chart").then((m) => m.DowChart), {
  ssr: false,
  loading: () => <Skeleton className="h-28 w-full" />,
})

type Overview = {
  totalCheckins: number
  currentStreak: number
  longestStreak: number
  completionRateThisWeek: number
  completionRateLastWeek: number
  totalHabits: number
}

type WeeklyTrend = { week: string; rate: number; completed: number; expected: number }
type DowStat = { day: number; label: string; rate: number }
type HeatmapDay = { date: string; rate: number; count: number }
type HabitStat = {
  id: string; name: string; color: string; icon: string
  currentStreak: number; longestStreak: number; totalCheckins: number; completionRate30d: number
}

type StatsData = {
  overview: Overview
  weeklyTrend: WeeklyTrend[]
  dowStats: DowStat[]
  heatmapDays: HeatmapDay[]
  habits: HabitStat[]
}

export function StatsClient() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setData(j.data)
        else setError(j.error)
      })
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-36 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <p className="py-16 text-center text-sm text-destructive">{error ?? "No data"}</p>
    )
  }

  const { overview, weeklyTrend, dowStats, heatmapDays, habits } = data
  const weekTrend = overview.completionRateThisWeek - overview.completionRateLastWeek

  return (
    <div className="max-w-4xl space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total check-ins"
          value={overview.totalCheckins}
          icon={Activity}
        />
        <StatCard
          label="Current streak"
          value={`${overview.currentStreak}d`}
          icon={Flame}
        />
        <StatCard
          label="Longest streak"
          value={`${overview.longestStreak}d`}
          icon={Trophy}
        />
        <StatCard
          label="This week"
          value={`${overview.completionRateThisWeek}%`}
          icon={CalendarDays}
          trend={weekTrend}
        />
      </div>

      {/* Heatmap */}
      <section className="space-y-3 rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Activity</h3>
        <Heatmap days={heatmapDays} />
      </section>

      {/* Charts row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Weekly completion rate</h3>
          <WeeklyChart data={weeklyTrend} />
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Best days</h3>
          <DowChart data={dowStats} />
        </section>
      </div>

      {/* Habit leaderboard */}
      <section className="space-y-3 rounded-xl border border-border bg-card px-5 py-4">
        <h3 className="text-sm font-semibold">Habits — 30-day rate</h3>
        <HabitLeaderboard habits={habits} />
      </section>
    </div>
  )
}
