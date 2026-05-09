"use client"
import { cn } from "@/lib/utils"

type Day = { date: string; rate: number; count: number }

type Props = {
  days: Day[]
}

function getLevel(rate: number): number {
  if (rate === 0) return 0
  if (rate <= 0.25) return 1
  if (rate <= 0.5) return 2
  if (rate <= 0.75) return 3
  return 4
}

const LEVEL_CLASSES = [
  "bg-secondary",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/65",
  "bg-primary",
]

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function buildCells(days: Day[]): (Day | null)[] {
  if (!days.length) return []
  const firstDow = new Date(days[0].date + "T12:00:00Z").getUTCDay()
  return [...Array(firstDow).fill(null), ...days]
}

function getMonthMarkers(days: Day[]): { col: number; label: string }[] {
  const markers: { col: number; label: string }[] = []
  let prevMonth = -1
  days.forEach((day, i) => {
    const month = new Date(day.date + "T12:00:00Z").getUTCMonth()
    if (month !== prevMonth) {
      const firstDow = new Date(days[0].date + "T12:00:00Z").getUTCDay()
      const col = Math.floor((i + firstDow) / 7)
      markers.push({ col, label: MONTH_LABELS[month] })
      prevMonth = month
    }
  })
  return markers
}

export function Heatmap({ days }: Props) {
  if (!days.length) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-xs text-muted-foreground">No data yet</p>
      </div>
    )
  }

  const cells = buildCells(days)
  const totalCols = Math.ceil(cells.length / 7)
  const monthMarkers = getMonthMarkers(days)

  return (
    <div className="space-y-1.5 overflow-x-auto pb-1">
      {/* Month labels */}
      <div className="relative flex min-w-fit" style={{ paddingLeft: 28 }}>
        {monthMarkers.map(({ col, label }) => (
          <div
            key={`${col}-${label}`}
            className="absolute text-[10px] text-muted-foreground"
            style={{ left: 28 + col * 14 }}
          >
            {label}
          </div>
        ))}
        <div style={{ height: 14, width: totalCols * 14 }} />
      </div>

      {/* Grid */}
      <div className="flex min-w-fit gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 pr-1">
          {DOW_LABELS.map((d, i) => (
            <div
              key={d}
              className="flex h-[11px] items-center text-[9px] leading-none text-muted-foreground"
            >
              {i % 2 !== 0 ? d.slice(0, 1) : ""}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateRows: "repeat(7, 11px)",
            gridAutoFlow: "column",
            gridAutoColumns: "11px",
          }}
        >
          {cells.map((cell, i) =>
            cell ? (
              <div
                key={cell.date}
                title={`${cell.date} — ${cell.count} completed (${Math.round(cell.rate * 100)}%)`}
                className={cn("h-[11px] w-[11px] rounded-sm", LEVEL_CLASSES[getLevel(cell.rate)])}
              />
            ) : (
              <div key={`pad-${i}`} className="h-[11px] w-[11px] rounded-sm" />
            )
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex min-w-fit items-center gap-1 pl-7 pt-0.5">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {LEVEL_CLASSES.map((cls, i) => (
          <div key={i} className={cn("h-[11px] w-[11px] rounded-sm", cls)} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  )
}
