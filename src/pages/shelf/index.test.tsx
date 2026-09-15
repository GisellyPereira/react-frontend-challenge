import type { ReactNode } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { useAuthStore } from '@/features/auth'
import { useShelfStore, type SavedBook } from '@/features/manage-shelf'
import { ShelfPage } from './index'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
    ...props
  }: {
    children: ReactNode
    to: string
    params?: { bookId: string }
  }) => (
    <a href={params ? `/book/${params.bookId}` : to} {...props}>
      {children}
    </a>
  ),
}))
vi.mock('@/entities/book', () => ({ BookCoverImage: () => null }))

const email = 'leitora@example.com'
const scrollIntoView = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'scrollIntoView',
)
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
})
afterAll(() => {
  if (scrollIntoView)
    Object.defineProperty(
      HTMLElement.prototype,
      'scrollIntoView',
      scrollIntoView,
    )
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
})

function collection(): SavedBook[] {
  const statuses = ['read', 'reading', 'want-to-read'] as const
  return [
    ...Array.from({ length: 10 }, (_, index) => `Livro ${index + 1}`),
    'Água viva',
    'Dom Casmurro',
  ].map((title, index) => ({
    id: `book-${index + 1}`,
    title,
    authors: [title === 'Água viva' ? 'Clarice Lispector' : 'Autoria de teste'],
    status: statuses[index % statuses.length] ?? 'want-to-read',
    cover: { large: null, small: null },
    publishedDate: '2020',
    pageCount: 100,
    categories: [],
  }))
}

async function renderTable() {
  const user = userEvent.setup()
  render(<ShelfPage />)
  await user.click(screen.getByRole('button', { name: 'Tabela' }))
  return user
}

function titles() {
  return within(screen.getByRole('table'))
    .getAllByRole('row')
    .slice(1)
    .map(
      (row) =>
        within(within(row).getAllByRole('cell')[0]!)
          .getByRole('link')
          .querySelector('strong')?.textContent,
    )
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({
    session: {
      email,
      token: 'test-token',
      authenticatedAt: '2026-09-10T12:00:00.000Z',
    },
  })
  useShelfStore.setState({
    shelves: {
      [email]: collection(),
      'outra@example.com': [{ ...collection()[0]!, title: 'A outra conta' }],
    },
  })
})
afterEach(() => {
  useAuthStore.setState({ session: null })
  useShelfStore.setState({ shelves: {} })
  localStorage.clear()
})

describe('ordenação na tabela da estante', () => {
  it('ordena a coleção antes de paginar, volta à primeira página e alterna por teclado', async () => {
    const user = await renderTable()
    expect(titles()[0]).toBe('Livro 1')
    await user.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(titles()).toEqual(['Água viva', 'Dom Casmurro'])

    const titleSort = screen.getByRole('button', {
      name: 'Ordenar por título: A a Z',
    })
    await user.click(titleSort)
    expect(screen.getByText('Exibindo 1–10 de 12 livros')).toBeVisible()
    expect(titles()).toEqual([
      'Água viva',
      'Dom Casmurro',
      ...Array.from({ length: 8 }, (_, i) => `Livro ${i + 1}`),
    ])
    expect(titleSort.closest('th')).toHaveAttribute('aria-sort', 'ascending')
    await user.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(titles()).toEqual(['Livro 9', 'Livro 10'])

    titleSort.focus()
    await user.keyboard('{Enter}')
    expect(titleSort).toHaveFocus()
    expect(titleSort.closest('th')).toHaveAttribute('aria-sort', 'descending')
    expect(titles()).toEqual(
      Array.from({ length: 10 }, (_, i) => `Livro ${10 - i}`),
    )
    expect(
      screen.getByRole('button', { name: 'Página anterior' }),
    ).toBeDisabled()
    expect(useShelfStore.getState().shelves[email]).toEqual(collection())
  })

  it('mantém a ordenação ao buscar título ou autoria, filtrar e alternar visualizações', async () => {
    const user = await renderTable()
    await user.click(
      screen.getByRole('button', { name: 'Ordenar por título: A a Z' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Ordenar por título: Z a A' }),
    )
    await user.click(
      within(
        screen.getByRole('group', { name: 'Filtrar por leitura' }),
      ).getByRole('button', { name: /Lendo/ }),
    )
    const search = screen.getByRole('searchbox', {
      name: 'Buscar na minha estante',
    })
    await user.type(search, 'Livro')
    expect(titles()).toEqual(['Livro 8', 'Livro 5', 'Livro 2'])
    await user.clear(search)
    await user.type(search, 'Clarice')
    expect(titles()).toEqual(['Água viva'])
    await user.clear(search)
    await user.type(search, 'inexistente')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByText(/Nenhum livro nesta seleção/)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Limpar busca' }))
    await user.click(screen.getByRole('button', { name: 'Prateleiras' }))
    await user.click(screen.getByRole('button', { name: 'Tabela' }))
    expect(titles()).toEqual(['Livro 8', 'Livro 5', 'Livro 2', 'Água viva'])
  })

  it('agrupa por status, reordena ao mudar o status e permite inverter a sequência', async () => {
    const user = await renderTable()
    await user.click(
      screen.getByRole('button', { name: 'Ordenar por título: A a Z' }),
    )
    const statusSort = screen.getByRole('button', {
      name: 'Ordenar por status: Quero ler, Lendo, Lido',
    })
    await user.click(statusSort)
    expect(statusSort.closest('th')).toHaveAttribute('aria-sort', 'ascending')
    expect(
      screen.getByRole('button', { name: /Ordenar por título/ }).closest('th'),
    ).not.toHaveAttribute('aria-sort')
    expect(titles()).toEqual([
      'Dom Casmurro',
      'Livro 3',
      'Livro 6',
      'Livro 9',
      'Água viva',
      'Livro 2',
      'Livro 5',
      'Livro 8',
      'Livro 1',
      'Livro 4',
    ])

    screen.getByRole('combobox', { name: 'Status de Dom Casmurro' }).focus()
    await user.keyboard(' ')
    await user.click(await screen.findByRole('option', { name: 'Lido' }))
    expect(titles()[0]).toBe('Livro 3')
    expect(
      useShelfStore
        .getState()
        .shelves[email]?.find(({ id }) => id === 'book-12')?.status,
    ).toBe('read')

    await user.click(statusSort)
    expect(statusSort.closest('th')).toHaveAttribute('aria-sort', 'descending')
    expect(titles().slice(0, 5)).toEqual([
      'Dom Casmurro',
      'Livro 1',
      'Livro 4',
      'Livro 7',
      'Livro 10',
    ])
  })

  it('ajusta a última página após remover um livro e mantém a ordem', async () => {
    const user = await renderTable()
    await user.click(
      screen.getByRole('button', { name: 'Ordenar por título: A a Z' }),
    )
    await user.click(screen.getByRole('button', { name: 'Próxima página' }))
    await user.click(
      screen.getByRole('button', { name: 'Remover Livro 10 da estante' }),
    )
    expect(titles()).toEqual(['Livro 9'])
    await user.click(
      screen.getByRole('button', { name: 'Remover Livro 9 da estante' }),
    )
    expect(titles()[0]).toBe('Água viva')
    expect(screen.getByText('Exibindo 1–10 de 10 livros')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Página anterior' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Próxima página' }),
    ).toBeDisabled()
  })
})
