import type { ReactNode } from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { SavedBook } from '@/features/manage-shelf'
import { PersonalClosingContent } from './personal-closing'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
    ...props
  }: {
    children: ReactNode
    to: string
    params?: { bookId: string }
  }) => (
    <a href={params ? `/book/${params.bookId}` : to} {...props}>
      {children}
    </a>
  ),
}))
vi.mock('@/entities/book', () => ({ BookCoverImage: () => null }))

function book(id: string, status: SavedBook['status']): SavedBook {
  return {
    id,
    title: id,
    status,
    authors: ['Autoria'],
    cover: { large: null, small: null },
    publishedDate: null,
    pageCount: null,
    categories: [],
  }
}

describe('PersonalClosingContent', () => {
  it('apresenta uma chamada para começar quando a coleção está vazia', () => {
    render(<PersonalClosingContent books={[]} />)
    expect(screen.getByText('Tem lugar para suas histórias')).toBeVisible()
    expect(screen.queryByLabelText('Suas leituras')).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Abrir minha estante' }),
    ).toHaveAttribute('href', '/shelf')
  })
  it('mostra as contagens completas, exibindo até três livros de quero ler', () => {
    render(
      <PersonalClosingContent
        books={[
          book('A', 'want-to-read'),
          book('B', 'want-to-read'),
          book('C', 'want-to-read'),
          book('D', 'want-to-read'),
          book('E', 'reading'),
          book('F', 'read'),
        ]}
      />,
    )
    expect(screen.getByText('6 livros')).toBeVisible()
    const stats = within(screen.getByLabelText('Suas leituras'))
    expect(stats.getByText('Quero ler').parentElement).toHaveTextContent('4')
    expect(stats.getByText('Lendo').parentElement).toHaveTextContent('1')
    expect(stats.getByText('Concluídos').parentElement).toHaveTextContent('1')
    expect(
      screen.getAllByRole('link', { name: /Ver detalhes de/ }),
    ).toHaveLength(3)
    expect(
      screen.queryByRole('link', { name: 'Ver detalhes de D' }),
    ).not.toBeInTheDocument()
  })
  it('destaca leituras em andamento se não houver livros em quero ler', () => {
    render(
      <PersonalClosingContent
        books={[book('Finalizado', 'read'), book('Em andamento', 'reading')]}
      />,
    )
    expect(screen.getByText('Seus capítulos em andamento')).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Ver detalhes de Em andamento' }),
    ).toHaveAttribute('href', '/book/Em andamento')
    expect(
      screen.queryByRole('link', { name: 'Ver detalhes de Finalizado' }),
    ).not.toBeInTheDocument()
  })
  it('mantém a coleção visível quando todos os livros já foram concluídos', () => {
    render(<PersonalClosingContent books={[book('Favorito', 'read')]} />)
    expect(screen.getByText('Histórias da sua coleção')).toBeVisible()
    expect(screen.getByText('1 livro')).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Ver detalhes de Favorito' }),
    ).toBeVisible()
  })
})
