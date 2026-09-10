import { useMemo, useState } from 'react'

import { cn } from '@/shared/lib/cn'

import type { Book } from '../model/book'
import './book-cover.css'

type CoverBook = Pick<Book, 'cover' | 'id' | 'title'>

interface BookCoverProps {
  readonly book: CoverBook
  readonly className?: string
  readonly decorative?: boolean
  readonly loading?: 'eager' | 'lazy'
  readonly preferredSize?: 'large' | 'small'
  readonly sizes?: string
}

function getDisplayTitle(title: string | null) {
  return title?.trim() || 'Título não informado'
}

function getCoverVariant(seed: string) {
  let hash = 0

  for (const character of seed) {
    hash = Math.imul(hash, 31) + (character.codePointAt(0) ?? 0)
  }

  return (hash >>> 0) % 6
}

function getMonogram(title: string) {
  return title.match(/[\p{L}\p{N}]/u)?.[0]?.toLocaleUpperCase('pt-BR') ?? 'L'
}

export function BookCoverImage({
  book,
  className,
  decorative = false,
  loading = 'lazy',
  preferredSize = 'large',
  sizes,
}: BookCoverProps) {
  const sources = useMemo(
    () =>
      [
        ...new Set(
          preferredSize === 'small'
            ? [book.cover.small, book.cover.large]
            : [book.cover.large, book.cover.small],
        ),
      ].filter(
        (source): source is string => Boolean(source),
      ),
    [book.cover.large, book.cover.small, preferredSize],
  )
  const displayTitle = getDisplayTitle(book.title)
  const sourceSignature = `${book.id}:${sources.join('|')}`
  const [failure, setFailure] = useState({ count: 0, sourceSignature })
  const failedSources =
    failure.sourceSignature === sourceSignature ? failure.count : 0
  const imageSource = sources[failedSources] ?? null
  const variant = getCoverVariant(`${book.id}:${displayTitle}`)

  if (imageSource) {
    return (
      <div className={cn('book-cover', className)}>
        <img
          alt={decorative ? '' : `Capa de “${displayTitle}”`}
          className="book-cover__image"
          decoding="async"
          loading={loading}
          onError={() =>
            setFailure((current) => ({
              count:
                current.sourceSignature === sourceSignature
                  ? current.count + 1
                  : 1,
              sourceSignature,
            }))
          }
          sizes={sizes}
          src={imageSource}
        />
      </div>
    )
  }

  return (
    <div
      aria-hidden={decorative || undefined}
      aria-label={
        decorative ? undefined : `Capa indisponível para “${displayTitle}”`
      }
      className={cn('book-cover book-cover--fallback', className)}
      data-cover-variant={variant}
      role={decorative ? undefined : 'img'}
    >
      <span aria-hidden="true" className="book-cover__collection">
        Libris
      </span>
      <span aria-hidden="true" className="book-cover__monogram">
        {getMonogram(displayTitle)}
      </span>
      <span aria-hidden="true" className="book-cover__fallback-title">
        {displayTitle}
      </span>
      <span aria-hidden="true" className="book-cover__edition" />
    </div>
  )
}
