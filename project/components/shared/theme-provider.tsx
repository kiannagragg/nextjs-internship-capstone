"use client"

import type React from "react"
import { useEffect } from "react"
import { useUIStore } from "@/stores/ui-store"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "dark" || stored === "light") {
      setTheme(stored)
    }
  }, [setTheme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  return <>{children}</>
}

export const useTheme = () => {
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)

  return { theme, setTheme }
}
