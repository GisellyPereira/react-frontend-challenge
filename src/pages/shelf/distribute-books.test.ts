import { describe, expect, it } from 'vitest'
import { distributeBooks, shelfCapacity } from './distribute-books'

describe('distribuição das prateleiras', () => {
  it.each([240, 280, 335, 390, 600, 800, 1200])(
    'acomoda capa e lombadas em %i px',
    (width) => {
      const capacity = shelfCapacity(width)
      expect(
        Math.min(224, width * 0.46) + (capacity - 1) * 57.6 + 32,
      ).toBeLessThanOrEqual(width)
      const books = Array.from({ length: 37 }, (_, i) => i)
      const rows = distributeBooks(books, capacity)
      expect(rows.flat()).toEqual(books)
      expect(rows.every((row) => row.length <= capacity)).toBe(true)
    },
  )
  it.each([0, 1, 12, 13, 15, 24, 25, 100])(
    'equilibra %i livros sem perder a ordem',
    (count) => {
      const books = Array.from({ length: count }, (_, i) => i)
      const rows = distributeBooks(books)
      expect(rows.flat()).toEqual(books)
      expect(rows.every((row) => row.length <= 12 && row.length > 0)).toBe(true)
      if (rows.length)
        expect(
          Math.max(...rows.map((row) => row.length)) -
            Math.min(...rows.map((row) => row.length)),
        ).toBeLessThanOrEqual(1)
    },
  )
  it('distribui quinze livros em oito e sete', () => {
    expect(
      distributeBooks(Array.from({ length: 15 })).map((row) => row.length),
    ).toEqual([8, 7])
  })
})
