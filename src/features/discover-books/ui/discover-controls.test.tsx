import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DiscoverControls } from './discover-controls'

describe('DiscoverControls', () => {
  it('envia o valor atual da busca sem espaços nas extremidades', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()

    render(
      <DiscoverControls
        search={{
          orderBy: 'relevance',
          printType: 'all',
          q: '  Clarice Lispector  ',
          startIndex: 0,
        }}
        onFiltersChange={vi.fn()}
        onQueryChange={onQueryChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(onQueryChange).toHaveBeenCalledWith('Clarice Lispector')
  })

  it('permite limpar a pesquisa sem alterar os filtros', async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()
    const onQueryChange = vi.fn()

    render(
      <DiscoverControls
        search={{
          orderBy: 'newest',
          printType: 'books',
          q: 'Design',
          startIndex: 0,
        }}
        onFiltersChange={onFiltersChange}
        onQueryChange={onQueryChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Limpar pesquisa' }))

    expect(onQueryChange).toHaveBeenCalledWith('')
    expect(onFiltersChange).not.toHaveBeenCalled()
  })

})
