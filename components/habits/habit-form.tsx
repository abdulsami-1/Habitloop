"use client"
import { z } from "zod"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { habitSchema, type HabitInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Habit } from "@/store/habits-store"

type HabitFormValues = z.input<typeof habitSchema>

const ICONS = ["target", "flame", "zap", "heart", "star", "book", "dumbbell", "coffee", "moon", "sun"]
const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#06b6d4",
]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type Props = {
  habit?: Habit
  onSubmit: (data: HabitInput) => Promise<void>
  loading: boolean
}

export function HabitForm({ habit, onSubmit, loading }: Props) {
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit?.name ?? "",
      description: habit?.description ?? "",
      color: habit?.color ?? "#6366f1",
      icon: habit?.icon ?? "target",
      cadence: (habit?.cadence as "daily" | "weekly") ?? "daily",
      activeDays: habit?.activeDays ?? [0, 1, 2, 3, 4, 5, 6],
    },
  })

  const color = useWatch({ control, name: "color" })
  const icon = useWatch({ control, name: "icon" })
  const activeDays = useWatch({ control, name: "activeDays" })

  const toggleDay = (day: number) => {
    const current = activeDays ?? []
    setValue(
      "activeDays",
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort()
    )
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as HabitInput))} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="e.g. Morning meditation" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
        <Input id="description" placeholder="What does this habit mean to you?" {...register("description")} />
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue("color", c)}
              className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setValue("icon", ic)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                icon === ic ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
              }`}
            >
              {ic.slice(0, 2)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Active days</Label>
        <div className="flex gap-1.5">
          {DAYS.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(i)}
              className={`flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                activeDays?.includes(i)
                  ? "text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              style={activeDays?.includes(i) ? { backgroundColor: color } : undefined}
            >
              {day.slice(0, 1)}
            </button>
          ))}
        </div>
        {errors.activeDays && <p className="text-xs text-destructive">{errors.activeDays.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {habit ? "Save changes" : "Create habit"}
        </Button>
      </div>
    </form>
  )
}
