"use client"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import Link from "next/link"
import { Sparkles, ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const EASE = [0.25, 0.1, 0.25, 1] as const

export function Hero() {
  const reduce = useReducedMotion()

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: reduce ? 0 : 0.12, delayChildren: 0.25 },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        className="relative mx-auto max-w-4xl text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={item}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-6 flex justify-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            AI-powered habit tracking
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-5xl font-bold tracking-tight md:text-7xl"
        >
          Build habits that
          <br />
          <span className="text-primary">actually stick</span>
        </motion.h1>

        <motion.p
          variants={item}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground"
        >
          HabitLoop goes beyond streaks. Our AI analyzes your check-in notes each week
          and tells you exactly why you succeed or struggle — so you can stop guessing
          and start growing.
        </motion.p>

        <motion.div
          variants={item}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/register">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
            <a href="#how-it-works">See how it works</a>
          </Button>
        </motion.div>

        <motion.p
          variants={item}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-4 text-sm text-muted-foreground"
        >
          No credit card required. Free forever.
        </motion.p>

        <motion.div
          variants={item}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-16 flex justify-center"
          aria-hidden
        >
          <a
            href="#features"
            className="text-muted-foreground/50 transition-colors hover:text-muted-foreground"
          >
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}
