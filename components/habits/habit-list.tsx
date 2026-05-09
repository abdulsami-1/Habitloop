"use client"
import { useEffect, useState } from "react"
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Target } from "lucide-react"
import { toast } from "sonner"
import { useHabitsStore } from "@/store/habits-store"
import { HabitCard } from "@/components/habits/habit-card"
import { HabitForm } from "@/components/habits/habit-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import type { HabitInput } from "@/lib/validations"

export function HabitListClient() {
  const { habits, loading, error, fetchHabits, createHabit, reorderHabits } = useHabitsStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = habits.findIndex((h) => h.id === active.id)
    const newIndex = habits.findIndex((h) => h.id === over.id)
    const reordered = arrayMove(habits, oldIndex, newIndex)
    reorderHabits(reordered.map((h, i) => ({ id: h.id, order: i })))
  }

  const onCreate = async (data: HabitInput) => {
    setCreateLoading(true)
    const result = await createHabit(data)
    setCreateLoading(false)
    if (result) {
      toast.success("Habit created")
      setCreateOpen(false)
    }
  }

  if (loading && habits.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchHabits}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Your habits</h2>
          <p className="text-xs text-muted-foreground">{habits.length} active</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create habit</DialogTitle>
            </DialogHeader>
            <HabitForm onSubmit={onCreate} loading={createLoading} />
          </DialogContent>
        </Dialog>
      </div>

      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-20 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <Target className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No habits yet</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Create your first habit to get started</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create first habit
          </Button>
        </motion.div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {habits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
