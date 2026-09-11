import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('loadGoogleViewer', () => {
  it('inicializa pelo callback da API mesmo depois do evento load da página', async () => {
    vi.resetModules()
    window.dispatchEvent(new Event('load'))
    const api = {
      load: vi.fn(() => {
        vi.stubGlobal('google', { books: readyApi })
        const script = document.createElement('script')
        script.src = 'https://www.google.com/books/api.js?hl=pt-BR'
        document.head.append(script)
        script.dispatchEvent(new Event('load'))
        script.remove()
      }),
      setOnLoadCallback: vi.fn(),
    }
    const readyApi = { DefaultViewer: class {} }
    vi.stubGlobal('google', { books: api })
    const { loadGoogleViewer } = await import('./google-viewer')
    await expect(loadGoogleViewer()).resolves.toBe(readyApi)
    expect(api.load).toHaveBeenCalledWith({
      language: 'pt-BR',
    })
    expect(api.setOnLoadCallback).not.toHaveBeenCalled()
    await loadGoogleViewer()
    expect(api.load).toHaveBeenCalledOnce()
  })
})
