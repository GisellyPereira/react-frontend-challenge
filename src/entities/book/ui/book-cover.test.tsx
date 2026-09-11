import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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
    expect(largeCover).toHaveAttribute(
      'src',
      'https://images.example.com/large.jpg',
    )
    expect(largeCover).not.toHaveAttribute('srcset')
    fireEvent.error(largeCover)

    const smallCover = screen.getByRole('img')
    expect(smallCover).toHaveAttribute(
      'src',
      'https://images.example.com/small.jpg',
    )
    expect(smallCover).not.toHaveAttribute('srcset')

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
  it('mantém o skeleton até terminar de decodificar a imagem', async () => {
    render(<BookCoverImage book={book} />)
    const image = screen.getByRole('img')
    let finish!: () => void
    const decode = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    Object.defineProperty(image, 'decode', { value: decode })
    expect(image.parentElement).toHaveAttribute('aria-busy', 'true')
    fireEvent.load(image)
    expect(decode).toHaveBeenCalledOnce()
    expect(image.parentElement).toHaveAttribute('aria-busy', 'true')
    await act(async () => {
      finish()
      await Promise.resolve()
    })
    expect(image.parentElement).toHaveAttribute('aria-busy', 'false')
    expect(
      image.parentElement?.querySelector('.book-cover__skeleton'),
    ).toBeNull()
  })
  it('aguarda a alternativa quando a imagem principal falha', async () => {
    render(<BookCoverImage book={book} />)
    fireEvent.error(screen.getByRole('img'))
    const alternative = screen.getByRole('img')
    expect(alternative.parentElement).toHaveAttribute('aria-busy', 'true')
    await act(async () => {
      fireEvent.load(alternative)
      await Promise.resolve()
    })
    expect(alternative.parentElement).toHaveAttribute('aria-busy', 'false')
  })
  it('ignora a decodificação antiga após trocar de livro', async () => {
    const { rerender } = render(<BookCoverImage book={book} />)
    let finish!: () => void
    Object.defineProperty(screen.getByRole('img'), 'decode', {
      value: () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    })
    fireEvent.load(screen.getByRole('img'))
    rerender(<BookCoverImage book={{ ...book, id: 'outro' }} />)
    await act(async () => {
      finish()
      await Promise.resolve()
    })
    expect(screen.getByRole('img').parentElement).toHaveAttribute(
      'aria-busy',
      'true',
    )
  })
})
