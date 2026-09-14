export function shelfCapacity(width: number, rem = 16): number {
  const coverWidth = Math.min(14 * rem, width * 0.46)
  // Reserve edge padding plus the largest spine and its gap.
  return Math.max(
    1,
    Math.min(12, 1 + Math.floor((width - coverWidth - 2 * rem) / (3.6 * rem))),
  )
}

export function distributeBooks<T>(books: readonly T[], capacity = 12): T[][] {
  const rowCount = Math.ceil(books.length / Math.max(1, Math.floor(capacity)))
  if (rowCount === 0) return []
  const baseSize = Math.floor(books.length / rowCount)
  const extra = books.length % rowCount
  let offset = 0
  return Array.from({ length: rowCount }, (_, index) => {
    const size = baseSize + (index < extra ? 1 : 0)
    const row = books.slice(offset, offset + size)
    offset += size
    return row
  })
}
