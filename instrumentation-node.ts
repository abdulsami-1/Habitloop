import cron from "node-cron"
import { generateWeeklyInsights } from "./lib/insights"

let started = false

export function startCron() {
  if (started) return
  started = true
  cron.schedule("0 23 * * 0", () => {
    if (process.env.NODE_ENV === "development") console.log("[cron] Generating weekly insights...")
    generateWeeklyInsights().catch((err) => console.error("[cron] Error:", err))
  })
  if (process.env.NODE_ENV === "development") console.log("[cron] Weekly insight job scheduled (Sun 23:00)")
}
