"use client"

import { Plus } from "lucide-react"
import { useUIStore } from "@/stores/ui-store"

interface CreateProjectButtonProps {
  children?: React.ReactNode
  className?: string
}

export function CreateProjectButton({ children, className }: CreateProjectButtonProps) {
  const openCreateProjectModal = useUIStore((state) => state.openCreateProjectModal)

  return (
    <button
      onClick={openCreateProjectModal}
      className={
        className ||
        "py-2x inline-flex items-center rounded-lg bg-foreground px-3 py-2 font-medium text-primary-foreground transition-colors hover:bg-foreground/70"
      }
    >
      {children || (
        <>
          <Plus size={20} className="mr-1" />
          New Project
        </>
      )}
    </button>
  )
}
