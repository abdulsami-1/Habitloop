import { cn } from "@/lib/utils"

type Props = { value: number; className?: string }

export function Progress({ value, className }: Props) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className="h-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
