import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Lenis from 'lenis'
import { SmoothScroll } from './smooth-scroll'

const mocks = vi.hoisted(() => ({
  engine: {
    destroy: vi.fn(),
    stop: vi.fn(),
    start: vi.fn(),
    scrollTo: vi.fn(),
    isStopped: false,
  },
  unsubscribe: vi.fn(),
  router: { subscribe: vi.fn() },
}))
vi.mock('lenis', () => ({
  default: vi.fn(function () {
    return mocks.engine
  }),
}))
vi.mock('@tanstack/react-router', () => ({ useRouter: () => mocks.router }))

describe('rolagem global', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.router.subscribe.mockReturnValue(mocks.unsubscribe)
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
  })
  afterEach(() => {
    document.body.removeAttribute('data-scroll-locked')
    vi.unstubAllGlobals()
  })
  it('configura a suavização e libera a instância ao desmontar', () => {
    const { unmount } = render(<SmoothScroll />)
    expect(Lenis).toHaveBeenCalledWith(
      expect.objectContaining({
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
        lerp: 0.14,
        allowNestedScroll: false,
      }),
    )
    unmount()
    expect(mocks.engine.destroy).toHaveBeenCalledOnce()
    expect(mocks.unsubscribe).toHaveBeenCalledOnce()
  })
  it('mantém rolagem nativa com movimento reduzido', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    render(<SmoothScroll />)
    expect(Lenis).not.toHaveBeenCalled()
  })
  it('não interrompe a rolagem ao atualizar filtros na mesma página', () => {
    render(<SmoothScroll />)
    const callback = mocks.router.subscribe.mock.calls[0]?.[1] as (event: {
      fromLocation: { pathname: string }
      toLocation: { pathname: string }
    }) => void
    callback({
      fromLocation: { pathname: '/discover' },
      toLocation: { pathname: '/discover' },
    })
    expect(mocks.engine.scrollTo).not.toHaveBeenCalled()
    callback({
      fromLocation: { pathname: '/discover' },
      toLocation: { pathname: '/shelf' },
    })
    expect(mocks.engine.scrollTo).toHaveBeenCalledWith(window.scrollY, {
      immediate: true,
      force: true,
    })
  })
  it('interrompe a inércia quando o modal bloqueia o fundo', async () => {
    render(<SmoothScroll />)
    document.body.setAttribute('data-scroll-locked', '1')
    await waitFor(() => expect(mocks.engine.stop).toHaveBeenCalledOnce())
  })
})
