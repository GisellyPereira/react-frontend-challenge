export interface BookViewer {
  load: (id: string, failure: () => void, success: () => void) => void
  nextPage: () => void
  previousPage: () => void
  resize: () => void
}
interface ViewerApi {
  load: (options: { language: string }) => void
  DefaultViewer: new (element: HTMLElement) => BookViewer
}
const getApi = () =>
  (window as Window & { google?: { books?: ViewerApi } }).google?.books
let pending: Promise<ViewerApi> | undefined

export function loadGoogleViewer(): Promise<ViewerApi> {
  if (pending) return pending
  pending = new Promise<ViewerApi>((resolve, reject) => {
    const script = document.createElement('script')
    let finished = false
    const onApiLoad = (event: Event) => {
      const target = event.target
      if (
        !(target instanceof HTMLScriptElement) ||
        !target.src.startsWith('https://www.google.com/books/api.js')
      )
        return
      const readyApi = getApi()
      if (finished || !readyApi?.DefaultViewer) return
      finished = true
      clearTimeout(timer)
      document.removeEventListener('load', onApiLoad, true)
      resolve(readyApi)
    }
    const fail = () => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      script.remove()
      document.removeEventListener('load', onApiLoad, true)
      reject(new Error('O leitor não respondeu.'))
    }
    const timer = window.setTimeout(fail, 15000)
    const initialize = () => {
      if (finished) return
      const api = getApi()
      if (!api) {
        fail()
        return
      }
      try {
        if (api.DefaultViewer) {
          finished = true
          clearTimeout(timer)
          resolve(api)
          return
        }
        // The legacy loader's window-load callback does not run for a lazy modal.
        // Observe the API script itself and resolve the current (replaced) namespace.
        document.addEventListener('load', onApiLoad, true)
        api.load({ language: 'pt-BR' })
      } catch {
        fail()
      }
    }
    if (getApi()) initialize()
    else {
      script.src = 'https://www.google.com/books/jsapi.js'
      script.async = true
      script.onload = initialize
      script.onerror = fail
      document.head.append(script)
    }
  }).catch((error: unknown) => {
    pending = undefined
    throw error
  })
  return pending
}
