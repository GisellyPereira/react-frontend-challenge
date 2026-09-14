import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BOOK_SEARCH_DEBOUNCE_MS, useDiscoverInput } from './use-discover-input'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('debounce da digitação', () => {
  it('atualiza o campo imediatamente e pesquisa apenas o último texto após 450 ms', () => {
    const search = vi.fn()
    const { result } = renderHook(() => useDiscoverInput('', search))
    act(() => result.current.changeQuery('Cla'))
    expect(result.current.query).toBe('Cla')
    act(() => {
      vi.advanceTimersByTime(300)
    })
    act(() => result.current.changeQuery('  Clarice  '))
    act(() => {
      vi.advanceTimersByTime(BOOK_SEARCH_DEBOUNCE_MS - 1)
    })
    expect(search).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(search).toHaveBeenCalledExactlyOnceWith('Clarice', {
      automatic: true,
    })
  })

  it('envia imediatamente por ação explícita e cancela a busca pendente', () => {
    const search = vi.fn()
    const { result } = renderHook(() => useDiscoverInput('', search))
    act(() => result.current.changeQuery('Clarice'))
    act(() => result.current.submitQuery('Fantasia'))
    expect(search).toHaveBeenCalledExactlyOnceWith('Fantasia')
    expect(result.current.query).toBe('Fantasia')
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(search).toHaveBeenCalledTimes(1)
  })

  it.each(['', '   ', ' Romance '])(
    'não consulta um termo vazio ou já confirmado: %s',
    (value) => {
      const search = vi.fn()
      const { result } = renderHook(() => useDiscoverInput('Romance', search))
      act(() => result.current.changeQuery('Clarice'))
      act(() => result.current.changeQuery(value))
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(search).not.toHaveBeenCalled()
      expect(result.current.query).toBe(value)
    },
  )

  it('sincroniza a navegação e cancela um rascunho da página anterior', () => {
    const search = vi.fn()
    const { result, rerender, unmount } = renderHook(
      ({ query }) => useDiscoverInput(query, search),
      { initialProps: { query: 'Romance' } },
    )
    act(() => result.current.changeQuery('Clarice'))
    rerender({ query: 'Tecnologia' })
    expect(result.current.query).toBe('Tecnologia')
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(search).not.toHaveBeenCalled()
    rerender({ query: 'Romance' })
    expect(result.current.query).toBe('Romance')
    act(() => result.current.changeQuery('Poesia'))
    unmount()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(search).not.toHaveBeenCalled()
  })
})
