import { createContext, useContext, useState, type ReactNode } from "react"
import { DEFAULT_THEME, useThemeRoot, type Theme, type ThemeMode } from "thrifty-ui"

// App-wide theme state. The /studio route edits `theme` and toggles `mode` (a
// theme carries two color variants, A and B; ThemeMode selects which is live).
// useThemeRoot writes the active variant to :root as CSS variables — reaching
// Radix portals (sheets, dialogs, popovers) too, which a scoped ThemeScope would
// miss. Every component styles from those variables, so a studio edit updates the
// whole app live. One useThemeRoot for the whole app (here) avoids competing
// writers to :root.
//
// Kept in React context rather than a store to stay dependency-light; lift to
// Zustand (or similar) if your app's state outgrows this.

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME)
  const [mode, setMode] = useState<ThemeMode>("A")

  useThemeRoot(theme, mode)

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>")
  return ctx
}
