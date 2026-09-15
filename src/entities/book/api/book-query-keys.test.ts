import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { normalizeBookSearchParams } from '../model/book-search'
import { bookQueryKeys } from './book-query-keys'

const baseSearch = normalizeBookSearchParams({
  maxResults: 12,
  orderBy: 'relevance',
  printType: 'all',
  query: 'React',
  startIndex: 0,
})

describe('bookQueryKeys', () => {
  it('mantém uma hierarquia previsível para buscas e detalhes', () => {
    expect(bookQueryKeys.all).toEqual(['books'])
    expect(bookQueryKeys.searches()).toEqual(['books', 'search'])
    expect(bookQueryKeys.search(baseSearch)).toEqual([
      'books',
      'search',
      baseSearch,
    ])
    expect(bookQueryKeys.details()).toEqual(['books', 'detail'])
    expect(bookQueryKeys.detail('volume-1')).toEqual([
      'books',
      'detail',
      'volume-1',
    ])
  })

  it('isola o cache por termo, filtro, ordenação, página e tamanho', () => {
    const queryClient = new QueryClient()
    const baseKey = bookQueryKeys.search(baseSearch)
    const variants = [
      { ...baseSearch, query: 'TypeScript' },
      { ...baseSearch, printType: 'books' as const },
      { ...baseSearch, orderBy: 'newest' as const },
      { ...baseSearch, startIndex: 12 },
      { ...baseSearch, maxResults: 20 },
    ]

    queryClient.setQueryData(baseKey, 'resultado-base')

    expect(queryClient.getQueryData(baseKey)).toBe('resultado-base')

    for (const variant of variants) {
      expect(
        queryClient.getQueryData(bookQueryKeys.search(variant)),
      ).toBeUndefined()
    }
  })
})
