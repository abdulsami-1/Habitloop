type Entry = { count: number; resetAt: number }

export type RateLimiter = {
  check: (key: string) => { allowed: boolean; retryAfter: number }
  clear: (key: string) => void
}

// Single-instance only — replace with Redis for multi-instance deployments
export function createRateLimiter(maxRequests: number, windowMs: number): RateLimiter {
  const store = new Map<string, Entry>()

  return {
    check(key: string): { allowed: boolean; retryAfter: number } {
      const now = Date.now()
      const entry = store.get(key)
      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, retryAfter: 0 }
      }
      if (entry.count >= maxRequests) {
        return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
      }
      entry.count++
      return { allowed: true, retryAfter: 0 }
    },

    clear(key: string): void {
      store.delete(key)
    },
  }
}
