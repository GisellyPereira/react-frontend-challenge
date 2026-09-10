import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Book } from '../model/book'
import { BookCoverImage } from './book-cover'

type CoverBook = Pick<Book, 'cover' | 'id' | 'title'>

const book: CoverBook = {
  cover: {
    large: 'https://images.example.com/large.jpg',
    small: 'https://images.example.com/small.jpg',
  },
  id: 'volume-1',
  title: 'A mão esquerda da escuridão',
}

describe('BookCover', () => {
  it('tenta a capa menor antes de apresentar o fallback', () => {
    render(<BookCoverImage book={book} />)

    const largeCover = screen.getByRole('img')
    fireEvent.error(largeCover)

    const smallCover = screen.getByRole('img')
    expect(smallCover).toHaveAttribute(
      'src',
      'https://images.example.com/small.jpg',
    )

    fireEvent.error(smallCover)

    expect(
      screen.getByRole('img', {
        name: 'Capa indisponível para “A mão esquerda da escuridão”',
      }),
    ).toBeVisible()
  })

  it('usa um título seguro no fallback quando o livro não informa um', () => {
    render(
      <BookCoverImage
        book={{
          cover: { large: null, small: null },
          id: 'volume-sem-titulo',
          title: null,
        }}
      />,
    )

    expect(
      screen.getByRole('img', {
        name: 'Capa indisponível para “Título não informado”',
      }),
    ).toBeVisible()
  })
})
