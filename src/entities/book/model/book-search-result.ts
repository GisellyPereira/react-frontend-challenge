import type { Book } from './book'

export interface BookSearchResult {
  readonly books: readonly Book[]
  readonly nextStartIndex: number | null
  readonly pageSize: number
  readonly receivedItems: number
  readonly startIndex: number
  readonly totalItems: number
}
