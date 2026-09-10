import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { DiscoverSearch } from '@/features/discover-books'

import { DiscoverPage } from './index'

vi.mock('@/widgets/book-results', () => ({
  BookResults: () => <div data-testid="book-results" />,
}))

const defaultSearch: DiscoverSearch = {
  orderBy: 'relevance',
  printType: 'all',
  q: '',
  startIndex: 0,
}

describe('DiscoverPage', () => {
  it('troca os assuntos pelos resultados quando existe uma pesquisa', () => {
    render(
      <DiscoverPage
        search={{ ...defaultSearch, q: 'Clarice Lispector' }}
        onFiltersChange={vi.fn()}
        onPageChange={vi.fn()}
        onQueryChange={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('region', { name: 'Assuntos para explorar' }),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('book-results')).toBeInTheDocument()
  })
})
