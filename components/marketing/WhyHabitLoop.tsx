"use client"
import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { CheckCircle2, Target } from "lucide-react"

const BULLETS = [
  "AI insights based on YOUR actual notes, not generic tips",
  "Grace days so one bad day does not reset your progress",
  "Heatmap visualization so you see patterns at a glance",
  "Completely free, no subscription, no upsell",
]

export function WhyHabitLoop() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()

  return (
    <section id="why-habitloop" className="px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div ref={ref} className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: reduce ? 0 : -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">
              Most habit trackers just count streaks.{" "}
              <span className="text-primary">We explain them.</span>
            </h2>
            <ul className="space-y-4">
              {BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: AI insight mockup */}
          <motion.div
            initial={{ opacity: 0, x: reduce ? 0 : 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Week of May 4, 2026</span>
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  New
                </span>
              </div>

              <p className="mb-4 font-semibold leading-snug">
                Running builds momentum — work timing is the blocker
              </p>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground/50">
                    What went well
                  </p>
                  <p className="leading-relaxed">
                    You completed your morning run 5 out of 7 days. That consistency
                    signals your body is already adapting to the routine.
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground/50">
                    What held you back
                  </p>
                  <p className="leading-relaxed">
                    On the two days you missed, your notes mentioned working late.
                    Your energy was depleted before the workout window arrived.
                  </p>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2.5">
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <p className="text-xs leading-relaxed">
                    Try this week: Set your workout clothes out the night before on
                    calendar-heavy days.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
