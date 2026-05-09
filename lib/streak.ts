export type StreakData = {
  current: number
  longest: number
  todayCompleted: boolean
}

function prevDay(date: string): string {
  const d = new Date(date + "T12:00:00Z")
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

function dayDiff(earlier: string, later: string): number {
  const a = new Date(earlier + "T12:00:00Z")
  const b = new Date(later + "T12:00:00Z")
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export function computeCurrentStreak(
  completedDates: string[],
  today: string,
  graceDays = 1
): number {
  const set = new Set(completedDates)
  let count = 0
  let graceUsed = 0
  let date = today

  // Today counts if completed; not having today done yet doesn't penalize
  if (set.has(date)) count = 1
  date = prevDay(date)

  while (true) {
    if (set.has(date)) {
      count++
      graceUsed = 0
    } else if (graceUsed < graceDays) {
      graceUsed++
    } else {
      break
    }
    date = prevDay(date)
  }

  return count
}

export function computeLongestStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0
  const sorted = [...completedDates].sort()
  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    if (dayDiff(sorted[i - 1], sorted[i]) === 1) {
      run++
      if (run > longest) longest = run
    } else {
      run = 1
    }
  }
  return longest
}

export function computeStreaks(
  completedDates: string[],
  today: string,
  graceDays = 1
): StreakData {
  return {
    current: computeCurrentStreak(completedDates, today, graceDays),
    longest: computeLongestStreak(completedDates),
    todayCompleted: new Set(completedDates).has(today),
  }
}
