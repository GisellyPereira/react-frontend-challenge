import { describe, expect, it } from 'vitest'

import {
  BOOKS_PER_PAGE,
  bookSearchParamsSchema,
  normalizeBookSearchParams,
} from './book-search'

describe('normalizeBookSearchParams', () => {
  it('remove espaços externos e aplica os padrões da descoberta', () => {
    expect(
      normalizeBookSearchParams({
        query: '   arquitetura    frontend   ',
      }),
    ).toEqual({
      maxResults: BOOKS_PER_PAGE,
      orderBy: 'relevance',
      printType: 'all',
      query: 'arquitetura frontend',
      startIndex: 0,
    })
  })

  it('preserva parâmetros válidos explicitamente informados', () => {
    expect(
      normalizeBookSearchParams({
        maxResults: 40,
        orderBy: 'newest',
        printType: 'magazines',
        query: 'Design',
        startIndex: 80,
      }),
    ).toEqual({
      maxResults: 40,
      orderBy: 'newest',
      printType: 'magazines',
      query: 'Design',
      startIndex: 80,
    })
  })

  it.each([
    ['busca vazia', { query: '   ' }],
    [
      'quantidade de resultados igual a zero',
      { maxResults: 0, query: 'React' },
    ],
    ['quantidade acima do limite da API', { maxResults: 41, query: 'React' }],
    ['quantidade fracionária', { maxResults: 12.5, query: 'React' }],
    ['índice negativo', { query: 'React', startIndex: -1 }],
    ['índice fracionário', { query: 'React', startIndex: 1.5 }],
    ['tipo de impressão desconhecido', { printType: 'ebooks', query: 'React' }],
    ['ordenação desconhecida', { orderBy: 'popular', query: 'React' }],
  ])('rejeita %s', (_scenario, params) => {
    expect(bookSearchParamsSchema.safeParse(params).success).toBe(false)
  })
})
