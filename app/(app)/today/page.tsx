import { getCurrentUser } from "@/lib/dal"
import { getTodayInTimezone } from "@/lib/utils"
import { TodayClient } from "@/components/habits/today-client"

export default async function TodayPage() {
  const user = await getCurrentUser()
  const timezone = user?.timezone ?? "UTC"
  const today = getTodayInTimezone(timezone)
  return <TodayClient today={today} timezone={timezone} />
}
