import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/shared/config/test/mocks/server'

import { renderAppAt } from '@/app/testing/render-app'

import { AUTH_STORAGE_KEY, useAuthStore } from './model/auth-store'

describe('fluxo de autenticação', () => {
  beforeEach(() => {
    server.use(
      http.get('https://www.googleapis.com/books/v1/volumes', () =>
        HttpResponse.json({ totalItems: 0, items: [] }),
      ),
    )
    useAuthStore.setState({ session: null })
    useAuthStore.persist.clearStorage()
  })

  it('entra, acessa uma rota protegida e encerra a sessão', async () => {
    const { router, user } = await renderAppAt('/login')

    await user.type(screen.getByLabelText('Email'), 'LEITORA@EXAMPLE.COM')
    await user.type(screen.getByLabelText('Senha'), '1234567')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/discover')
    })
    expect(
      screen.getByRole('heading', {
        name: 'Que livro entra na sua estante agora?',
      }),
    ).toBeVisible()
    expect(useAuthStore.getState().session?.email).toBe('leitora@example.com')
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })
    expect(
      screen.getByRole('heading', { name: 'Acesse o Libris' }),
    ).toBeVisible()
    expect(useAuthStore.getState().session).toBeNull()
  })
})
