import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Book } from '../model/book'
import { BookCard } from './book-card'

const book: Book = {
  authors: ['Ursula K. Le Guin'],
  averageRating: 4.4,
  categories: ['Ficção científica'],
  cover: {
    large: 'https://images.example.com/large.jpg',
    small: 'https://images.example.com/small.jpg',
  },
  description: 'Uma história sobre liberdade e escolhas.',
  id: 'volume-1',
  infoUrl: null,
  language: 'pt-BR',
  pageCount: 304,
  previewUrl: null,
  publishedDate: '1969-03-01',
  publisher: 'Ace Books',
  ratingsCount: 250,
  subtitle: null,
  title: 'A mão esquerda da escuridão',
}

async function renderBookCard(
  selectedBook: Book,
  options: { featured?: boolean; position?: number } = {},
) {
  const rootRoute = createRootRoute({ component: Outlet })
  const cardRoute = createRoute({
    component: () => <BookCard book={selectedBook} {...options} />,
    getParentRoute: () => rootRoute,
    path: '/',
  })
  const detailsRoute = createRoute({
    component: () => null,
    getParentRoute: () => rootRoute,
    path: '/book/$bookId',
  })
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ['/'] }),
    routeTree: rootRoute.addChildren([cardRoute, detailsRoute]),
  })

  await router.load()
  render(<RouterProvider router={router} />)
}

describe('BookCard', () => {
  it('apresenta os metadados e usa um link real para os detalhes', async () => {
    await renderBookCard(book, { featured: true, position: 1 })

    const detailsLink = screen.getByRole('link', {
      name: 'Ver detalhes de A mão esquerda da escuridão',
    })

    expect(detailsLink).toHaveAttribute('href', '/book/volume-1')
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'A mão esquerda da escuridão',
      }),
    ).toBeVisible()
    expect(screen.getByText('Ursula K. Le Guin')).toBeVisible()
    expect(screen.getByText('Ficção científica')).toBeVisible()
    expect(screen.getByText('1969')).toBeVisible()
    expect(screen.getByText('01')).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('oferece fallbacks quando os metadados estão ausentes', async () => {
    await renderBookCard({
      ...book,
      authors: [],
      categories: [],
      cover: { large: null, small: null },
      id: 'volume-incompleto',
      publishedDate: null,
      title: null,
    })

    expect(
      screen.getByRole('link', {
        name: 'Ver detalhes de Título não informado',
      }),
    ).toHaveAttribute('href', '/book/volume-incompleto')
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Título não informado',
      }),
    ).toBeVisible()
    expect(screen.getByText('Autoria não informada')).toBeVisible()
    expect(screen.queryByText('Acervo Libris')).not.toBeInTheDocument()
    expect(screen.getByText('Data não informada')).toBeVisible()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
