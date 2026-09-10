import {
  keepPreviousData,
  skipToken,
  useQuery,
  type QueryFunction,
} from '@tanstack/react-query'

import {
  BOOKS_PER_PAGE,
  bookQueryKeys,
  bookSearchParamsSchema,
  googleBooksClient,
  type BookRepository,
  type BookSearchResult,
} from '@/entities/book'

import { useDebouncedValue } from '../lib/use-debounced-value'
import type { DiscoverSearch } from './discover-search'

export const BOOK_SEARCH_DEBOUNCE_MS = 450

const idleBookSearchQueryKey = [...bookQueryKeys.searches(), 'idle'] as const

export function useBookSearch(
  search: DiscoverSearch,
  repository: BookRepository = googleBooksClient,
) {
  const debouncedQuery = useDebouncedValue(search.q, BOOK_SEARCH_DEBOUNCE_MS)
  const isDebouncing = debouncedQuery !== search.q
  const parsedParams = isDebouncing
    ? null
    : bookSearchParamsSchema.safeParse({
        maxResults: BOOKS_PER_PAGE,
        orderBy: search.orderBy,
        printType: search.printType,
        query: debouncedQuery,
        startIndex: search.startIndex,
      })
  const params = parsedParams?.success === true ? parsedParams.data : null
  const queryFn: QueryFunction<BookSearchResult> | typeof skipToken = params
    ? ({ signal }) => repository.search(params, signal)
    : skipToken
  const query = useQuery<BookSearchResult>({
    ...(params ? { placeholderData: keepPreviousData } : {}),
    queryFn,
    queryKey: params ? bookQueryKeys.search(params) : idleBookSearchQueryKey,
  })

  return {
    // eslint-disable-next-line @tanstack/query/no-rest-destructuring
    ...query,
    debouncedQuery,
    hasSearchTerm: search.q.trim().length > 0,
    isDebouncing,
    searchParams: params,
  }
}
