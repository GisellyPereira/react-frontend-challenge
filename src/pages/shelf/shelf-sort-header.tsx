import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { ShelfSort, ShelfSortField } from './sort-books'

const sortLabels = {
  title: {
    label: 'Título',
    asc: 'Ordenar por título: A a Z',
    desc: 'Ordenar por título: Z a A',
  },
  status: {
    label: 'Status',
    asc: 'Ordenar por status: Quero ler, Lendo, Lido',
    desc: 'Ordenar por status: Lido, Lendo, Quero ler',
  },
}

export function ShelfSortHeader({
  field,
  sort,
  onSort,
}: {
  field: ShelfSortField
  sort: ShelfSort | null
  onSort: (sort: ShelfSort) => void
}) {
  const direction = sort?.field === field ? sort.direction : null
  const nextDirection = direction === 'asc' ? 'desc' : 'asc'
  const Icon =
    direction === 'asc'
      ? ArrowUp
      : direction === 'desc'
        ? ArrowDown
        : ArrowUpDown
  const actionLabel = sortLabels[field][nextDirection]

  return (
    <th
      scope="col"
      className="personal-shelf__sort-heading"
      aria-sort={
        direction === 'asc'
          ? 'ascending'
          : direction === 'desc'
            ? 'descending'
            : undefined
      }
    >
      <Button
        type="button"
        variant="ghost"
        className="personal-shelf__sort-button"
        aria-label={actionLabel}
        title={actionLabel}
        onClick={() => onSort({ field, direction: nextDirection })}
      >
        {sortLabels[field].label}
        <Icon aria-hidden="true" size={16} />
      </Button>
    </th>
  )
}
