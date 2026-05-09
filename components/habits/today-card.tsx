"use client"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Habit } from "@/store/habits-store"

type Props = {
  habit: Habit
  completed: boolean
  streak: number
  note: string
  onToggle: () => void
  onNoteSave: (note: string) => void
}

export function TodayCard({ habit, completed, streak, note, onToggle, onNoteSave }: Props) {
  const [localNote, setLocalNote] = useState(note)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setLocalNote(note)
  }, [note])

  const handleBlur = () => {
    if (localNote !== note) onNoteSave(localNote)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-xl border transition-colors",
        completed ? "border-border/40 bg-card/40" : "border-border bg-card hover:border-border/70"
      )}
    >
      <div className="flex items-center gap-4 px-4 py-3.5">
        <button
          onClick={onToggle}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
          className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <motion.div
            animate={completed ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.22 }}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all"
            style={
              completed
                ? { backgroundColor: habit.color, borderColor: habit.color }
                : { borderColor: "hsl(var(--border))" }
            }
          >
            {completed && (
              <motion.svg
                viewBox="0 0 12 12"
                className="h-3.5 w-3.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <motion.path
                  d="M2 6l3 3 5-5"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.svg>
            )}
          </motion.div>
        </button>

        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: habit.color }}
        >
          {habit.icon.slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-medium transition-colors",
              completed && "text-muted-foreground line-through"
            )}
          >
            {habit.name}
          </p>
          {habit.description && !completed && (
            <p className="truncate text-xs text-muted-foreground">{habit.description}</p>
          )}
        </div>

        {streak > 0 && (
          <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
            <Flame className="h-3.5 w-3.5" style={{ color: habit.color }} />
            <span>{streak}</span>
          </div>
        )}
      </div>

      {completed && (
        <div className="px-4 pb-3 pl-[4.75rem]">
          <textarea
            ref={textareaRef}
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            onBlur={handleBlur}
            placeholder="Add a note… (optional)"
            rows={1}
            maxLength={500}
            className="w-full resize-none bg-transparent text-xs leading-relaxed text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
        </div>
      )}
    </motion.div>
  )
}
