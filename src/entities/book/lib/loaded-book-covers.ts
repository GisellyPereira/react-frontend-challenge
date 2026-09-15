export const loadedBookCovers = new Map<string, string>()

export function rememberBookCover(bookId: string, source: string) {
  loadedBookCovers.delete(bookId)
  loadedBookCovers.set(bookId, source)
  if (loadedBookCovers.size > 200) {
    const oldest = loadedBookCovers.keys().next().value
    if (oldest !== undefined) loadedBookCovers.delete(oldest)
  }
}
