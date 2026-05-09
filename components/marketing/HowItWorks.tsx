"use client"
import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { PlusCircle, CheckSquare, Brain } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Step = {
  icon: LucideIcon
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    icon: PlusCircle,
    title: "Create your habits",
    description: "Add any habit you want to build. Set your schedule, pick an icon, choose a color.",
  },
  {
    icon: CheckSquare,
    title: "Check in daily",
    description: "Tap to complete each day. Add a short note about what went well or what made it hard.",
  },
  {
    icon: Brain,
    title: "Get AI insights",
    description: "Every Sunday our AI reads your week and sends you a personal reflection that actually helps.",
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()

  return (
    <section id="how-it-works" className="bg-muted/30 px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            How HabitLoop works
          </h2>
        </div>

        <div ref={ref} className="grid gap-12 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: reduce ? 0 : 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.15, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-xs font-bold">
                  {i + 1}
                </span>
              </div>
              {/* Connector — desktop only, between steps */}
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
