import { createMemoryHistory } from '@tanstack/react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { createQueryClient } from '@/app/providers/query-client'
import { createAppRouter } from '@/app/router'
import { type AuthSession, useAuthStore } from '@/features/auth'

const session: AuthSession = {
  email: 'leitora@example.com',
  token: 'token-ficticio',
  authenticatedAt: '2026-09-09T12:00:00.000Z',
}

async function loadRoute(path: string) {
  const history = createMemoryHistory({ initialEntries: [path] })
  const queryClient = createQueryClient()
  const router = createAppRouter({ queryClient, history })

  await router.load()

  return router
}

describe('proteção de rotas', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null })
    useAuthStore.persist.clearStorage()
  })

  it('redireciona visitantes para o login', async () => {
    const router = await loadRoute('/discover')

    expect(router.state.location.pathname).toBe('/login')
  })

  it('permite acesso às rotas privadas com uma sessão válida', async () => {
    useAuthStore.getState().setSession(session)

    const router = await loadRoute('/discover')

    expect(router.state.location.pathname).toBe('/discover')
  })

  it('redireciona usuários autenticados para a descoberta', async () => {
    useAuthStore.getState().setSession(session)

    const router = await loadRoute('/login')

    expect(router.state.location.pathname).toBe('/discover')
  })
})
