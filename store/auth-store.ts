"use client"
import { create } from "zustand"

type User = {
  id: string
  email: string
  name: string | null
  timezone: string
}

type AuthStore = {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    set({ user: null })
    window.location.href = "/login"
  },
}))
