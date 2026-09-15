import { useState, type CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { BookCoverImage } from '@/entities/book'
import type { SavedBook, ReadingStatus } from '@/features/manage-shelf'
import { ShelfStatus } from './shelf-status'
import { readingLabels } from './reading-labels'
import { Button } from '@/shared/ui/button'
import { ArrowUpRight, BookOpen, CalendarDays, Trash2 } from 'lucide-react'

const colors = ['teal', 'coral', 'blue', 'olive', 'wine', 'gold']

export function ShelfRow({
  books,
  number,
  startIndex,
  onRemove,
  onStatusChange,
  carouselActive = true,
}: {
  books: SavedBook[]
  number: number
  startIndex: number
  onRemove: (id: string) => void
  onStatusChange: (id: string, status: ReadingStatus) => void
  carouselActive?: boolean
}) {
  const [active, setActive] = useState<string | null>(books[0]?.id ?? null)
  const selected =
    active === null
      ? undefined
      : (books.find((book) => book.id === active) ?? books[0])
  return (
    <section
      className="shelf-row"
      data-carousel-active={carouselActive || undefined}
      aria-label={`Prateleira ${number}`}
    >
      <div className="shelf-row__scroll">
        <div className="shelf-row__books">
          {books.map((book, index) => {
            const title = book.title || 'Título não informado'
            const expanded = selected?.id === book.id
            return (
              <Link
                key={book.id}
                to="/book/$bookId"
                params={{ bookId: book.id }}
                className="shelf-volume"
                data-expanded={expanded || undefined}
                aria-label={`Ver detalhes de ${title}`}
                style={
                  {
                    '--spine-color': `var(--book-${colors[index % colors.length]})`,
                    '--book-height': `${17 + (index % 3) * 0.8}rem`,
                    '--spine-width': `${2.7 + (index % 3) * 0.25}rem`,
                  } as CSSProperties
                }
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') setActive(book.id)
                }}
                onFocus={(event) => {
                  if (event.currentTarget.matches(':focus-visible'))
                    setActive(book.id)
                }}
                onClick={(event) => {
                  if (!expanded) {
                    event.preventDefault()
                    setActive(book.id)
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setActive(null)
                  }
                }}
              >
                <span className="shelf-volume__spine" aria-hidden="true">
                  <span className="shelf-volume__publisher">LIBRIS</span>
                  <span className="shelf-volume__title">{title}</span>
                  <span className="shelf-volume__number">
                    <span
                      className="shelf-volume__status-dot"
                      data-status={book.status}
                      title={readingLabels[book.status]}
                    />
                    {String(startIndex + index + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="shelf-volume__front" aria-hidden="true">
                  <BookCoverImage
                    book={book}
                    decorative
                    loading={expanded ? 'eager' : 'lazy'}
                    sizes="200px"
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="shelf-row__caption">
        {selected && (
          <div className="shelf-row__selection">
            <div className="shelf-row__info">
              <span className="shelf-row__eyebrow">Na sua seleção</span>
              <h2>{selected.title || 'Título não informado'}</h2>
              <p className="shelf-row__author">
                {selected.authors.join(', ') || 'Autoria não informada'}
              </p>
              <div className="shelf-row__facts">
                <span>
                  <CalendarDays size={14} aria-hidden="true" />
                  {selected.publishedDate?.slice(0, 4) || 'Ano não informado'}
                </span>
                {selected.pageCount !== null && selected.pageCount > 0 && (
                  <span>
                    <BookOpen size={14} aria-hidden="true" />
                    {selected.pageCount} páginas
                  </span>
                )}
              </div>
            </div>
            <div className="shelf-row__management">
              <div className="shelf-row__reading">
                <span className="shelf-row__eyebrow">Sua leitura</span>
                <ShelfStatus book={selected} onChange={onStatusChange} />
              </div>
              <div className="shelf-row__buttons">
                <Button className="shelf-row__details" asChild>
                  <Link to="/book/$bookId" params={{ bookId: selected.id }}>
                    Ver detalhes <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onRemove(selected.id)
                    setActive(null)
                  }}
                  aria-label={`Remover ${selected.title || 'livro'} da estante`}
                >
                  <Trash2 size={17} aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
