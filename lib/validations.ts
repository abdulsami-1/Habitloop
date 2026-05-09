import { z } from "zod"

export const signupSchema = z.object({
  email: z.string().email({ message: "Valid email required" }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { message: "At least 8 characters" })
    .regex(/[a-zA-Z]/, { message: "Must contain a letter" })
    .regex(/[0-9]/, { message: "Must contain a number" }),
  name: z.string().min(1, { message: "Name required" }).trim().optional(),
})

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
})

export const habitSchema = z.object({
  name: z.string().min(1, { message: "Name required" }).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, { message: "Valid hex color required" })
    .default("#6366f1"),
  icon: z.string().min(1).default("target"),
  cadence: z.enum(["daily", "weekly"]).default("daily"),
  activeDays: z
    .array(z.number().int().min(0).max(6))
    .min(1, { message: "Select at least one day" })
    .default([0, 1, 2, 3, 4, 5, 6]),
  order: z.number().int().optional(),
})

export const habitUpdateSchema = habitSchema.partial()

export const reorderSchema = z.object({
  habits: z.array(z.object({ id: z.string().cuid(), order: z.number().int() })),
})

export const profileSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  timezone: z.string().min(1).max(100),
})

export const checkinSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be YYYY-MM-DD" }),
  note: z.string().max(500).trim().optional(),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type HabitInput = z.infer<typeof habitSchema>
export type HabitUpdateInput = z.infer<typeof habitUpdateSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type CheckinInput = z.infer<typeof checkinSchema>
