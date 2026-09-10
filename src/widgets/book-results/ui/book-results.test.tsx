import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Book, BookSearchResult } from '@/entities/book'
import { useBookSearch, type DiscoverSearch } from '@/features/discover-books'

import { BookResults } from './book-results'

vi.mock('@/entities/book', () => {
  return {
    BOOKS_PER_PAGE: 12,
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
    debouncedQuery: 'ficção',
    error: null,
    hasSearchTerm: true,
    isDebouncing: false,
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
    nextStartIndex: 12,
    pageSize: 12,
    receivedItems: 2,
    startIndex: 0,
    totalItems: 24,
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
          nextStartIndex: 24,
          startIndex: 12,
          totalItems: 36,
        }),
      }),
    )

    render(
      <BookResults
        search={createSearch({ startIndex: 12 })}
        onPageChange={onPageChange}
      />,
    )

    expect(screen.getAllByText('Página 2')).not.toHaveLength(0)

    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    await user.click(screen.getByRole('button', { name: 'Próxima' }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 0)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 24)
  })
})
