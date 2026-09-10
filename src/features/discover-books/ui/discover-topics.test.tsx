import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DiscoverTopics } from './discover-topics'

describe('DiscoverTopics', () => {
  it('apresenta todos os assuntos e inicia a busca pelo tema escolhido', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()

    render(<DiscoverTopics onQueryChange={onQueryChange} />)

    const suggestions = screen.getAllByRole('button', {
      name: /Pesquisar por/i,
    })

    expect(suggestions).toHaveLength(24)
    expect(screen.getByText('Literatura brasileira')).toBeInTheDocument()
    expect(screen.getByText('Ficção científica')).toBeInTheDocument()
    expect(screen.getByText('Viagens')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Pesquisar por Literatura brasileira',
      }),
    )

    expect(onQueryChange).toHaveBeenCalledOnce()
    expect(onQueryChange).toHaveBeenCalledWith('Literatura brasileira')
  })
})
