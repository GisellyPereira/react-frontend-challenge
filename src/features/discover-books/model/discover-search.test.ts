import { describe, expect, it } from 'vitest'

import { discoverSearchDefaults, discoverSearchSchema } from './discover-search'

describe('discoverSearchSchema', () => {
  it('aplica os padrões quando a URL não informa uma busca', () => {
    expect(discoverSearchSchema.parse({})).toEqual(discoverSearchDefaults)
  })

  it('preserva uma busca válida e o texto exatamente como foi digitado', () => {
    expect(
      discoverSearchSchema.parse({
        orderBy: 'newest',
        printType: 'magazines',
        q: '  design editorial  ',
        startIndex: 24,
      }),
    ).toEqual({
      orderBy: 'newest',
      printType: 'magazines',
      q: '  design editorial  ',
      startIndex: 24,
    })
  })

  it('recupera valores seguros para parâmetros inválidos vindos da URL', () => {
    expect(
      discoverSearchSchema.parse({
        orderBy: 'popular',
        printType: 'ebooks',
        q: 42,
        startIndex: -12,
      }),
    ).toEqual(discoverSearchDefaults)
  })
})
