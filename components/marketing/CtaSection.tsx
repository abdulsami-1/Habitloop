"use client"
import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()

  return (
    <section className="px-4 py-24">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: reduce ? 0 : 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-4xl rounded-3xl border bg-gradient-to-br from-primary/15 via-primary/5 to-background px-8 py-20 text-center"
      >
        <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          Ready to understand your habits?
        </h2>
        <p className="mb-10 text-lg text-muted-foreground">
          Join thousands of people building better habits with AI-powered insights.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">No credit card required</p>
      </motion.div>
    </section>
  )
}
