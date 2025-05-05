"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, update, get } from "firebase/database"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const { user, db } = useFirebase()

  useEffect(() => {
    const loadTheme = async () => {
      // First try to get theme from user preferences in Firebase
      if (user && db) {
        try {
          const userRef = ref(db, `users/${user.uid}`)
          const snapshot = await get(userRef)

          if (snapshot.exists()) {
            const userData = snapshot.val()
            if (userData.darkMode !== undefined) {
              setTheme(userData.darkMode ? "dark" : "light")
              return
            }
          }
        } catch (error) {
          console.error("Error loading theme from Firebase:", error)
        }
      }

      // Fall back to localStorage
      const storedTheme = localStorage.getItem(storageKey)
      if (storedTheme) {
        setTheme(storedTheme as Theme)
      }
    }

    loadTheme()
  }, [db, storageKey, user])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
      localStorage.setItem(storageKey, newTheme)

      // Save to Firebase if user is logged in
      if (user && db) {
        const userRef = ref(db, `users/${user.uid}`)
        update(userRef, { darkMode: newTheme === "dark" })
      }
    },
  }

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
