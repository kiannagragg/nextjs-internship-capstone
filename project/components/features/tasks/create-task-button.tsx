"use client"

import { useUIStore } from "@/stores/ui-store"

interface CreateTaskButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function CreateTaskButton({ children, className, ...props }: CreateTaskButtonProps) {
  const { openCreateTaskModal } = useUIStore()

  return (
    <button onClick={openCreateTaskModal} className={className} {...props}>
      {children}
    </button>
  )
}
