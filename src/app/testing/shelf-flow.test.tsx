import { screen, waitFor, within } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/features/auth'
import { useShelfStore } from '@/features/manage-shelf'
import { useThemeStore } from '@/features/theme'
import { parseGoogleVolume } from '@/entities/book/api/map-google-volume'
import { server } from '@/shared/config/test/mocks/server'
import { renderAppAt } from './render-app'

const email = 'leitora@example.com'
const volumes = [
  {
    id: 'dom',
    volumeInfo: { title: 'Dom Casmurro', authors: ['Machado de Assis'] },
  },
  {
    id: 'agua',
    volumeInfo: { title: 'Água viva', authors: ['Clarice Lispector'] },
  },
  {
    id: 'capitaes',
    volumeInfo: { title: 'Capitães da Areia', authors: ['Jorge Amado'] },
  },
]
const notifications = () =>
  within(screen.getByRole('region', { name: /Notificações/ }))
const titles = () =>
  within(screen.getByRole('table'))
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.querySelector('strong')?.textContent)

beforeEach(() => {
  useAuthStore.setState({
    session: {
      email,
      token: 'test',
      authenticatedAt: '2026-09-10T12:00:00.000Z',
    },
  })
  useShelfStore.setState({ shelves: {} })
  useThemeStore.setState({ theme: 'light' })
  server.use(
    http.get('https://www.googleapis.com/books/v1/volumes/:id', ({ params }) =>
      HttpResponse.json(volumes.find(({ id }) => id === params.id)),
    ),
    http.get('https://www.googleapis.com/books/v1/volumes', () =>
      HttpResponse.json({ totalItems: volumes.length, items: volumes }),
    ),
  )
})
afterEach(() => vi.restoreAllMocks())

describe('fluxo completo da estante', () => {
  it('adiciona pelos detalhes, altera status, filtra, ordena e remove pela interface', async () => {
    useShelfStore
      .getState()
      .add('outra@example.com', parseGoogleVolume(volumes[0]))
    const app = await renderAppAt('/book/dom')
    const { user } = app
    await screen.findByRole('heading', { level: 1, name: 'Dom Casmurro' })
    await user.click(
      screen.getByRole('button', { name: 'Adicionar à minha estante' }),
    )
    expect(
      await notifications().findByText('Livro adicionado à sua estante.'),
    ).toBeVisible()

    for (const title of ['Água viva', 'Capitães da Areia']) {
      await user.click(
        await screen.findByRole('link', { name: `Ver detalhes de ${title}` }),
      )
      await screen.findByRole('heading', { level: 1, name: title })
      await user.click(
        screen.getByRole('button', { name: 'Adicionar à minha estante' }),
      )
    }
    await user.click(screen.getByRole('link', { name: 'Minha estante' }))
    await user.click(await screen.findByRole('button', { name: 'Tabela' }))
    await user.click(
      screen.getByRole('button', { name: 'Ordenar por título: A a Z' }),
    )
    expect(titles()).toEqual(['Água viva', 'Capitães da Areia', 'Dom Casmurro'])
    await user.click(
      screen.getByRole('button', { name: 'Ordenar por título: Z a A' }),
    )
    expect(titles()).toEqual(['Dom Casmurro', 'Capitães da Areia', 'Água viva'])

    screen.getByRole('combobox', { name: 'Status de Dom Casmurro' }).focus()
    await user.keyboard(' ')
    await user.click(await screen.findByRole('option', { name: 'Lendo' }))
    expect(
      await notifications().findByText('Status de leitura atualizado.'),
    ).toBeVisible()
    await user.click(
      screen.getByRole('button', {
        name: 'Ordenar por status: Quero ler, Lendo, Lido',
      }),
    )
    expect(titles()).toEqual(['Água viva', 'Capitães da Areia', 'Dom Casmurro'])
    await user.click(
      screen.getByRole('button', {
        name: 'Ordenar por status: Lido, Lendo, Quero ler',
      }),
    )
    expect(titles()).toEqual(['Dom Casmurro', 'Água viva', 'Capitães da Areia'])

    const filters = within(
      screen.getByRole('group', { name: 'Filtrar por leitura' }),
    )
    await user.click(filters.getByRole('button', { name: /Lendo/ }))
    expect(titles()).toEqual(['Dom Casmurro'])
    await user.click(filters.getByRole('button', { name: /Todos/ }))
    await user.type(screen.getByRole('searchbox'), 'Clarice')
    expect(titles()).toEqual(['Água viva'])
    await user.click(
      screen.getByRole('button', { name: 'Remover Água viva da estante' }),
    )
    expect(screen.getByText(/Nenhum livro nesta seleção/)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Limpar busca' }))
    expect(titles()).toEqual(['Dom Casmurro', 'Capitães da Areia'])
    await user.click(
      screen.getByRole('link', { name: 'Ver detalhes de Dom Casmurro' }),
    )
    await user.click(
      await screen.findByRole('button', { name: 'Remover da minha estante' }),
    )
    expect(await notifications().findByText('Dom Casmurro')).toBeVisible()
    expect(useShelfStore.getState().shelves['outra@example.com']).toHaveLength(
      1,
    )

    app.unmount()
    app.queryClient.clear()
    await useShelfStore.persist.rehydrate()
    const reloaded = await renderAppAt('/shelf')
    await reloaded.user.click(
      await screen.findByRole('button', { name: 'Tabela' }),
    )
    expect(titles()).toEqual(['Capitães da Areia'])
  }, 15000)

  it('mostra o erro real de gravação, mantém o livro e permite tentar novamente', async () => {
    useShelfStore.getState().add(email, parseGoogleVolume(volumes[0]))
    const { user } = await renderAppAt('/book/dom')
    const remove = await screen.findByRole('button', {
      name: 'Remover da minha estante',
    })
    const write = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Quota')
      })
    await user.click(remove)
    expect(
      await notifications().findByText('Não foi possível remover o livro.'),
    ).toBeVisible()
    expect(useShelfStore.getState().shelves[email]).toHaveLength(1)
    expect(remove).toBeEnabled()
    write.mockRestore()
    await user.click(remove)
    expect(
      await notifications().findByText('Livro removido da sua estante.'),
    ).toBeVisible()
    await waitFor(() =>
      expect(
        notifications().queryByText('Não foi possível remover o livro.'),
      ).not.toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Ativar tema escuro' }))
    await waitFor(() =>
      expect(
        screen
          .getByRole('region', { name: /Notificações/ })
          .querySelector('[data-sonner-toaster]'),
      ).toHaveAttribute('data-sonner-theme', 'dark'),
    )
    await user.click(
      notifications().getByRole('button', { name: 'Fechar notificação' }),
    )
    await waitFor(() =>
      expect(
        notifications().queryByText('Livro removido da sua estante.'),
      ).not.toBeInTheDocument(),
    )
  })
})
