import { describe, expect, it } from 'vitest'
import type { SavedBook } from '@/features/manage-shelf'
import { sortBooks } from './sort-books'

function book(
  id: string,
  title: string | null,
  status: SavedBook['status'] = 'want-to-read',
): SavedBook {
  return {
    id,
    title,
    status,
    authors: [],
    cover: { large: null, small: null },
    publishedDate: null,
    pageCount: null,
    categories: [],
  }
}

describe('ordenação da estante', () => {
  const titles = [
    book('z', 'Zebra'),
    book('c10', 'Capítulo 10'),
    book('ar', 'árvore'),
    book('c2', 'Capítulo 2'),
    book('ag', ' Água viva '),
  ]

  it.each([
    ['asc', ['ag', 'ar', 'c2', 'c10', 'z']],
    ['desc', ['z', 'c10', 'c2', 'ar', 'ag']],
  ] as const)(
    'ordena títulos em português na direção %s',
    (direction, expected) => {
      expect(
        sortBooks(titles, { field: 'title', direction }).map(({ id }) => id),
      ).toEqual(expected)
    },
  )

  it.each(['asc', 'desc'] as const)(
    'deixa títulos ausentes ao final em %s',
    (direction) => {
      const books = [
        book('null', null),
        book('a', 'A'),
        book('blank', '  '),
        book('empty', ''),
      ]
      expect(
        sortBooks(books, { field: 'title', direction }).map(({ id }) => id),
      ).toEqual(['a', 'null', 'blank', 'empty'])
    },
  )

  it.each([
    ['asc', ['want-a', 'want-z', 'reading', 'read-a', 'read-z']],
    ['desc', ['read-a', 'read-z', 'reading', 'want-a', 'want-z']],
  ] as const)(
    'ordena status em %s e desempata por título',
    (direction, expected) => {
      const books = [
        book('read-z', 'Z', 'read'),
        book('want-z', 'Z'),
        book('reading', 'B', 'reading'),
        book('want-a', 'A'),
        book('read-a', 'A', 'read'),
      ]
      expect(
        sortBooks(books, { field: 'status', direction }).map(({ id }) => id),
      ).toEqual(expected)
    },
  )

  it('preserva a ordem de inclusão até escolher uma coluna e não modifica a coleção', () => {
    const books = Object.freeze([...titles])
    expect(sortBooks(books, null)).toEqual(titles)
    sortBooks(books, { field: 'title', direction: 'asc' })
    expect(books).toEqual(titles)
    expect(sortBooks([], { field: 'title', direction: 'asc' })).toEqual([])
  })

  it('mantém a ordem relativa quando os títulos são equivalentes', () => {
    const books = [book('1', 'Água'), book('2', 'água'), book('3', 'Agua')]
    expect(sortBooks(books, { field: 'title', direction: 'desc' })).toEqual(
      books,
    )
  })
})
