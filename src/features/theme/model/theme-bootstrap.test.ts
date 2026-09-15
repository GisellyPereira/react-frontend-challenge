import { afterEach, describe, expect, it, vi } from 'vitest'
import html from '../../../../index.html?raw'
import { THEME_STORAGE_KEY } from './theme-store'

const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1]
if (!script) throw new Error('Inicialização do tema não encontrada')
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const bootstrap = new Function(
  'window',
  'document',
  'localStorage',
  script,
) as (
  window: { matchMedia: () => { matches: boolean } },
  document: Document,
  storage: Pick<Storage, 'getItem'>,
) => void

afterEach(() => {
  localStorage.removeItem(THEME_STORAGE_KEY)
  document.documentElement.classList.remove('dark')
  document.documentElement.style.removeProperty('color-scheme')
})

describe('tema antes do primeiro frame', () => {
  it.each(['light', 'dark'])(
    'respeita a preferência salva %s antes do React montar',
    (theme) => {
      localStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ state: { theme }, version: 1 }),
      )
      bootstrap(
        { matchMedia: () => ({ matches: theme === 'light' }) },
        document,
        localStorage,
      )
      expect(document.documentElement.classList.contains('dark')).toBe(
        theme === 'dark',
      )
    },
  )

  it('usa o sistema na primeira visita ou quando os dados estão corrompidos', () => {
    const windowStub = { matchMedia: () => ({ matches: true }) }
    bootstrap(windowStub, document, localStorage)
    expect(document.documentElement).toHaveClass('dark')
    localStorage.setItem(THEME_STORAGE_KEY, '{invalid')
    bootstrap(windowStub, document, localStorage)
    expect(document.documentElement).toHaveClass('dark')
  })

  it('aplica o tema mesmo sem acesso ao localStorage', () => {
    const blocked = {
      getItem: vi.fn(() => {
        throw new Error('Blocked')
      }),
    }
    expect(() =>
      bootstrap({ matchMedia: () => ({ matches: true }) }, document, blocked),
    ).not.toThrow()
    expect(document.documentElement).toHaveClass('dark')
  })
})
