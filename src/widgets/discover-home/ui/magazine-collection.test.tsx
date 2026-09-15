import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Book } from '@/entities/book'
import { MagazineCollection } from './magazine-collection'

const collection = vi.hoisted(() => ({
  isPending: false,
  isError: false,
  data: { books: [] as Book[] },
  refetch: vi.fn(),
}))

vi.mock('../model/use-home-collection', () => ({
  useHomeCollection: () => ({ ref: null, result: collection }),
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    search,
    params,
    ...props
  }: {
    children: ReactNode
    to: string
    search?: Record<string, string | number>
    params?: { bookId: string }
  }) => (
    <a
      href={
        params
          ? `/book/${params.bookId}`
          : `${to}?${new URLSearchParams(Object.entries(search ?? {}).map(([key, value]) => [key, String(value)]))}`
      }
      {...props}
    >
      {children}
    </a>
  ),
}))
vi.mock('@/entities/book', () => ({ BookCoverImage: () => null }))

const issue = {
  id: 'edition-1989',
  title: 'Popular Science',
  publishedDate: '1989-07',
} as Book

describe('MagazineCollection', () => {
  beforeEach(() => {
    collection.isPending = false
    collection.isError = false
    collection.data = { books: [issue] }
    collection.refetch.mockClear()
  })

  it('abre a busca com o assunto da seleção e filtro de revistas na primeira página', () => {
    render(<MagazineCollection />)
    const link = screen.getByRole('link', { name: 'Explorar revistas' })
    const url = new URL(link.getAttribute('href')!, 'https://libris.test')
    expect(url.pathname).toBe('/discover')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: 'science',
      printType: 'magazines',
      orderBy: 'relevance',
      startIndex: '0',
    })
    expect(
      screen.getByRole('link', {
        name: 'Ver edição de Popular Science, jul. de 1989',
      }),
    ).toHaveAttribute('href', '/book/edition-1989')
  })

  it('mantém o estado de carregamento até a consulta terminar', () => {
    collection.isPending = true
    const { rerender } = render(<MagazineCollection />)
    expect(
      screen.getByRole('status', { name: 'Carregando revistas' }),
    ).toBeVisible()
    expect(screen.queryByText('Popular Science')).not.toBeInTheDocument()
    collection.isPending = false
    rerender(<MagazineCollection />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('Popular Science')).toBeVisible()
  })

  it('permite repetir a consulta quando ela falha', () => {
    collection.isError = true
    render(<MagazineCollection />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não conseguimos abrir a banca agora.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(collection.refetch).toHaveBeenCalledOnce()
  })

  it('mantém a busca disponível quando não há edições', () => {
    collection.data.books = []
    render(<MagazineCollection />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhuma edição por aqui ainda.',
    )
    expect(
      screen.getByRole('link', { name: 'Explorar revistas' }),
    ).toBeVisible()
  })
})
