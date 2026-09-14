import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Book, BookSearchResult } from '@/entities/book'
import { useBookSearch, type DiscoverSearch } from '@/features/discover-books'

import { BookResults } from './book-results'

vi.mock('@/entities/book', () => {
  return {
    BOOKS_PER_PAGE: 15,
    BookCard: () => null,
  }
})

vi.mock('@/features/discover-books', () => {
  return {
    useBookSearch: vi.fn(),
  }
})

const useBookSearchMock = vi.mocked(useBookSearch)

type UseBookSearchResult = ReturnType<typeof useBookSearch>

const firstBook: Book = {
  authors: ['Ursula K. Le Guin'],
  averageRating: 4.6,
  categories: ['Ficção científica'],
  cover: { large: null, small: null },
  description: null,
  id: 'volume-1',
  infoUrl: null,
  language: 'pt-BR',
  pageCount: 304,
  previewUrl: null,
  publishedDate: '1969',
  publisher: 'Ace Books',
  ratingsCount: 150,
  subtitle: null,
  title: 'A mão esquerda da escuridão',
}

const secondBook: Book = {
  ...firstBook,
  authors: ['Octavia E. Butler'],
  id: 'volume-2',
  publishedDate: '1979',
  title: 'Kindred',
}

function createSearch(overrides: Partial<DiscoverSearch> = {}): DiscoverSearch {
  return {
    orderBy: 'relevance',
    printType: 'all',
    q: 'ficção',
    startIndex: 0,
    ...overrides,
  }
}

function createResult(
  overrides: Partial<UseBookSearchResult> = {},
): UseBookSearchResult {
  return {
    data: undefined,
    error: null,
    hasSearchTerm: true,
    isError: false,
    isFetching: false,
    isPending: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    searchParams: null,
    ...overrides,
  } as UseBookSearchResult
}

function createLoadedPage(
  overrides: Partial<BookSearchResult> = {},
): BookSearchResult {
  return {
    books: [firstBook, secondBook],
    nextStartIndex: 15,
    pageSize: 15,
    receivedItems: 2,
    startIndex: 0,
    totalItems: 30,
    ...overrides,
  }
}

describe('BookResults', () => {
  it('exibe o erro retornado e permite tentar novamente', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()

    useBookSearchMock.mockReturnValue(
      createResult({
        error: new Error('O catálogo está indisponível.'),
        isError: true,
        refetch,
      }),
    )

    render(<BookResults search={createSearch()} onPageChange={vi.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'O catálogo está indisponível.',
    )

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(refetch).toHaveBeenCalledOnce()
  })

  it('navega para as páginas anterior e seguinte pelos índices da API', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    useBookSearchMock.mockReturnValue(
      createResult({
        data: createLoadedPage({
          nextStartIndex: 30,
          startIndex: 15,
          totalItems: 45,
        }),
      }),
    )

    render(
      <BookResults
        search={createSearch({ startIndex: 15 })}
        onPageChange={onPageChange}
      />,
    )

    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await user.click(screen.getByRole('button', { name: 'Página anterior' }))
    await user.click(screen.getByRole('button', { name: 'Próxima página' }))
    await user.click(screen.getByRole('button', { name: 'Página 3' }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 0)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 30)
    expect(onPageChange).toHaveBeenNthCalledWith(3, 30)
  })
  it.each([1, 27, 300, 1247])(
    'exibe o total %i retornado pela API',
    (totalItems) => {
      useBookSearchMock.mockReturnValue(
        createResult({ data: createLoadedPage({ totalItems }) }),
      )
      render(<BookResults search={createSearch()} onPageChange={vi.fn()} />)
      expect(
        screen.getByText(
          new RegExp(
            new Intl.NumberFormat('pt-BR').format(totalItems) + ' resultado',
          ),
        ),
      ).toHaveTextContent('pelo Google Books')
    },
  )
  it('impede avançar quando a API encerra os resultados', async () => {
    const onPageChange = vi.fn()
    useBookSearchMock.mockReturnValue(
      createResult({ data: createLoadedPage({ nextStartIndex: null }) }),
    )
    render(<BookResults search={createSearch()} onPageChange={onPageChange} />)
    expect(
      screen.getByRole('button', { name: 'Página anterior' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Próxima página' }),
    ).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Página 2' }),
    ).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Próxima página' }),
    )
    expect(onPageChange).not.toHaveBeenCalled()
  })
  it('não atribui o total anterior à nova busca enquanto carrega', () => {
    useBookSearchMock.mockReturnValue(
      createResult({
        data: createLoadedPage(),
        isPlaceholderData: true,
        isFetching: true,
      }),
    )
    render(
      <BookResults
        search={createSearch({ q: 'nova busca' })}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.queryByText(/30 resultados/)).not.toBeInTheDocument()
    expect(screen.getByText('Atualizando resultados…')).toBeInTheDocument()
  })
})
