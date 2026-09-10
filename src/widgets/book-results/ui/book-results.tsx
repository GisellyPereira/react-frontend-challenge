import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { useRef } from 'react'

import { BookCard, BOOKS_PER_PAGE, type Book } from '@/entities/book'
import { useBookSearch, type DiscoverSearch } from '@/features/discover-books'
import { gsap, useGSAP } from '@/shared/lib/gsap'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

import './book-results.css'

interface BookResultsProps {
  onPageChange: (startIndex: number) => void
  search: DiscoverSearch
}

function BookResultsSkeleton() {
  return (
    <div aria-label="Buscando livros" className="book-results" role="status">
      <span className="sr-only">Buscando livros no catálogo…</span>
      <div aria-hidden="true" className="book-results-grid">
        {Array.from({ length: 10 }, (_, index) => (
          <div className="min-w-0" key={index}>
            <Skeleton className="aspect-[2/3] w-full rounded-[0.35rem] bg-foreground/10" />
            <Skeleton className="mt-5 h-4 w-4/5 rounded-none bg-foreground/10" />
            <Skeleton className="mt-2 h-3 w-1/2 rounded-none bg-foreground/8" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadedBookGridProps {
  books: readonly Book[]
  isUpdating: boolean
}

function LoadedBookGrid({ books, isUpdating }: LoadedBookGridProps) {
  const gridRef = useRef<HTMLUListElement>(null)

  useGSAP(
    () => {
      if (isUpdating || typeof window.matchMedia !== 'function') {
        return
      }

      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-book-result]', {
          autoAlpha: 0,
          duration: 0.48,
          ease: 'power3.out',
          stagger: 0.045,
          y: 22,
        })
      })

      return () => media.revert()
    },
    {
      dependencies: [books, isUpdating],
      revertOnUpdate: true,
      scope: gridRef,
    },
  )

  return (
    <ul
      className={`book-results-grid ${isUpdating ? 'book-results-grid--updating' : ''}`}
      ref={gridRef}
    >
      {books.map((book, index) => (
        <li
          className={index === 0 ? 'book-results-grid__featured' : undefined}
          data-book-result
          key={book.id}
        >
          <BookCard book={book} featured={index === 0} position={index + 1} />
        </li>
      ))}
    </ul>
  )
}

export function BookResults({ onPageChange, search }: BookResultsProps) {
  const result = useBookSearch(search)

  if (!result.hasSearchTerm) {
    return null
  }

  if ((result.isDebouncing || result.isPending) && !result.data) {
    return <BookResultsSkeleton />
  }

  if (result.isError) {
    return (
      <section
        className="book-results-message book-results-message--error"
        role="alert"
      >
        <p className="book-results-message__label">
          A busca encontrou um obstáculo
        </p>
        <h2 className="book-results-message__title">
          Não conseguimos abrir o catálogo agora.
        </h2>
        <p className="book-results-message__description">
          {result.error.message}
        </p>
        <Button
          className="mt-5 h-10 rounded-full px-5"
          type="button"
          variant="outline"
          onClick={() => void result.refetch()}
        >
          <RotateCcw aria-hidden="true" />
          Tentar novamente
        </Button>
      </section>
    )
  }

  if (!result.data || result.data.books.length === 0) {
    return (
      <section className="book-results-message">
        <p className="book-results-message__label">Catálogo consultado</p>
        <h2 className="book-results-message__title">
          Nenhum volume apareceu para “{search.q.trim()}”.
        </h2>
        <p className="book-results-message__description">
          Tente um título mais curto, o sobrenome da autoria ou outro assunto.
        </p>
      </section>
    )
  }

  const currentPage =
    Math.floor(result.data.startIndex / result.data.pageSize) + 1
  const previousStartIndex = Math.max(
    0,
    result.data.startIndex - BOOKS_PER_PAGE,
  )
  const resultCount = new Intl.NumberFormat('pt-BR').format(
    result.data.totalItems,
  )

  return (
    <section
      aria-busy={result.isFetching}
      aria-labelledby="book-results-title"
      className="book-results"
    >
      <header className="book-results__header">
        <div>
          <p aria-live="polite" className="book-results__count">
            {resultCount} resultados encontrados
          </p>
          <h2 className="book-results__title" id="book-results-title">
            Resultados para <span>“{search.q.trim()}”</span>
          </h2>
        </div>
        <div className="book-results__status">
          {result.isFetching ? (
            <span role="status">Atualizando…</span>
          ) : (
            <span>Página {currentPage}</span>
          )}
        </div>
      </header>

      <LoadedBookGrid
        books={result.data.books}
        isUpdating={result.isPlaceholderData}
      />

      <nav
        aria-label="Paginação dos resultados"
        className="book-results__pagination"
      >
        <Button
          className="book-results__page-button"
          disabled={result.isFetching || result.data.startIndex === 0}
          type="button"
          variant="outline"
          onClick={() => onPageChange(previousStartIndex)}
        >
          <ArrowLeft aria-hidden="true" />
          Anterior
        </Button>

        <span className="book-results__page-label">Página {currentPage}</span>

        <Button
          className="book-results__page-button"
          disabled={
            result.isFetching ||
            result.isPlaceholderData ||
            result.data.nextStartIndex === null
          }
          type="button"
          variant="outline"
          onClick={() => {
            if (result.data.nextStartIndex !== null) {
              onPageChange(result.data.nextStartIndex)
            }
          }}
        >
          Próxima
          <ArrowRight aria-hidden="true" />
        </Button>
      </nav>
    </section>
  )
}
