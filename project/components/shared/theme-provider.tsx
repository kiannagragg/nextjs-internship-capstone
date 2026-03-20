"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("light") // always "light" on first render
  const [mounted, setMounted] = useState(false)

  // Sync with localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme
    if (stored) {
      // defer setting state to avoid synchronous update warning
      requestAnimationFrame(() => setTheme(stored))
    }
    requestAnimationFrame(() => setMounted(true))
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    if (mounted) {
      localStorage.setItem("theme", theme)
    }
  }, [theme, mounted])

  const value = { theme, setTheme }

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
