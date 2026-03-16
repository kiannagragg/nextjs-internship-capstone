import { useState } from "react"
import { Loader2, Plus, Send } from "lucide-react"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/shared/date-picker"

interface TaskSheetProps {
  task: any | null
  isOpen: boolean
  onClose: () => void
  updateTask: (params: { taskId: string; data: any }) => Promise<any>
}

export function TaskSheet({ task, isOpen, onClose, updateTask }: TaskSheetProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [priority, setPriority] = useState<string | null>(task?.priority || null)

  const [startDate, setStartDate] = useState<Date | undefined>(
    task?.startDate ? new Date(task.startDate) : undefined
  )

  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  )

  const [isSaving, setIsSaving] = useState(false)

  const [errors, setErrors] = useState<{ title?: string; dates?: string }>({})

  const handleSave = async () => {
    if (!task) return

    const newErrors: { title?: string; dates?: string } = {}

    if (!title.trim()) {
      newErrors.title = "Task name is required."
    }

    if (startDate && dueDate && startDate > dueDate) {
      newErrors.dates = "Due date cannot be before the start date."
    }

    // If there are errors, stop saving and display them
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Clear errors if validation passes
    setErrors({})
    setIsSaving(true)

    try {
      await updateTask({
        taskId: task.id,
        data: {
          title: title.trim(),
          description,
          priority,
          startDate: startDate ?? null,
          dueDate: dueDate ?? null,
        },
      })
      onClose()
    } catch (error) {
      // console.error("Failed to save task:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!task) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-3xl">
        <div className="border-b border-muted p-6">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">Task Details</SheetTitle>
            <p className="text-sm text-muted-foreground">Task #{task.id.slice(0, 4)}</p>
          </SheetHeader>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2">
          {/* LEFT COLUMN: FORM */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-muted-foreground">{title.length}/80</span>
              </div>
              <Input
                value={title}
                // Clear the error specifically for this field when the user types
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors({ ...errors, title: undefined })
                }}
                maxLength={80}
                placeholder="Task Name"
                className={`text-foreground ${errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a more detailed description..."
                className="min-h-[100px] resize-y text-foreground"
              />
            </div>

            {/* Placeholder for List/Status changing */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status (List)
              </label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="In Progress (Coming Soon)" />
                </SelectTrigger>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Priority
              </label>
              <Select
                value={priority || "none"}
                onValueChange={(val) => setPriority(val === "none" ? null : val)}
              >
                <SelectTrigger className="text-foreground">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-muted-foreground">
                    No Priority
                  </SelectItem>
                  <SelectItem value="low" className="text-foreground">
                    Low
                  </SelectItem>
                  <SelectItem value="medium" className="text-foreground">
                    Medium
                  </SelectItem>
                  <SelectItem value="high" className="text-foreground">
                    High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Start Date
              </label>
              <DatePicker
                value={startDate}
                onChange={(date) => {
                  setStartDate(date)
                  if (errors.dates) setErrors({ ...errors, dates: undefined })
                }}
                placeholder="Select start date"
                className={`text-foreground ${errors.dates ? "border-red-500" : ""}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Due Date
              </label>
              <DatePicker
                value={dueDate}
                onChange={(date) => {
                  setDueDate(date)
                  if (errors.dates) setErrors({ ...errors, dates: undefined })
                }}
                placeholder="Select due date"
                className={`text-foreground ${errors.dates ? "border-red-500" : ""}`}
                disabledDates={(date) => (startDate ? date < startDate : false)}
              />
            </div>

            {errors.dates && <p className="text-xs text-red-500">{errors.dates}</p>}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Assignees{" "}
                <span className="font-normal normal-case">(optional - you can assign later)</span>
              </label>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-black text-xs text-white">KG</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-3 text-foreground"
                  disabled
                >
                  <Plus className="mr-1 h-4 w-4 text-foreground" /> Add
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVITY */}
          <div className="space-y-6 md:border-l md:border-muted md:pl-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Activity
            </h3>

            {/* Mockup Activity Log */}
            <div className="space-y-4">
              <div className="flex items-start justify-between text-sm">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Kianna Gragg</span> created this
                  task
                </p>
                <span className="text-xs text-muted-foreground">1hr ago</span>
              </div>

              {/* Mockup Comment */}
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-black text-[10px] text-white">
                        KG
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-foreground">Kianna Gragg</span>
                  </div>
                  <span className="text-xs text-muted-foreground">30m ago</span>
                </div>
                <p className="ml-7 text-sm text-muted-foreground">Example comment</p>
              </div>
            </div>

            {/* Comment Input Box */}
            <div className="relative mt-auto pt-4">
              <Textarea
                placeholder="Write a comment..."
                className="min-h-[80px] resize-none bg-background pr-10"
                disabled
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute bottom-2 right-2 h-6 w-6"
                disabled
              >
                <Send className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 border-t border-muted p-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="text-foreground"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
