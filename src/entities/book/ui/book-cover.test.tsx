import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Book } from '../model/book'
import { BookCoverImage } from './book-cover'
import { loadedBookCovers } from '../lib/loaded-book-covers'

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
  beforeEach(() => loadedBookCovers.clear())
  it('tenta a alternativa para uma faixa e usa a capa padrão se ambas forem recortes extremos', async () => {
    render(<BookCoverImage book={book} />)
    for (const [width, height] of [
      [800, 100],
      [20, 200],
    ]) {
      const image = screen.getByRole('img')
      Object.defineProperties(image, {
        naturalWidth: { value: width },
        naturalHeight: { value: height },
      })
      await act(async () => {
        fireEvent.load(image)
        await Promise.resolve()
      })
    }
    expect(screen.getByRole('img', { name: /Capa indisponível/ })).toBeVisible()
  })
  it.each([
    [200, 300],
    [300, 300],
    [450, 300],
  ])('preserva uma capa válida de %i por %i', async (width, height) => {
    render(<BookCoverImage book={book} />)
    const image = screen.getByRole('img')
    Object.defineProperties(image, {
      naturalWidth: { value: width },
      naturalHeight: { value: height },
    })
    await act(async () => {
      fireEvent.load(image)
      await Promise.resolve()
    })
    expect(image.parentElement).toHaveAttribute('aria-busy', 'false')
    expect(image).toHaveAttribute('src', book.cover.large)
  })
  it('não rejeita uma capa do Google somente por medir 575 por 750', async () => {
    render(
      <BookCoverImage
        book={{
          ...book,
          cover: {
            large: 'https://books.google.com/books/content?id=test&zoom=3',
            small: 'https://books.google.com/books/content?id=test&zoom=1',
          },
        }}
      />,
    )
    const large = screen.getByRole('img')
    Object.defineProperties(large, {
      naturalWidth: { value: 575 },
      naturalHeight: { value: 750 },
    })
    await act(async () => {
      fireEvent.load(large)
      await Promise.resolve()
    })
    expect(large.parentElement).toHaveAttribute('aria-busy', 'false')
    expect(large).toHaveAttribute('src', expect.stringContaining('zoom=3'))
  })
  it('preserva nos detalhes a capa carregada na listagem mesmo sem imageLinks', async () => {
    const catalog = render(<BookCoverImage book={book} />)
    await act(async () => {
      fireEvent.load(screen.getByRole('img'))
      await Promise.resolve()
    })
    catalog.unmount()
    render(
      <BookCoverImage
        book={{ ...book, cover: { large: null, small: null } }}
      />,
    )
    expect(screen.getByRole('img')).toHaveAttribute('src', book.cover.large)
  })
  it('tenta as novas alternativas se a capa lembrada falhar', async () => {
    const catalog = render(<BookCoverImage book={book} />)
    await act(async () => {
      fireEvent.load(screen.getByRole('img'))
      await Promise.resolve()
    })
    catalog.unmount()
    render(
      <BookCoverImage
        book={{
          ...book,
          cover: {
            large: 'https://images.example.com/details.jpg',
            small: null,
          },
        }}
      />,
    )
    expect(screen.getByRole('img')).toHaveAttribute('src', book.cover.large)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://images.example.com/details.jpg',
    )
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByRole('img', { name: /Capa indisponível/ })).toBeVisible()
  })
  it('não rejeita uma miniatura real somente por medir 128 por 170', async () => {
    render(
      <BookCoverImage
        book={{
          ...book,
          cover: {
            large: null,
            small: 'https://books.google.com/books/content?id=test&zoom=1',
          },
        }}
      />,
    )
    const image = screen.getByRole('img')
    Object.defineProperties(image, {
      naturalWidth: { value: 128 },
      naturalHeight: { value: 170 },
    })
    await act(async () => {
      fireEvent.load(image)
      await Promise.resolve()
    })
    expect(image.parentElement).toHaveAttribute('aria-busy', 'false')
    expect(
      screen.queryByRole('img', { name: /Capa indisponível/ }),
    ).not.toBeInTheDocument()
  })
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
