"use client"
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCheck, Target } from "lucide-react"
import { useHabitsStore } from "@/store/habits-store"
import { useCheckinsStore } from "@/store/checkins-store"
import { TodayCard } from "@/components/habits/today-card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { computeCurrentStreak } from "@/lib/streak"

function nDaysAgo(today: string, n: number): string {
  const d = new Date(today + "T12:00:00Z")
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

function formatDayLabel(today: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(today + "T12:00:00Z"))
}

function getDayOfWeek(today: string): number {
  return new Date(today + "T12:00:00Z").getUTCDay()
}

type Props = {
  today: string
  timezone: string
}

export function TodayClient({ today, timezone }: Props) {
  const { habits, loading: habitsLoading, fetchHabits } = useHabitsStore()
  const { checkins, loading: checkinsLoading, fetchCheckins, toggleCheckin, updateNote, getCompletedDates, getNote } =
    useCheckinsStore()

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  useEffect(() => {
    fetchCheckins(nDaysAgo(today, 90), today)
  }, [today, fetchCheckins])

  const dayOfWeek = getDayOfWeek(today)
  const dueHabits = habits.filter((h) => h.activeDays.includes(dayOfWeek))
  const completedCount = dueHabits.filter((h) => checkins[today]?.[h.id] ?? false).length
  const allDone = dueHabits.length > 0 && completedCount === dueHabits.length

  if ((habitsLoading || checkinsLoading) && habits.length === 0) {
    return (
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-1.5 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[58px] rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-semibold">Today</h2>
            <p className="text-xs text-muted-foreground">{formatDayLabel(today, timezone)}</p>
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {completedCount} / {dueHabits.length}
          </span>
        </div>
        <Progress value={dueHabits.length > 0 ? (completedCount / dueHabits.length) * 100 : 0} />
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            key="all-done"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3"
          >
            <CheckCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">All done — great work today!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {dueHabits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
            <Target className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No habits scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dueHabits.map((habit) => (
            <TodayCard
              key={habit.id}
              habit={habit}
              completed={checkins[today]?.[habit.id] ?? false}
              streak={computeCurrentStreak(getCompletedDates(habit.id), today)}
              note={getNote(habit.id, today)}
              onToggle={() => toggleCheckin(habit.id, today)}
              onNoteSave={(note) => updateNote(habit.id, today, note)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
