"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, Target, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { parseInsightContent } from "@/lib/insight-content"

type Insight = {
  id: string
  weekStart: string
  content: string
  isRead: boolean
  createdAt: string
}

type Props = {
  insight: Insight
  onMarkRead: (id: string) => void
}

function formatWeekLabel(weekStart: string): string {
  const d = new Date(weekStart + "T12:00:00Z")
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(d)
}

export function InsightCard({ insight, onMarkRead }: Props) {
  const content = parseInsightContent(insight.content)
  const [expanded, setExpanded] = useState(!insight.isRead)
  const hasContent = content.wentWell.length > 0 || content.heldBack.length > 0 || !!content.experiment?.trim()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border bg-card transition-colors",
        insight.isRead ? "border-border/50" : "border-primary/30"
      )}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          insight.isRead ? "bg-secondary" : "bg-primary/10"
        )}>
          <Lightbulb className={cn("h-4 w-4", insight.isRead ? "text-muted-foreground" : "text-primary")} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Week of {formatWeekLabel(insight.weekStart)}</p>
            {!insight.isRead && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </div>
          <p className="mt-0.5 text-sm font-semibold">{content.headline}</p>
        </div>

        <div className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-3 px-4 pb-4"
        >
          {Array.isArray(content.wentWell) && content.wentWell.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">What went well</p>
              <div className="space-y-1">
                {content.wentWell.map((s, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">{s}</p>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(content.heldBack) && content.heldBack.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">What held you back</p>
              <ul className="space-y-1.5">
                {content.heldBack.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {content.experiment?.trim() && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Try this week</p>
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2.5">
                <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-foreground">{content.experiment}</p>
              </div>
            </div>
          )}

          {!hasContent && (
            <p className="text-sm text-muted-foreground italic">Your reflection is being prepared.</p>
          )}

          {!insight.isRead && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation()
                onMarkRead(insight.id)
              }}
            >
              Mark as read
            </Button>
          )}
        </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
