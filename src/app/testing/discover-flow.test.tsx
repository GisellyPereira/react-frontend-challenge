import { act, screen, waitFor, within } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/features/auth'
import { server } from '@/shared/config/test/mocks/server'
import { renderAppAt } from './render-app'

beforeEach(() => {
  useAuthStore.setState({
    session: {
      email: 'leitora@example.com',
      token: 'test',
      authenticatedAt: '2026-09-10T12:00:00.000Z',
    },
  })
})

describe('busca durante a digitação', () => {
  it('consulta somente o texto final, preserva filtros e foco, reinicia a página e permite voltar', async () => {
    const requests: URL[] = []
    server.use(
      http.get('https://www.googleapis.com/books/v1/volumes', ({ request }) => {
        const url = new URL(request.url)
        requests.push(url)
        return HttpResponse.json({
          totalItems: 100,
          items: [
            {
              id: 'volume',
              volumeInfo: { title: `Livro ${url.searchParams.get('q')}` },
            },
          ],
        })
      }),
    )
    const { user, router } = await renderAppAt(
      '/discover?q=Original&printType=books&orderBy=newest&startIndex=15',
    )
    await screen.findByRole('link', { name: 'Ver detalhes de Livro Original' })
    const input = screen.getByRole('searchbox')
    const historyLength = router.history.length
    await user.clear(input)
    await user.type(input, 'Clarice')
    expect(requests).toHaveLength(1)
    await screen.findByRole('link', { name: 'Ver detalhes de Livro Clarice' })
    expect(requests).toHaveLength(2)
    expect(Object.fromEntries(requests[1]!.searchParams)).toMatchObject({
      q: 'Clarice',
      printType: 'books',
      orderBy: 'newest',
      startIndex: '0',
    })
    expect(input).toHaveFocus()
    expect(router.history.length).toBe(historyLength)

    await user.clear(input)
    await user.type(input, 'Machado{Enter}')
    await screen.findByRole('link', { name: 'Ver detalhes de Livro Machado' })
    expect(router.history.length).toBe(historyLength + 1)
    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'Pendente')
    act(() => {
      router.history.back()
    })
    await waitFor(() =>
      expect(screen.getByRole('searchbox')).toHaveValue('Clarice'),
    )
    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(requests.map((url) => url.searchParams.get('q'))).toEqual([
      'Original',
      'Clarice',
      'Machado',
    ])
  })

  it('mantém o foco ao sair automaticamente da home para os resultados', async () => {
    server.use(
      http.get('https://www.googleapis.com/books/v1/volumes', () =>
        HttpResponse.json({ totalItems: 0, items: [] }),
      ),
    )
    const { user } = await renderAppAt('/discover')
    await user.type(screen.getByRole('searchbox'), 'Clarice')
    await screen.findByRole('heading', { name: 'Só mais um capítulo?' })
    expect(screen.getByRole('searchbox')).toHaveValue('Clarice')
    expect(screen.getByRole('searchbox')).toHaveFocus()
  })

  it('mostra um toast de erro da API sem repetir a notificação em rerenders', async () => {
    server.use(
      http.get('https://www.googleapis.com/books/v1/volumes', () =>
        HttpResponse.json({ error: 'Quota' }, { status: 429 }),
      ),
    )
    const { user } = await renderAppAt('/discover?q=Romance')
    const notifications = within(
      screen.getByRole('region', { name: /Notificações/ }),
    )
    expect(
      await notifications.findByText('Não foi possível buscar os livros.'),
    ).toBeVisible()
    await user.type(screen.getByRole('searchbox'), ' ')
    expect(
      notifications.getAllByText('Não foi possível buscar os livros.'),
    ).toHaveLength(1)
    expect(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeEnabled()
  })
})
