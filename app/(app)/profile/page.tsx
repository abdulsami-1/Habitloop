"use client"
import { useState, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Loader2, User } from "lucide-react"
import { toast } from "sonner"
import { profileSchema, type ProfileInput } from "@/lib/validations"
import { TIMEZONES } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", timezone: user?.timezone ?? "UTC" },
  })

  useEffect(() => {
    if (user) {
      setValue("name", user.name ?? "")
      setValue("timezone", user.timezone)
    }
  }, [user, setValue])

  const timezone = useWatch({ control, name: "timezone" })

  const onSubmit = async (data: ProfileInput) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        setUser(json.data.user)
        toast.success("Profile updated")
      } else {
        toast.error(json.error)
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-lg space-y-6">
        <div className="h-40 rounded-xl border border-border bg-card animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-lg space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription className="mt-0.5">{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" placeholder="Your name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={(v) => setValue("timezone", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timezone && <p className="text-xs text-destructive">{errors.timezone.message}</p>}
            </div>

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
