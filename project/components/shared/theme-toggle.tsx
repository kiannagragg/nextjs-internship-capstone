"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="border-french_gray-300 bg-platinum-500 text-outer_space-500 hover:bg-french_gray-500 dark:border-payne's_gray-400 dark:bg-payne's_gray-500 dark:text-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg border p-3 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  )
}
