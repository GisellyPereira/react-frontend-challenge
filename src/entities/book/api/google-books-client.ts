import { ApiError } from '@/shared/api/api-error'
import { env } from '@/shared/config/env'

import type { Book } from '../model/book'
import type { BookRepository } from '../model/book-repository'
import type {
  BookSearchParams,
  NormalizedBookSearchParams,
} from '../model/book-search'
import type { BookSearchResult } from '../model/book-search-result'
import { normalizeBookSearchParams } from '../model/book-search'
import {
  parseGoogleBooksSearchResponse,
  parseGoogleVolume,
} from './map-google-volume'

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1'

interface GoogleBooksClientOptions {
  apiKey?: string
  baseUrl?: string
  fetcher?: typeof fetch
}

function getErrorDetails(status: number) {
  if (status === 403) {
    return {
      code: 'forbidden' as const,
      message: 'A busca de livros não está autorizada no momento.',
    }
  }

  if (status === 404) {
    return {
      code: 'not-found' as const,
      message: 'O livro solicitado não foi encontrado.',
    }
  }

  if (status === 429) {
    return {
      code: 'rate-limit' as const,
      message:
        'A cota de consultas do catálogo foi atingida. Aguarde um instante ou confira a chave da API configurada no ambiente.',
    }
  }

  if (status >= 500) {
    return {
      code: 'server' as const,
      message:
        'O Google Books está indisponível no momento. Tente novamente mais tarde.',
    }
  }

  return {
    code: 'request' as const,
    message: 'Não foi possível concluir a consulta de livros.',
  }
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

function parseResponse<T>(parser: () => T) {
  try {
    return parser()
  } catch {
    throw new ApiError(
      'O catálogo de livros retornou uma resposta inválida.',
      'invalid-response',
      200,
    )
  }
}

export function createGoogleBooksClient({
  apiKey,
  baseUrl = GOOGLE_BOOKS_BASE_URL,
  fetcher,
}: GoogleBooksClientOptions = {}): BookRepository {
  const normalizedApiKey = apiKey?.trim()
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

  async function request(
    path: string,
    params: URLSearchParams,
    signal?: AbortSignal,
  ) {
    const url = new URL(`${normalizedBaseUrl}${path}`)
    params.forEach((value, key) => url.searchParams.set(key, value))

    if (normalizedApiKey) {
      url.searchParams.set('key', normalizedApiKey)
    }

    let response: Response

    try {
      const requestInit: RequestInit = {
        headers: { Accept: 'application/json' },
      }

      if (signal) {
        requestInit.signal = signal
      }

      response = await (fetcher ?? globalThis.fetch)(url, requestInit)
    } catch (error) {
      if (isAbortError(error)) {
        throw error
      }

      throw new ApiError(
        'Não foi possível se conectar ao catálogo de livros. Verifique sua conexão.',
        'network',
        null,
      )
    }

    if (!response.ok) {
      const details = getErrorDetails(response.status)
      throw new ApiError(details.message, details.code, response.status)
    }

    try {
      return (await response.json()) as unknown
    } catch {
      throw new ApiError(
        'O catálogo de livros retornou uma resposta inválida.',
        'invalid-response',
        response.status,
      )
    }
  }

  return {
    async getById(bookId: string, signal?: AbortSignal): Promise<Book> {
      const normalizedBookId = bookId.trim()

      if (!normalizedBookId) {
        throw new ApiError(
          'Informe um livro válido para consultar os detalhes.',
          'request',
          null,
        )
      }

      const payload = await request(
        `/volumes/${encodeURIComponent(normalizedBookId)}`,
        new URLSearchParams({ projection: 'full' }),
        signal,
      )

      return parseResponse(() => parseGoogleVolume(payload))
    },

    async search(
      params: BookSearchParams,
      signal?: AbortSignal,
    ): Promise<BookSearchResult> {
      const normalizedParams: NormalizedBookSearchParams =
        normalizeBookSearchParams(params)
      const searchParams = new URLSearchParams({
        maxResults: String(normalizedParams.maxResults),
        orderBy: normalizedParams.orderBy,
        printType: normalizedParams.printType,
        projection: normalizedParams.projection ?? 'lite',
        q: normalizedParams.query,
        startIndex: String(normalizedParams.startIndex),
      })
      if (normalizedParams.langRestrict)
        searchParams.set('langRestrict', normalizedParams.langRestrict)
      const payload = await request('/volumes', searchParams, signal)

      return parseResponse(() =>
        parseGoogleBooksSearchResponse(payload, normalizedParams),
      )
    },
  }
}

export const googleBooksClient = createGoogleBooksClient(
  env.googleBooksApiKey ? { apiKey: env.googleBooksApiKey } : {},
)
