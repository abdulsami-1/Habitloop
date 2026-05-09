import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 text-center space-y-4">
        <div className="text-6xl font-bold text-muted-foreground">404</div>
        <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
        <p className="text-muted-foreground text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
