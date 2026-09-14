import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { DiscoverSearch } from '@/features/discover-books'

import { DiscoverPage } from './index'

vi.mock('@/widgets/book-results', () => ({
  BookResults: () => <div data-testid="book-results" />,
}))
vi.mock('@/widgets/discover-home', () => ({
  DiscoverHome: () => <div data-testid="discover-home-sections" />,
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
        onSearchSubmit={vi.fn()}
        resultsScrollRequest={0}
      />,
    )

    expect(
      screen.queryByRole('region', { name: 'Assuntos para explorar' }),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('book-results')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Só mais um capítulo?' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Escolha por onde começar.'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/Que livro entra/)).not.toBeInTheDocument()
    expect(
      screen.queryByAltText('Sua próxima leitura pode estar aqui.'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('Clarice Lispector')
    expect(
      screen.queryByRole('group', { name: 'Buscas populares' }),
    ).not.toBeInTheDocument()
  })

  it('abre os resultados sem rolagem animada ao confirmar uma pesquisa', () => {
    const scrollIntoView = vi.fn()

    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })

    render(
      <DiscoverPage
        search={{ ...defaultSearch, q: 'Design editorial' }}
        onFiltersChange={vi.fn()}
        onPageChange={vi.fn()}
        onSearchSubmit={vi.fn()}
        resultsScrollRequest={1}
      />,
    )

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'start',
    })
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
  })

  it('mantém a home durante a digitação e confirma a busca por envio ou tema', async () => {
    const user = userEvent.setup()
    const onSearchSubmit = vi.fn()
    render(
      <DiscoverPage
        search={defaultSearch}
        onFiltersChange={vi.fn()}
        onPageChange={vi.fn()}
        onSearchSubmit={onSearchSubmit}
        resultsScrollRequest={0}
      />,
    )
    await user.type(screen.getByRole('searchbox'), 'Machado de Assis')
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Que livro entra na sua estante agora?',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('book-results')).not.toBeInTheDocument()
    expect(onSearchSubmit).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: /^Buscar$/ }))
    expect(onSearchSubmit).toHaveBeenLastCalledWith('Machado de Assis')
    await user.click(
      screen.getByRole('button', { name: 'Pesquisar por Fantasia' }),
    )
    expect(onSearchSubmit).toHaveBeenLastCalledWith('Fantasia')
  })

  it('permite limpar e escrever outra busca sem sair dos resultados', async () => {
    const user = userEvent.setup()
    const onSearchSubmit = vi.fn()
    render(
      <DiscoverPage
        search={{ ...defaultSearch, q: 'Romance' }}
        onFiltersChange={vi.fn()}
        onPageChange={vi.fn()}
        onSearchSubmit={onSearchSubmit}
        resultsScrollRequest={0}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Limpar pesquisa' }))
    expect(screen.getByRole('searchbox')).toHaveValue('')
    expect(screen.getByTestId('book-results')).toBeInTheDocument()
    await user.type(screen.getByRole('searchbox'), 'Clarice{Enter}')
    expect(onSearchSubmit).toHaveBeenCalledWith('Clarice')
  })
})
