"use client"
import { create } from "zustand"
import { toast } from "sonner"

type CheckinsStore = {
  checkins: Record<string, Record<string, boolean>>
  notes: Record<string, Record<string, string>>
  loading: boolean
  fetchCheckins: (from: string, to: string) => Promise<void>
  toggleCheckin: (habitId: string, date: string) => Promise<void>
  updateNote: (habitId: string, date: string, note: string) => Promise<void>
  isCompleted: (habitId: string, date: string) => boolean
  getCompletedDates: (habitId: string) => string[]
  getNote: (habitId: string, date: string) => string
}

export const useCheckinsStore = create<CheckinsStore>((set, get) => ({
  checkins: {},
  notes: {},
  loading: false,

  fetchCheckins: async (from, to) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/checkins?from=${from}&to=${to}`)
      const json = await res.json()
      if (json.success) {
        const map: Record<string, Record<string, boolean>> = {}
        const noteMap: Record<string, Record<string, string>> = {}
        for (const c of json.data.checkins) {
          if (!map[c.date]) map[c.date] = {}
          map[c.date][c.habitId] = c.completed
          if (c.note) {
            if (!noteMap[c.date]) noteMap[c.date] = {}
            noteMap[c.date][c.habitId] = c.note
          }
        }
        set({ checkins: map, notes: noteMap })
      }
    } catch {
      // silent
    } finally {
      set({ loading: false })
    }
  },

  toggleCheckin: async (habitId, date) => {
    const prev = get().isCompleted(habitId, date)
    set((s) => ({
      checkins: {
        ...s.checkins,
        [date]: { ...(s.checkins[date] ?? {}), [habitId]: !prev },
      },
    }))
    try {
      const res = await fetch(`/api/habits/${habitId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      })
      const json = await res.json()
      if (!json.success) {
        set((s) => ({
          checkins: {
            ...s.checkins,
            [date]: { ...(s.checkins[date] ?? {}), [habitId]: prev },
          },
        }))
        toast.error("Failed to save check-in")
      }
    } catch {
      set((s) => ({
        checkins: {
          ...s.checkins,
          [date]: { ...(s.checkins[date] ?? {}), [habitId]: prev },
        },
      }))
      toast.error("Failed to save check-in")
    }
  },

  updateNote: async (habitId, date, note) => {
    set((s) => ({
      notes: {
        ...s.notes,
        [date]: { ...(s.notes[date] ?? {}), [habitId]: note },
      },
    }))
    try {
      await fetch(`/api/habits/${habitId}/checkin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, note }),
      })
    } catch {
      // note save failure is non-critical, local state stays
    }
  },

  isCompleted: (habitId, date) => get().checkins[date]?.[habitId] ?? false,

  getNote: (habitId, date) => get().notes[date]?.[habitId] ?? "",

  getCompletedDates: (habitId) => {
    const result: string[] = []
    for (const [date, habits] of Object.entries(get().checkins)) {
      if (habits[habitId]) result.push(date)
    }
    return result
  },
}))
