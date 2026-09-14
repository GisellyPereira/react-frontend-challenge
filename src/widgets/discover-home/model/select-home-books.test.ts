import { describe, expect, it } from 'vitest'
import { parseGoogleVolume } from '@/entities/book/api/map-google-volume'
import { selectRatedBooks, uniqueBooks } from './select-home-books'

const book = (id: string, averageRating?: number, ratingsCount?: number) =>
  parseGoogleVolume({
    id,
    volumeInfo: { title: id, averageRating, ratingsCount },
  })
describe('seleção da home', () => {
  it('não inventa avaliações nem usa notas com pouca amostragem', () => {
    expect(
      selectRatedBooks([
        book('sem-nota'),
        book('uma-avaliacao', 5, 1),
        book('baixa', 3, 50),
        book('valida', 4.5, 20),
      ]).map((item) => item.id),
    ).toEqual(['valida'])
  })
  it('ordena por nota e desempata pela quantidade de avaliações', () => {
    expect(
      selectRatedBooks([
        book('a', 4, 50),
        book('b', 5, 10),
        book('c', 5, 30),
      ]).map((item) => item.id),
    ).toEqual(['c', 'b', 'a'])
  })
  it('limita a cinco sugestões únicas', () => {
    const books = Array.from({ length: 8 }, (_, index) =>
      book(String(index), 4, 10),
    )
    expect(selectRatedBooks([...books, ...books])).toHaveLength(5)
    expect(uniqueBooks([...books, ...books])).toHaveLength(8)
  })
})
