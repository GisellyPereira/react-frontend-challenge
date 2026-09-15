import type { Book } from './book'
import type { BookSearchParams } from './book-search'
import type { BookSearchResult } from './book-search-result'

export interface BookRepository {
  getById(bookId: string, signal?: AbortSignal): Promise<Book>
  search(
    params: BookSearchParams,
    signal?: AbortSignal,
  ): Promise<BookSearchResult>
}
