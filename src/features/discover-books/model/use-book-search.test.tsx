import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  BookRepository,
  BookSearchParams,
  BookSearchResult,
} from '@/entities/book'

import { discoverSearchDefaults, type DiscoverSearch } from './discover-search'
import { BOOK_SEARCH_DEBOUNCE_MS, useBookSearch } from './use-book-search'

const firstPage: BookSearchResult = {
  books: [],
  nextStartIndex: 12,
  pageSize: 12,
  receivedItems: 12,
  startIndex: 0,
  totalItems: 24,
}

const secondPage: BookSearchResult = {
  books: [],
  nextStartIndex: null,
  pageSize: 12,
  receivedItems: 12,
  startIndex: 12,
  totalItems: 24,
}

interface RepositoryFixture {
  repository: BookRepository
  search: ReturnType<typeof vi.fn<BookRepository['search']>>
}

function createRepositoryFixture(): RepositoryFixture {
  const search = vi.fn<BookRepository['search']>().mockResolvedValue(firstPage)

  return {
    repository: {
      getById: vi.fn<BookRepository['getById']>(),
      search,
    },
    search,
  }
}

function createWrapper(config?: QueryClientConfig) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Number.POSITIVE_INFINITY,
        retry: false,
      },
    },
    ...config,
  })

  return function QueryWrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

function withSearch(overrides: Partial<DiscoverSearch>): DiscoverSearch {
  return { ...discoverSearchDefaults, ...overrides }
}

describe('useBookSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('não consulta o repositório para um termo composto apenas por espaços', () => {
    const q = '    '
    const { repository, search } = createRepositoryFixture()

    const { result } = renderHook(
      () => useBookSearch(withSearch({ q }), repository),
      { wrapper: createWrapper() },
    )

    act(() => {
      vi.advanceTimersByTime(BOOK_SEARCH_DEBOUNCE_MS)
    })

    expect(search).not.toHaveBeenCalled()
    expect(result.current.searchParams).toBeNull()
  })

  it('espera o debounce e consulta somente o último termo digitado', async () => {
    const { repository, search } = createRepositoryFixture()
    const { result, rerender } = renderHook(
      ({ currentSearch }) => useBookSearch(currentSearch, repository),
      {
        initialProps: { currentSearch: withSearch({ q: '' }) },
        wrapper: createWrapper(),
      },
    )

    rerender({ currentSearch: withSearch({ q: 'rea' }) })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    rerender({ currentSearch: withSearch({ q: 'react' }) })

    act(() => {
      vi.advanceTimersByTime(BOOK_SEARCH_DEBOUNCE_MS - 1)
    })

    expect(result.current.isDebouncing).toBe(true)
    expect(search).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    await vi.waitFor(() => {
      expect(search).toHaveBeenCalledOnce()
    })

    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'react' }),
      expect.any(AbortSignal),
    )
  })

  it('normaliza o termo e encaminha filtros, página e tamanho ao repositório', async () => {
    const { repository, search } = createRepositoryFixture()

    renderHook(
      () =>
        useBookSearch(
          withSearch({
            orderBy: 'newest',
            printType: 'books',
            q: '  clean    architecture  ',
            startIndex: 24,
          }),
          repository,
        ),
      { wrapper: createWrapper() },
    )

    await vi.waitFor(() => {
      expect(search).toHaveBeenCalledOnce()
    })

    expect(search.mock.calls[0]?.[0]).toEqual({
      maxResults: 12,
      orderBy: 'newest',
      printType: 'books',
      query: 'clean architecture',
      startIndex: 24,
    } satisfies BookSearchParams)
  })

  it('mantém a página anterior enquanto a próxima página é carregada', async () => {
    const { repository, search } = createRepositoryFixture()
    let resolveSecondPage: ((result: BookSearchResult) => void) | undefined

    search.mockResolvedValueOnce(firstPage).mockImplementationOnce(
      () =>
        new Promise<BookSearchResult>((resolve) => {
          resolveSecondPage = resolve
        }),
    )

    const { result, rerender } = renderHook(
      ({ currentSearch }) => useBookSearch(currentSearch, repository),
      {
        initialProps: { currentSearch: withSearch({ q: 'react' }) },
        wrapper: createWrapper(),
      },
    )

    await vi.waitFor(() => {
      expect(result.current.data).toEqual(firstPage)
    })

    rerender({
      currentSearch: withSearch({ q: 'react', startIndex: 12 }),
    })

    await vi.waitFor(() => {
      expect(search).toHaveBeenCalledTimes(2)
    })

    expect(result.current.data).toEqual(firstPage)
    expect(result.current.isPlaceholderData).toBe(true)

    act(() => {
      resolveSecondPage?.(secondPage)
    })

    await vi.waitFor(() => {
      expect(result.current.data).toEqual(secondPage)
    })
  })
})
