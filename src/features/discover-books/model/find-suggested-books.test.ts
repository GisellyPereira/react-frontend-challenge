import { describe, expect, it, vi } from 'vitest'
import type { BookSearchResult } from '@/entities/book'
import { parseGoogleVolume } from '@/entities/book/api/map-google-volume'
import { findSuggestedBooks } from './find-suggested-books'

const book = parseGoogleVolume({
  id: 'current',
  volumeInfo: { categories: ['Music'], authors: ['Author'] },
})
const result = (...ids: string[]): BookSearchResult => ({
  books: ids.map((id) => parseGoogleVolume({ id })),
  nextStartIndex: null,
  pageSize: 12,
  receivedItems: ids.length,
  startIndex: 0,
  totalItems: ids.length,
})

describe('sugestões de leitura', () => {
  it('completa os relacionados sem duplicar nem sugerir o livro aberto', async () => {
    const search = vi
      .fn()
      .mockResolvedValueOnce(result('current', 'a'))
      .mockResolvedValueOnce(result('a', 'b'))
      .mockResolvedValueOnce(result('b', 'c', 'd', 'e', 'f'))
    const suggestions = await findSuggestedBooks(book, search)
    expect(suggestions.books.map((item) => item.id)).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
    ])
    expect(suggestions.broadened).toBe(true)
    expect(search).toHaveBeenCalledTimes(3)
  })
  it('busca outros assuntos mesmo sem autor ou categoria', async () => {
    const search = vi
      .fn()
      .mockResolvedValueOnce(result())
      .mockResolvedValueOnce(result('a', 'b', 'c', 'd', 'e'))
    const suggestions = await findSuggestedBooks(
      { id: 'current', categories: [], authors: [] },
      search,
    )
    expect(suggestions.books).toHaveLength(5)
    expect(search).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ query: 'subject:fiction' }),
      undefined,
    )
    expect(search).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ query: 'subject:history' }),
      undefined,
    )
  })
  it('não consulta outros assuntos quando já tem cinco sugestões', async () => {
    const search = vi.fn().mockResolvedValue(result('a', 'b', 'c', 'd', 'e'))
    expect((await findSuggestedBooks(book, search)).broadened).toBe(false)
    expect(search).toHaveBeenCalledOnce()
  })
  it('não insiste em outras categorias quando a API falha', async () => {
    const search = vi.fn().mockRejectedValue(new Error('Quota'))
    await expect(findSuggestedBooks(book, search)).rejects.toThrow('Quota')
    expect(search).toHaveBeenCalledOnce()
  })
})
