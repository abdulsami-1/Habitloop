"use client"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type WeekData = { week: string; rate: number; completed: number; expected: number }

type Props = { data: WeekData[] }

function formatWeek(week: string): string {
  const d = new Date(week + "T12:00:00Z")
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d)
}

export function WeeklyChart({ data }: Props) {
  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.65 0.19 264)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="oklch(0.65 0.19 264)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="week"
          tickFormatter={formatWeek}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelFormatter={(label) => (typeof label === "string" ? formatWeek(label) : String(label))}
          formatter={(value) => [`${value ?? 0}%`, "Completion"]}
          cursor={{ stroke: "hsl(var(--border))" }}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke="oklch(0.65 0.19 264)"
          strokeWidth={2}
          fill="url(#rateGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "oklch(0.65 0.19 264)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
