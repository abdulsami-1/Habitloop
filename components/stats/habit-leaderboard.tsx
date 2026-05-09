import { Flame } from "lucide-react"

type HabitStat = {
  id: string
  name: string
  color: string
  icon: string
  currentStreak: number
  longestStreak: number
  totalCheckins: number
  completionRate30d: number
}

type Props = { habits: HabitStat[] }

export function HabitLeaderboard({ habits }: Props) {
  if (!habits.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No habits yet</p>
    )
  }

  const sorted = [...habits].sort((a, b) => b.completionRate30d - a.completionRate30d)

  return (
    <div className="divide-y divide-border">
      {sorted.map((h, rank) => (
        <div key={h.id} className="flex items-center gap-3 py-3">
          <span className="w-4 text-xs font-medium tabular-nums text-muted-foreground">
            {rank + 1}
          </span>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: h.color }}
          >
            {h.icon.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{h.name}</p>
            <p className="text-xs text-muted-foreground">
              {h.totalCheckins} total · {h.longestStreak}d best streak
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="text-sm font-semibold tabular-nums">
              {Math.round(h.completionRate30d * 100)}%
            </span>
            {h.currentStreak > 0 && (
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Flame className="h-3 w-3" style={{ color: h.color }} />
                <span>{h.currentStreak}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
