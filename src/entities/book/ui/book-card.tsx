import { Link } from '@tanstack/react-router'

import { cn } from '@/shared/lib/cn'

import type { Book } from '../model/book'
import { BookCoverImage } from './book-cover'
import './book-card.css'

interface BookCardProps {
  readonly book: Book
  readonly className?: string
  readonly position?: number
  readonly variant?: 'default' | 'compact'
}

function getPublishedLabel(publishedDate: string | null) {
  const normalizedDate = publishedDate?.trim()

  if (!normalizedDate) {
    return 'Data não informada'
  }

  return normalizedDate.match(/^\d{4}/)?.[0] ?? normalizedDate
}

export function BookCard({
  book,
  className,
  position,
  variant = 'default',
}: BookCardProps) {
  const title = book.title?.trim() || 'Título não informado'
  const authors = book.authors.length
    ? book.authors.join(', ')
    : 'Autoria não informada'
  const category = book.categories[0]?.trim()

  return (
    <article
      className={cn(
        'book-card',
        variant === 'compact' && 'book-card--compact',
        className,
      )}
    >
      <Link
        aria-label={`Ver detalhes de ${title}`}
        className="book-card__link"
        params={{ bookId: book.id }}
        to="/book/$bookId"
      >
        <div className="book-card__visual">
          <BookCoverImage
            book={book}
            className="book-card__cover"
            decorative
            sizes={
              variant === 'compact'
                ? '(min-width: 1280px) 216px, (min-width: 700px) 17vw, 44vw'
                : '(max-width: 639px) 44vw, (max-width: 1023px) 30vw, (max-width: 1439px) 22vw, 16vw'
            }
          />
          {position && variant === 'default' ? (
            <span aria-hidden="true" className="book-card__position">
              {String(position).padStart(2, '0')}
            </span>
          ) : null}
        </div>

        <div className="book-card__content">
          {category && variant === 'default' ? (
            <p className="book-card__category">{category}</p>
          ) : null}
          <h2 className="book-card__title">{title}</h2>
          {variant === 'default' ? (
            <div className="book-card__meta">
              <p className="book-card__authors">{authors}</p>
              <span aria-hidden="true" className="book-card__separator" />
              <span className="book-card__date">
                <span className="sr-only">Publicação: </span>
                {getPublishedLabel(book.publishedDate)}
              </span>
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  )
}
