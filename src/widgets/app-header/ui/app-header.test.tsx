import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type AuthSession, useAuthStore } from '@/features/auth'

import { AppHeader } from './app-header'

const session: AuthSession = {
  authenticatedAt: '2026-09-10T12:00:00.000Z',
  email: 'leitora@example.com',
  token: 'token-ficticio',
}

async function renderHeaderAt(
  path: '/discover' | '/shelf' | '/discover?q=Romance',
) {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <AppHeader />
        <Outlet />
      </>
    ),
  })
  const discoverRoute = createRoute({
    component: () => null,
    getParentRoute: () => rootRoute,
    path: '/discover',
  })
  const shelfRoute = createRoute({
    component: () => null,
    getParentRoute: () => rootRoute,
    path: '/shelf',
  })
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [path] }),
    routeTree: rootRoute.addChildren([discoverRoute, shelfRoute]),
  })
  const user = userEvent.setup()

  await router.load()
  render(<RouterProvider router={router} />)

  return { router, user }
}

describe('AppHeader', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    useAuthStore.setState({ session })
    useAuthStore.persist.clearStorage()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('mantém Descobrir ativo quando a URL contém uma pesquisa', async () => {
    await renderHeaderAt('/discover?q=Romance')

    expect(screen.getByRole('link', { name: 'Descobrir' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      screen.getByRole('link', { name: 'Minha estante' }),
    ).not.toHaveAttribute('aria-current')
  })
  it('abre a conta pelo avatar e fecha com Escape', async () => {
    const { user } = await renderHeaderAt('/discover')
    const trigger = screen.getByRole('button', {
      name: 'Abrir opções da conta',
    })
    await user.click(trigger)
    expect(screen.getByRole('dialog', { name: 'Sua conta' })).toHaveTextContent(
      session.email,
    )
    expect(screen.getByRole('dialog', { name: 'Sua conta' })).toHaveTextContent(
      'Sair',
    )
    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('dialog', { name: 'Sua conta' }),
    ).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('atualiza o marcador ativo durante a navegação', async () => {
    const { router, user } = await renderHeaderAt('/discover')

    await user.click(screen.getByRole('link', { name: 'Minha estante' }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/shelf')
    })
    expect(screen.getByRole('link', { name: 'Minha estante' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Descobrir' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
