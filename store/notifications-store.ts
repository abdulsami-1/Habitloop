"use client"
import { create } from "zustand"

type Notification = {
  id: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

type NotificationsStore = {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const res = await fetch("/api/notifications")
      const json = await res.json()
      if (json.success) {
        set({ notifications: json.data.notifications, unreadCount: json.data.unreadCount })
      }
    } catch {
      // silent
    } finally {
      set({ loading: false })
    }
  },

  markRead: async (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - (s.notifications.find((n) => n.id === id && !n.isRead) ? 1 : 0)),
    }))
    await fetch(`/api/notifications/${id}`, { method: "PUT" }).catch(() => {})
  },

  markAllRead: async () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
    await fetch("/api/notifications", { method: "PATCH" }).catch(() => {})
  },
}))
