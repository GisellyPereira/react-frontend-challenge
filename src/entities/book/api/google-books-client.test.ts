import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { server } from '@/shared/config/test/mocks/server'

import { createGoogleBooksClient } from './google-books-client'

const baseUrl = 'https://books.test/v1'
const fakeApiKey = 'test-api-key'

const volumePayload = {
  id: 'volume-1',
  volumeInfo: {
    authors: ['Ursula K. Le Guin'],
    description: 'Uma história sobre liberdade e escolhas.',
    publishedDate: '1969',
    publisher: 'Ace Books',
    title: 'A mão esquerda da escuridão',
  },
}

function jsonResponse(payload: Record<string, unknown>) {
  return HttpResponse.json(payload)
}

describe('createGoogleBooksClient', () => {
  it('envia os parâmetros normalizados da busca e a chave configurada', async () => {
    const capturedRequest: {
      acceptHeader: string | null
      url: URL | null
    } = {
      acceptHeader: null,
      url: null,
    }

    server.use(
      http.get(`${baseUrl}/volumes`, ({ request }) => {
        capturedRequest.url = new URL(request.url)
        capturedRequest.acceptHeader = request.headers.get('Accept')

        return jsonResponse({ items: [volumePayload], totalItems: 1 })
      }),
    )

    const client = createGoogleBooksClient({
      apiKey: `  ${fakeApiKey}  `,
      baseUrl: `${baseUrl}/`,
    })
    const result = await client.search({
      maxResults: 20,
      orderBy: 'newest',
      printType: 'books',
      query: '  ficção & sociedade  ',
      startIndex: 12,
    })

    expect(capturedRequest.url).not.toBeNull()

    const searchParams = capturedRequest.url?.searchParams

    expect(searchParams?.get('q')).toBe('ficção & sociedade')
    expect(searchParams?.get('startIndex')).toBe('12')
    expect(searchParams?.get('maxResults')).toBe('20')
    expect(searchParams?.get('printType')).toBe('books')
    expect(searchParams?.get('orderBy')).toBe('newest')
    expect(searchParams?.get('projection')).toBe('lite')
    expect(searchParams?.get('key')).toBe(fakeApiKey)
    expect(capturedRequest.acceptHeader).toBe('application/json')
    expect(result.books).toHaveLength(1)
    expect(result.books[0]?.title).toBe('A mão esquerda da escuridão')
  })

  it.each([
    ['ausente', {}],
    ['com espaços', { apiKey: '   ' }],
  ])('não envia uma chave %s', async (_label, options) => {
    const capturedRequest: { url: URL | null } = { url: null }

    server.use(
      http.get(`${baseUrl}/volumes`, ({ request }) => {
        capturedRequest.url = new URL(request.url)

        return jsonResponse({ totalItems: 0 })
      }),
    )

    const client = createGoogleBooksClient({ baseUrl, ...options })

    await client.search({ query: 'design' })

    expect(capturedRequest.url?.searchParams.has('key')).toBe(false)
  })

  it('consulta os detalhes com o identificador codificado e projeção completa', async () => {
    const capturedRequest: { url: URL | null } = { url: null }

    server.use(
      http.get(`${baseUrl}/volumes/:bookId`, ({ request }) => {
        capturedRequest.url = new URL(request.url)

        return jsonResponse(volumePayload)
      }),
    )

    const client = createGoogleBooksClient({ baseUrl })
    const book = await client.getById('  volume/1 ?  ')

    expect(capturedRequest.url?.pathname).toBe('/v1/volumes/volume%2F1%20%3F')
    expect(capturedRequest.url?.searchParams.get('projection')).toBe('full')
    expect(book).toMatchObject({
      authors: ['Ursula K. Le Guin'],
      id: 'volume-1',
      publishedDate: '1969',
      publisher: 'Ace Books',
      title: 'A mão esquerda da escuridão',
    })
  })

  it.each([
    [400, 'request'],
    [403, 'forbidden'],
    [429, 'rate-limit'],
    [500, 'server'],
  ] as const)('normaliza o erro HTTP %i da busca', async (status, code) => {
    server.use(
      http.get(`${baseUrl}/volumes`, () => HttpResponse.json({}, { status })),
    )

    const client = createGoogleBooksClient({ baseUrl })

    await expect(client.search({ query: 'romance' })).rejects.toMatchObject({
      code,
      name: 'ApiError',
      status,
    })
  })

  it('normaliza o erro 404 nos detalhes', async () => {
    server.use(
      http.get(`${baseUrl}/volumes/:bookId`, () =>
        HttpResponse.json({}, { status: 404 }),
      ),
    )

    const client = createGoogleBooksClient({ baseUrl })

    await expect(client.getById('inexistente')).rejects.toMatchObject({
      code: 'not-found',
      name: 'ApiError',
      status: 404,
    })
  })

  it('rejeita um identificador vazio antes de fazer a requisição', async () => {
    const fetcher: typeof fetch = vi.fn()
    const client = createGoogleBooksClient({ baseUrl, fetcher })

    await expect(client.getById('   ')).rejects.toMatchObject({
      code: 'request',
      name: 'ApiError',
      status: null,
    })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('normaliza respostas com JSON inválido', async () => {
    server.use(
      http.get(
        `${baseUrl}/volumes`,
        () =>
          new HttpResponse('{conteúdo inválido', {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          }),
      ),
    )

    const client = createGoogleBooksClient({ baseUrl })

    await expect(client.search({ query: 'poesia' })).rejects.toMatchObject({
      code: 'invalid-response',
      name: 'ApiError',
      status: 200,
    })
  })

  it('normaliza um contrato inválido mesmo quando o HTTP retorna sucesso', async () => {
    server.use(http.get(`${baseUrl}/volumes`, () => HttpResponse.json(null)))

    const client = createGoogleBooksClient({ baseUrl })

    await expect(client.search({ query: 'poesia' })).rejects.toMatchObject({
      code: 'invalid-response',
      name: 'ApiError',
      status: 200,
    })
  })

  it('transforma uma falha de conexão em erro de rede controlado', async () => {
    const fetcher: typeof fetch = vi.fn(() =>
      Promise.reject(new TypeError('Failed to fetch')),
    )
    const client = createGoogleBooksClient({ baseUrl, fetcher })

    await expect(client.search({ query: 'poesia' })).rejects.toMatchObject({
      code: 'network',
      name: 'ApiError',
      status: null,
    })
  })

  it('preserva o cancelamento da requisição sem transformá-lo em erro de rede', async () => {
    const abortError = new Error('A requisição foi cancelada.')
    abortError.name = 'AbortError'

    const fetcher: typeof fetch = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal

          if (signal?.aborted) {
            reject(abortError)
            return
          }

          signal?.addEventListener(
            'abort',
            () => {
              reject(abortError)
            },
            { once: true },
          )
        })
      },
    )
    const client = createGoogleBooksClient({ baseUrl, fetcher })
    const controller = new AbortController()

    const request = client.search({ query: 'fantasia' }, controller.signal)
    controller.abort()

    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetcher).toHaveBeenCalledOnce()
    expect(fetcher).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ signal: controller.signal }),
    )
  })
})
