import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ success: false, error: message }, { status })
}

export function apiInfo(message: string): Response {
  return Response.json({ success: false, info: true, message }, { status: 200 })
}

export function apiRateLimit(message: string, retryAfter: number): Response {
  return Response.json(
    { success: false, error: message },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  )
}

export const TIMEZONES = Intl.supportedValuesOf("timeZone")

export function formatDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\//g, "-")
}

export function getTodayInTimezone(timezone: string): string {
  return formatDate(new Date(), timezone)
}

export function getYesterdayInTimezone(timezone: string): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return formatDate(d, timezone)
}
