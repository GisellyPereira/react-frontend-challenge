import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { THEME_STORAGE_KEY, useThemeStore } from './theme-store'

describe('preferência de tema', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' })
    useThemeStore.persist.clearStorage()
  })
  afterEach(() => vi.restoreAllMocks())

  it('salva a preferência e a restaura ao reidratar a aplicação', async () => {
    useThemeStore.getState().setTheme('dark')
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    expect(JSON.parse(saved!)).toEqual({ state: { theme: 'dark' }, version: 1 })
    useThemeStore.setState({ theme: 'light' })
    localStorage.setItem(THEME_STORAGE_KEY, saved!)
    await useThemeStore.persist.rehydrate()
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('ignora valores de tema inválidos recuperados do armazenamento', async () => {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ state: { theme: 'invalid' }, version: 1 }),
    )
    await useThemeStore.persist.rehydrate()
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('continua funcionando se o navegador bloquear a gravação', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    expect(() => useThemeStore.getState().setTheme('dark')).not.toThrow()
    expect(useThemeStore.getState().theme).toBe('dark')
  })
})
