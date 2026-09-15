import { useEffect, useMemo, useRef, useState } from 'react'

import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/cn'

import type { Book } from '../model/book'
import { loadedBookCovers, rememberBookCover } from '../lib/loaded-book-covers'
import './book-cover.css'

type CoverBook = Pick<Book, 'cover' | 'id' | 'title'>

interface BookCoverProps {
  readonly book: CoverBook
  readonly appearance?: 'book' | 'flat'
  readonly className?: string
  readonly decorative?: boolean
  readonly loading?: 'eager' | 'lazy'
  readonly sizes?: string
}

interface CoverFailureState {
  failedSources: readonly string[]
  sourceSignature: string
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

function CoverArtwork({
  bookId,
  src,
  alt,
  className,
  loading,
  sizes,
  onFailure,
}: {
  bookId: string
  src: string
  alt: string
  className?: string | undefined
  loading: 'eager' | 'lazy'
  sizes?: string | undefined
  onFailure: () => void
}) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const image = imageRef.current
    if (!image) return
    let cancelled = false
    const fail = () => {
      if (!cancelled) {
        if (loadedBookCovers.get(bookId) === src)
          loadedBookCovers.delete(bookId)
        onFailure()
      }
    }
    const reveal = async () => {
      try {
        if (typeof image.decode === 'function') await image.decode()
        if (cancelled) return
        const ratio = image.naturalWidth / image.naturalHeight
        if (
          Number.isFinite(ratio) &&
          ratio > 0 &&
          (ratio > 2 || ratio < 0.25)
        ) {
          fail()
          return
        }
        rememberBookCover(bookId, src)
        setReady(true)
      } catch {
        fail()
      }
    }
    const onLoad = () => {
      void reveal()
    }
    image.addEventListener('load', onLoad)
    image.addEventListener('error', fail)
    if (image.complete) {
      if (image.naturalWidth > 0) void reveal()
      else fail()
    }
    return () => {
      cancelled = true
      image.removeEventListener('load', onLoad)
      image.removeEventListener('error', fail)
    }
  }, [bookId, src, onFailure])
  return (
    <div
      className={cn('book-cover', className)}
      aria-busy={!ready}
      data-loading={!ready || undefined}
    >
      {!ready && (
        <Skeleton aria-hidden="true" className="book-cover__skeleton">
          <span className="book-cover__skeleton-mark" />
          <span className="book-cover__skeleton-lines" />
        </Skeleton>
      )}
      <img
        ref={imageRef}
        alt={alt}
        className="book-cover__image"
        decoding="async"
        loading={loading}
        sizes={sizes}
        src={src}
      />
    </div>
  )
}

export function BookCoverImage({
  book,
  appearance = 'book',
  className,
  decorative = false,
  loading = 'lazy',
  sizes,
}: BookCoverProps) {
  const sources = useMemo(
    () =>
      [
        ...new Set([
          loadedBookCovers.get(book.id),
          book.cover.large,
          book.cover.small,
        ]),
      ].filter((source): source is string => Boolean(source)),
    [book.id, book.cover.large, book.cover.small],
  )
  const displayTitle = getDisplayTitle(book.title)
  const sourceSignature = `${book.id}:${sources.join('|')}`
  const [failure, setFailure] = useState<CoverFailureState>({
    failedSources: [],
    sourceSignature,
  })
  const failedSources =
    failure.sourceSignature === sourceSignature ? failure.failedSources : []
  const availableSources = sources.filter(
    (source) => !failedSources.includes(source),
  )
  const imageSource = availableSources[0] ?? null
  const variant = getCoverVariant(`${book.id}:${displayTitle}`)

  if (imageSource) {
    return (
      <CoverArtwork
        bookId={book.id}
        key={sourceSignature + imageSource}
        src={imageSource}
        alt={decorative ? '' : `Capa de “${displayTitle}”`}
        className={cn(appearance === 'flat' && 'book-cover--flat', className)}
        loading={loading}
        sizes={sizes}
        onFailure={() => {
          setFailure((current) => ({
            failedSources: [
              ...new Set([
                ...(current.sourceSignature === sourceSignature
                  ? current.failedSources
                  : []),
                imageSource,
              ]),
            ],
            sourceSignature,
          }))
        }}
      />
    )
  }

  return (
    <div
      aria-hidden={decorative || undefined}
      aria-label={
        decorative ? undefined : `Capa indisponível para “${displayTitle}”`
      }
      className={cn(
        'book-cover book-cover--fallback',
        appearance === 'flat' && 'book-cover--flat',
        className,
      )}
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
