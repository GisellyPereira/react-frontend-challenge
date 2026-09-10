import type { Book } from '../model/book'
import type { BookSearchResult } from '../model/book-search-result'
import {
  googleBooksSearchResponseSchema,
  googleBookVolumeSchema,
  type GoogleBookVolume,
} from './google-books-schema'

function normalizeText(value: string | undefined) {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : null
}

function normalizeUrl(value: string | undefined) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return null
  }

  try {
    const url = new URL(normalizedValue)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }

    if (url.protocol === 'http:') {
      url.protocol = 'https:'
    }

    return url.toString()
  } catch {
    return null
  }
}

function firstValidUrl(...values: (string | undefined)[]) {
  for (const value of values) {
    const normalizedUrl = normalizeUrl(value)

    if (normalizedUrl) {
      return normalizedUrl
    }
  }

  return null
}

function normalizeDescription(value: string | undefined) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return null
  }

  const parsedDescription = new DOMParser().parseFromString(
    normalizedValue,
    'text/html',
  )

  parsedDescription
    .querySelectorAll('script, style, template, noscript')
    .forEach((element) => element.remove())
  parsedDescription.querySelectorAll('br').forEach((element) => {
    element.replaceWith(parsedDescription.createTextNode('\n'))
  })
  parsedDescription
    .querySelectorAll('p, div, li, blockquote')
    .forEach((element) => {
      element.append(parsedDescription.createTextNode('\n\n'))
    })

  return (
    parsedDescription.body.textContent
      ?.replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() || null
  )
}

function normalizeList(values: unknown[] | undefined) {
  return [
    ...new Set(
      (values ?? [])
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  ]
}

export function mapGoogleVolume(volume: GoogleBookVolume): Book {
  const volumeInfo = volume.volumeInfo
  const imageLinks = volumeInfo?.imageLinks

  return {
    authors: normalizeList(volumeInfo?.authors),
    averageRating: volumeInfo?.averageRating ?? null,
    categories: normalizeList(volumeInfo?.categories),
    cover: {
      large: firstValidUrl(
        imageLinks?.extraLarge,
        imageLinks?.large,
        imageLinks?.medium,
        imageLinks?.small,
        imageLinks?.thumbnail,
        imageLinks?.smallThumbnail,
      ),
      small: firstValidUrl(
        imageLinks?.thumbnail,
        imageLinks?.small,
        imageLinks?.smallThumbnail,
      ),
    },
    description: normalizeDescription(volumeInfo?.description),
    id: volume.id,
    infoUrl: normalizeUrl(volumeInfo?.infoLink),
    language: normalizeText(volumeInfo?.language),
    pageCount: volumeInfo?.pageCount ?? null,
    previewUrl: firstValidUrl(
      volumeInfo?.previewLink,
      volume.accessInfo?.webReaderLink,
    ),
    publishedDate: normalizeText(volumeInfo?.publishedDate),
    publisher: normalizeText(volumeInfo?.publisher),
    ratingsCount: volumeInfo?.ratingsCount ?? null,
    subtitle: normalizeText(volumeInfo?.subtitle),
    title: normalizeText(volumeInfo?.title),
  }
}

export function parseGoogleVolume(payload: unknown): Book {
  return mapGoogleVolume(googleBookVolumeSchema.parse(payload))
}

export function parseGoogleBooksSearchResponse(
  payload: unknown,
  pagination: { maxResults: number; startIndex: number },
): BookSearchResult {
  const response = googleBooksSearchResponseSchema.parse(payload)
  const receivedItems = response.items.length
  const books = response.items.flatMap((item) => {
    const parsedItem = googleBookVolumeSchema.safeParse(item)

    return parsedItem.success ? [mapGoogleVolume(parsedItem.data)] : []
  })
  const candidateNextIndex = pagination.startIndex + receivedItems

  return {
    books,
    nextStartIndex:
      receivedItems === pagination.maxResults &&
      candidateNextIndex < response.totalItems
        ? candidateNextIndex
        : null,
    pageSize: pagination.maxResults,
    receivedItems,
    startIndex: pagination.startIndex,
    totalItems: response.totalItems,
  }
}
