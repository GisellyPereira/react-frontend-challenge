import type { Book } from '@/entities/book'

export function uniqueBooks(books: readonly Book[]) {
  return [...new Map(books.map((book) => [book.id, book])).values()]
}

export function selectRatedBooks(books: readonly Book[]) {
  return uniqueBooks(books)
    .filter(
      (book) =>
        book.averageRating !== null &&
        book.averageRating >= 4 &&
        (book.ratingsCount ?? 0) >= 5,
    )
    .sort(
      (a, b) =>
        (b.averageRating ?? 0) - (a.averageRating ?? 0) ||
        (b.ratingsCount ?? 0) - (a.ratingsCount ?? 0),
    )
    .slice(0, 5)
}
