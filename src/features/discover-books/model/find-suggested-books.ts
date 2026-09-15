import {
  bookSearchParamsSchema,
  type Book,
  type BookRepository,
} from '@/entities/book'

export async function findSuggestedBooks(
  book: Pick<Book, 'id' | 'categories' | 'authors'>,
  search: BookRepository['search'],
  signal?: AbortSignal,
) {
  const clean = (value: string) => value.replace(/["\\]/g, ' ').trim()
  const focused = [
    ...book.categories.slice(0, 2).map((value) => `subject:"${clean(value)}"`),
    ...book.authors.slice(0, 1).map((value) => `inauthor:"${clean(value)}"`),
  ]
  const queries = [
    ...new Set([
      ...focused,
      'subject:fiction',
      'subject:history',
      'subject:science',
    ]),
  ]
  const books = new Map<string, Book>()
  let broadened = false
  for (const query of queries) {
    signal?.throwIfAborted()
    let result
    try {
      result = await search(
        bookSearchParamsSchema.parse({ query, maxResults: 12 }),
        signal,
      )
    } catch (error) {
      if (signal?.aborted || books.size === 0) throw error
      break
    }
    for (const item of result.books) {
      if (item.id === book.id || books.has(item.id)) continue
      books.set(item.id, item)
      if (!focused.includes(query)) broadened = true
      if (books.size === 5) return { books: [...books.values()], broadened }
    }
  }
  return { books: [...books.values()], broadened }
}
