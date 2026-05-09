"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { MoreHorizontal, Pencil, Archive, Trash2, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { useHabitsStore, type Habit } from "@/store/habits-store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { HabitForm } from "@/components/habits/habit-form"
import type { HabitInput } from "@/lib/validations"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Props = { habit: Habit }

export function HabitCard({ habit }: Props) {
  const { updateHabit, deleteHabit, archiveHabit } = useHabitsStore()
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const onEdit = async (data: HabitInput) => {
    setEditLoading(true)
    const result = await updateHabit(habit.id, data)
    setEditLoading(false)
    if (result) {
      toast.success("Habit updated")
      setEditOpen(false)
    }
  }

  const onDelete = async () => {
    setDeleteLoading(true)
    const ok = await deleteHabit(habit.id)
    setDeleteLoading(false)
    if (ok) {
      toast.success("Habit deleted")
      setDeleteOpen(false)
    }
  }

  const onArchive = async () => {
    const ok = await archiveHabit(habit.id)
    if (ok) toast.success("Habit archived")
  }

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-border/80 hover:bg-card/80 transition-colors"
      >
        <button
          className="shrink-0 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: habit.color }}
        >
          {habit.icon.slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{habit.name}</p>
          {habit.description && (
            <p className="truncate text-xs text-muted-foreground">{habit.description}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="h-4 w-4" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit habit</DialogTitle>
          </DialogHeader>
          <HabitForm habit={habit} onSubmit={onEdit} loading={editLoading} />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete habit?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{habit.name}&rdquo; and all its check-in history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
