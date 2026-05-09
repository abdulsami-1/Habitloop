"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, Sparkles, Loader2, Info, X } from "lucide-react"
import { toast } from "sonner"
import { InsightCard } from "@/components/insights/insight-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type Insight = {
  id: string
  weekStart: string
  content: string
  isRead: boolean
  createdAt: string
}

export function InsightsClient() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setInsights(j.data.insights)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const generate = async () => {
    setGenerating(true)
    setInfoMessage(null)
    try {
      const res = await fetch("/api/insights", { method: "POST" })
      const json = await res.json()
      if (json.success && json.data.insight) {
        setInsights((prev) => {
          const exists = prev.find((i) => i.id === json.data.insight.id)
          return exists
            ? prev.map((i) => (i.id === json.data.insight.id ? json.data.insight : i))
            : [json.data.insight, ...prev]
        })
        toast.success("Insight generated")
      } else if (json.info) {
        setInfoMessage(json.message)
      } else {
        toast.error(json.error ?? "Generation failed")
      }
    } catch {
      toast.error("Generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const markRead = async (id: string) => {
    const res = await fetch(`/api/insights/${id}`, { method: "PUT" })
    const json = await res.json()
    if (json.success) {
      setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)))
    }
  }

  const unreadCount = insights.filter((i) => !i.isRead).length

  if (loading) {
    return (
      <div className="max-w-2xl space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
        <Button size="sm" onClick={generate} disabled={generating}>
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {generating ? "Generating..." : "Generate insight"}
        </Button>
      </div>

      <AnimatePresence>
        {infoMessage && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="flex-1 text-sm leading-relaxed text-blue-700 dark:text-blue-300">{infoMessage}</p>
            <button
              onClick={() => setInfoMessage(null)}
              className="ml-1 shrink-0 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {insights.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-20 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <Lightbulb className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No insights yet</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Generate your first weekly reflection.
            </p>
          </div>
          <Button onClick={generate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating..." : "Generate now"}
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} onMarkRead={markRead} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
