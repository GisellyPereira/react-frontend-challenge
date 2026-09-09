import { beforeEach, describe, expect, it } from 'vitest'

import { type AuthSession } from './auth-session'
import { AUTH_STORAGE_KEY, useAuthStore } from './auth-store'

const session: AuthSession = {
  email: 'leitora@example.com',
  token: 'token-ficticio',
  authenticatedAt: '2026-09-09T12:00:00.000Z',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null })
    useAuthStore.persist.clearStorage()
  })

  it('persiste somente os dados da sessão', () => {
    useAuthStore.getState().setSession(session)

    const persistedValue = localStorage.getItem(AUTH_STORAGE_KEY)

    expect(persistedValue).not.toBeNull()
    expect(JSON.parse(persistedValue ?? '{}')).toEqual({
      state: { session },
      version: 1,
    })
  })

  it('encerra a sessão e atualiza o armazenamento', () => {
    useAuthStore.getState().setSession(session)
    useAuthStore.getState().clearSession()

    expect(useAuthStore.getState().session).toBeNull()
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? '{}')).toEqual({
      state: { session: null },
      version: 1,
    })
  })

  it('restaura uma sessão válida do armazenamento', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        state: { session },
        version: 1,
      }),
    )

    await useAuthStore.persist.rehydrate()

    expect(useAuthStore.getState().session).toEqual(session)
  })

  it('descarta uma sessão inválida recuperada do armazenamento', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        state: {
          session: {
            email: 'email-invalido',
            token: '',
            authenticatedAt: 'data-invalida',
          },
        },
        version: 1,
      }),
    )

    await useAuthStore.persist.rehydrate()

    expect(useAuthStore.getState().session).toBeNull()
  })
})
