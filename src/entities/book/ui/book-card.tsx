import { Link } from '@tanstack/react-router'

import { cn } from '@/shared/lib/cn'

import type { Book } from '../model/book'
import { BookCoverImage } from './book-cover'
import './book-card.css'

interface BookCardProps {
  readonly book: Book
  readonly className?: string
  readonly featured?: boolean
  readonly position?: number
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
  featured = false,
  position,
}: BookCardProps) {
  const title = book.title?.trim() || 'Título não informado'
  const authors = book.authors.length
    ? book.authors.join(', ')
    : 'Autoria não informada'
  const category = book.categories[0]?.trim()

  return (
    <article
      className={cn('book-card', featured && 'book-card--featured', className)}
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
            preferredSize={featured ? 'large' : 'small'}
            sizes={
              featured
                ? '(max-width: 639px) 58vw, (max-width: 1023px) 34vw, 18rem'
                : '(max-width: 639px) 44vw, (max-width: 1023px) 30vw, 18vw'
            }
          />
          {position ? (
            <span aria-hidden="true" className="book-card__position">
              {String(position).padStart(2, '0')}
            </span>
          ) : null}
        </div>

        <div className="book-card__content">
          {category ? <p className="book-card__category">{category}</p> : null}
          <h2 className="book-card__title">{title}</h2>
          <div className="book-card__meta">
            <p className="book-card__authors">{authors}</p>
            <span aria-hidden="true" className="book-card__separator" />
            <span className="book-card__date">
              <span className="sr-only">Publicação: </span>
              {getPublishedLabel(book.publishedDate)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
