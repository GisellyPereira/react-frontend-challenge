import type { ReadingStatus, SavedBook } from '@/features/manage-shelf'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { readingLabels } from './reading-labels'

export function ShelfStatus({
  book,
  onChange,
}: {
  book: SavedBook
  onChange: (id: string, status: ReadingStatus) => void
}) {
  return (
    <Select
      value={book.status}
      onValueChange={(value) => {
        if (value === 'want-to-read' || value === 'reading' || value === 'read')
          onChange(book.id, value)
      }}
    >
      <SelectTrigger
        className="shelf-status"
        data-status={book.status}
        aria-label={`Status de ${book.title || 'livro'}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(readingLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
