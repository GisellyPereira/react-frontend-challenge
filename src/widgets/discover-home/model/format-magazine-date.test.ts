import { describe, expect, it } from 'vitest'
import { formatMagazineDate } from './format-magazine-date'

describe('formatMagazineDate', () => {
  it.each([
    ['1989-07', 'jul. de 1989'],
    ['1904-11-01', 'nov. de 1904'],
    ['1908', '1908'],
    ['1989-13', '1989-13'],
    ['Data desconhecida', 'Data desconhecida'],
    [null, 'Data não informada'],
  ])('exibe a data %s sem inventar informações ausentes', (value, expected) => {
    expect(formatMagazineDate(value)).toBe(expected)
  })
})
