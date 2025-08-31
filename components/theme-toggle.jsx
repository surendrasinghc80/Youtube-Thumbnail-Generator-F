"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button.jsx"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = (resolvedTheme ?? theme) === "dark"

  if (!mounted) {
    // Avoid hydration mismatch
    return (
      <Button variant="outline" size="icon" aria-label="Toggle theme" className="h-9 w-9 bg-transparent">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      className="h-9 w-9 bg-transparent"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
