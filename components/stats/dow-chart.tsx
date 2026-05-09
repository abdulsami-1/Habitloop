"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

type DowData = { day: number; label: string; rate: number }

type Props = { data: DowData[] }

export function DowChart({ data }: Props) {
  if (!data.length) return null
  const maxRate = Math.max(...data.map((d) => d.rate))

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="label"
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
          formatter={(value) => [`${value ?? 0}%`, "Completion"]}
          cursor={{ fill: "hsl(var(--accent))" }}
        />
        <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.day}
              fill={
                entry.rate === maxRate
                  ? "oklch(0.65 0.19 264)"
                  : "oklch(0.65 0.19 264 / 0.35)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
