import Link from "next/link"
import { Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">HabitLoop</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Build habits that stick with the power of AI
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="mb-1 text-sm font-semibold">Links</p>
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign up
            </Link>
          </div>

          <div className="flex items-start">
            <p className="text-sm text-muted-foreground">Built with Next.js and Gemini AI</p>
          </div>
        </div>

        <div className="mt-12 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © 2026 HabitLoop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
