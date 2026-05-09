"use client"
import { create } from "zustand"
import { toast } from "sonner"

export type Habit = {
  id: string
  userId: string
  name: string
  description: string | null
  color: string
  icon: string
  cadence: string
  activeDays: number[]
  isArchived: boolean
  order: number
  createdAt: string
  updatedAt: string
}

type HabitsStore = {
  habits: Habit[]
  loading: boolean
  error: string | null
  fetchHabits: () => Promise<void>
  createHabit: (data: Partial<Habit>) => Promise<Habit | null>
  updateHabit: (id: string, data: Partial<Habit>) => Promise<Habit | null>
  deleteHabit: (id: string) => Promise<boolean>
  archiveHabit: (id: string) => Promise<boolean>
  reorderHabits: (habits: { id: string; order: number }[]) => Promise<void>
}

export const useHabitsStore = create<HabitsStore>((set, get) => ({
  habits: [],
  loading: false,
  error: null,

  fetchHabits: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/habits")
      const json = await res.json()
      if (json.success) set({ habits: json.data.habits })
      else set({ error: json.error })
    } catch {
      set({ error: "Failed to load habits" })
    } finally {
      set({ loading: false })
    }
  },

  createHabit: async (data) => {
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        set((s) => ({ habits: [...s.habits, json.data.habit] }))
        return json.data.habit
      }
      toast.error(json.error)
      return null
    } catch {
      toast.error("Failed to create habit")
      return null
    }
  },

  updateHabit: async (id, data) => {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? json.data.habit : h)),
        }))
        return json.data.habit
      }
      toast.error(json.error)
      return null
    } catch {
      toast.error("Failed to update habit")
      return null
    }
  },

  deleteHabit: async (id) => {
    try {
      const res = await fetch(`/api/habits/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }))
        return true
      }
      toast.error(json.error)
      return false
    } catch {
      toast.error("Failed to delete habit")
      return false
    }
  },

  archiveHabit: async (id) => {
    const result = await get().updateHabit(id, { isArchived: true } as Partial<Habit>)
    if (result) {
      set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }))
      return true
    }
    return false
  },

  reorderHabits: async (habits) => {
    set((s) => {
      const map = new Map(habits.map((h) => [h.id, h.order]))
      return {
        habits: s.habits
          .map((h) => (map.has(h.id) ? { ...h, order: map.get(h.id)! } : h))
          .sort((a, b) => a.order - b.order),
      }
    })
    try {
      await fetch("/api/habits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits }),
      })
    } catch {
      toast.error("Failed to save order")
    }
  },
}))
