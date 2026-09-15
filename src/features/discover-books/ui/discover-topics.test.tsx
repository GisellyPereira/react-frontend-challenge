import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DiscoverTopics } from './discover-topics'

describe('paginação dos temas', () => {
  it('mantém os assuntos iniciais e a busca pelo tema escolhido', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()
    render(<DiscoverTopics onQueryChange={onQueryChange} />)
    expect(screen.getByText('Literatura brasileira')).toBeInTheDocument()
    expect(screen.getByText('Ficção científica')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', {
        name: 'Pesquisar por Literatura brasileira',
      }),
    )
    expect(onQueryChange).toHaveBeenCalledOnce()
    expect(onQueryChange).toHaveBeenCalledWith('Literatura brasileira')
  })
  it('mostra doze temas e navega para o próximo conjunto sem perder a busca', async () => {
    const user = userEvent.setup()
    const search = vi.fn()
    render(<DiscoverTopics onQueryChange={search} />)
    expect(
      screen.getAllByRole('button', { name: /Pesquisar por/ }),
    ).toHaveLength(12)
    expect(
      screen.getByRole('button', { name: 'Temas anteriores' }),
    ).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Próximos temas' }))
    expect(
      screen.queryByRole('button', { name: 'Pesquisar por Romance' }),
    ).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Pesquisar por Viagens' }),
    )
    expect(search).toHaveBeenCalledWith('Viagens')
    expect(
      screen.getByRole('button', { name: 'Próximos temas' }),
    ).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Temas anteriores' }))
    expect(
      screen.getByRole('button', { name: 'Pesquisar por Romance' }),
    ).toBeVisible()
  })
})
