"use client"
import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { CheckCircle, Flame, BarChart2, Sparkles, Bell, Shield } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Feature = {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: CheckCircle,
    title: "One-tap check-ins",
    description: "Mark habits complete in seconds. Add a quick note about how it went.",
  },
  {
    icon: Flame,
    title: "Streak tracking",
    description: "Watch your streaks grow with grace days so one missed day does not ruin your progress.",
  },
  {
    icon: BarChart2,
    title: "Visual heatmap",
    description: "See your entire year at a glance with a GitHub-style contribution heatmap per habit.",
  },
  {
    icon: Sparkles,
    title: "AI weekly insights",
    description: "Every week AI reads your notes and tells you the real patterns behind your behavior.",
  },
  {
    icon: Bell,
    title: "Smart notifications",
    description: "Get notified when you hit milestones, break records, or your weekly insight is ready.",
  },
  {
    icon: Shield,
    title: "Private and secure",
    description: "Your notes and data are strictly private. Never shared, never sold.",
  },
]

export function Features() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()

  return (
    <section id="features" className="py-24 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to build lasting habits
          </h2>
        </div>

        <div ref={ref} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.08, ease: "easeOut" }}
              className="rounded-xl border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
