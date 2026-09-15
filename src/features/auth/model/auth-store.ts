import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod'

import { authSessionSchema, type AuthSession } from './auth-session'

export const AUTH_STORAGE_KEY = 'libris:auth'

const persistedAuthStateSchema = z.object({
  session: authSessionSchema.nullable(),
})

interface AuthState {
  session: AuthSession | null
  setSession: (session: AuthSession) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      version: 1,
      partialize: ({ session }) => ({ session }),
      merge: (persistedState, currentState) => {
        const parsedState = persistedAuthStateSchema.safeParse(persistedState)

        return {
          ...currentState,
          session: parsedState.success ? parsedState.data.session : null,
        }
      },
    },
  ),
)

export const selectAuthSession = (state: AuthState) => state.session

export const selectIsAuthenticated = (state: AuthState) =>
  state.session !== null
