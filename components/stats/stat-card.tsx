import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"

type Props = {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: number
  trendLabel?: string
}

export function StatCard({ label, value, icon: Icon, trend, trendLabel }: Props) {
  const trendDir = trend === undefined ? null : trend > 0 ? "up" : trend < 0 ? "down" : "flat"

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
        {trendDir && (
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${
              trendDir === "up"
                ? "text-green-500"
                : trendDir === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
            }`}
          >
            {trendDir === "up" ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : trendDir === "down" ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
            {trendLabel ?? `${Math.abs(trend!)}%`}
          </div>
        )}
      </div>
    </div>
  )
}
