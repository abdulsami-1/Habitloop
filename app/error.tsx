"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[error-boundary]", error)
  }, [error])

  const message = error?.message || "An unexpected error occurred."

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 text-center space-y-4">
        <div className="text-destructive text-4xl font-bold">Something went wrong</div>
        <p className="text-muted-foreground text-sm">{message}</p>
        {error?.digest && (
          <p className="text-muted-foreground text-xs font-mono">ID: {error.digest}</p>
        )}
        <button
          onClick={() => { try { reset() } catch { window.location.reload() } }}
          className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
