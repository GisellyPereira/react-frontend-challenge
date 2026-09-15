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

import type { DiscoverSearch } from './discover-search'

const idleBookSearchQueryKey = [...bookQueryKeys.searches(), 'idle'] as const

export function useBookSearch(
  search: DiscoverSearch,
  repository: BookRepository = googleBooksClient,
) {
  const parsedParams = bookSearchParamsSchema.safeParse({
    maxResults: BOOKS_PER_PAGE,
    orderBy: search.orderBy,
    printType: search.printType,
    query: search.q,
    startIndex: search.startIndex,
  })
  const params = parsedParams?.success === true ? parsedParams.data : null
  const queryFn: QueryFunction<BookSearchResult> | typeof skipToken = params
    ? ({ signal }) => repository.search(params, signal)
    : skipToken
  const query = useQuery<BookSearchResult>({
    meta: { errorMessage: 'Não foi possível buscar os livros.' },
    ...(params ? { placeholderData: keepPreviousData } : {}),
    queryFn,
    queryKey: params ? bookQueryKeys.search(params) : idleBookSearchQueryKey,
  })

  return {
    // eslint-disable-next-line @tanstack/query/no-rest-destructuring
    ...query,
    hasSearchTerm: search.q.trim().length > 0,
    searchParams: params,
  }
}
