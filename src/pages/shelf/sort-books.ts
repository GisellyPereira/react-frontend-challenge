import type { ReadingStatus, SavedBook } from '@/features/manage-shelf'

export type ShelfSortField = 'title' | 'status'
export type ShelfSort = {
  field: ShelfSortField
  direction: 'asc' | 'desc'
}

const titleCollator = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  numeric: true,
})
const statusOrder: Record<ReadingStatus, number> = {
  'want-to-read': 0,
  reading: 1,
  read: 2,
}

function compareTitles(a: SavedBook, b: SavedBook, direction: number) {
  const aTitle = a.title?.trim() ?? ''
  const bTitle = b.title?.trim() ?? ''
  if (!aTitle || !bTitle) return Number(!aTitle) - Number(!bTitle)
  return titleCollator.compare(aTitle, bTitle) * direction
}

export function sortBooks(books: readonly SavedBook[], sort: ShelfSort | null) {
  const sorted = [...books]
  if (!sort) return sorted

  const direction = sort.direction === 'asc' ? 1 : -1
  return sorted.sort((a, b) => {
    if (sort.field === 'title') return compareTitles(a, b, direction)
    return (
      (statusOrder[a.status] - statusOrder[b.status]) * direction ||
      compareTitles(a, b, 1)
    )
  })
}
