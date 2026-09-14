import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware'
import { z } from 'zod'

export const THEME_STORAGE_KEY = 'libris:theme'
export type Theme = 'light' | 'dark'
const persistedThemeSchema = z.object({ theme: z.enum(['light', 'dark']) })

function systemTheme(): Theme {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    ? 'dark'
    : 'light'
}

// Storage can be blocked; switching the theme must still work for this visit.
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      /* Keep the in-memory preference. */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* Storage is unavailable. */
    }
  },
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({ theme: systemTheme(), setTheme: (theme) => set({ theme }) }),
    {
      name: THEME_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ theme }) => ({ theme }),
      merge: (persisted, current) => {
        const parsed = persistedThemeSchema.safeParse(persisted)
        return {
          ...current,
          theme: parsed.success ? parsed.data.theme : current.theme,
        }
      },
    },
  ),
)
