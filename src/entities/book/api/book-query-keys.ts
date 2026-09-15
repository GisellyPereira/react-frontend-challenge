import type { NormalizedBookSearchParams } from '../model/book-search'

export const bookQueryKeys = {
  all: ['books'] as const,
  detail: (bookId: string) => [...bookQueryKeys.details(), bookId] as const,
  details: () => [...bookQueryKeys.all, 'detail'] as const,
  search: (params: NormalizedBookSearchParams) =>
    [...bookQueryKeys.searches(), params] as const,
  searches: () => [...bookQueryKeys.all, 'search'] as const,
}
