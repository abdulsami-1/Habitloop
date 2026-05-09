"use client"
import { useEffect } from "react"
import { Toaster } from "sonner"
import { useAuthStore } from "@/store/auth-store"
import { useNotificationsStore } from "@/store/notifications-store"

export function Providers({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setUser(j.data.user)
          fetchNotifications()
        }
      })
      .catch(() => {})
  }, [setUser, fetchNotifications])

  return (
    <>
      {children}
      <Toaster position="bottom-right" theme="system" richColors />
    </>
  )
}
