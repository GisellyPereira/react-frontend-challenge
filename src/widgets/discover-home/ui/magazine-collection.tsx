import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { BookCoverImage } from '@/entities/book'
import magazineDoodle from '@/shared/assets/magazine-doodle.svg'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatMagazineDate } from '../model/format-magazine-date'
import { uniqueBooks } from '../model/select-home-books'
import { useHomeCollection } from '../model/use-home-collection'
import './magazine-collection.css'

export function MagazineCollection() {
  const { ref, result } = useHomeCollection('science', true)
  const books = uniqueBooks(result.data?.books ?? []).slice(0, 4)

  return (
    <section
      ref={ref}
      className="home-section magazine-collection"
      aria-labelledby="magazine-title"
    >
      <header className="magazine-collection__heading">
        <div>
          <p className="home-eyebrow">A banca do Libris</p>
          <h2 id="magazine-title">
            A curiosidade pede <em>uma folheada.</em>
          </h2>
        </div>
        <div className="magazine-collection__intro">
          <p>
            Ideias, ciência e histórias de outros tempos. Dê uma espiada nas
            revistas do acervo e encontre um assunto que te prenda.
          </p>
          <Button
            asChild
            variant="outline"
            className="magazine-collection__action"
          >
            <Link
              to="/discover"
              search={{
                q: 'science',
                printType: 'magazines',
                orderBy: 'relevance',
                startIndex: 0,
              }}
            >
              Explorar revistas <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <img
          className="magazine-collection__doodle"
          src={magazineDoodle}
          alt=""
          aria-hidden="true"
        />
      </header>

      {result.isError ? (
        <div className="home-collection-state" role="alert">
          <p>Não conseguimos abrir a banca agora.</p>
          <Button variant="outline" onClick={() => void result.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : result.isPending ? (
        <div
          className="magazine-grid"
          role="status"
          aria-label="Carregando revistas"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} aria-hidden="true">
              <div className="magazine-card__display">
                <Skeleton className="magazine-card__skeleton" />
              </div>
              <Skeleton className="magazine-card__skeleton-title" />
              <Skeleton className="magazine-card__skeleton-date" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <p className="home-collection-state" role="status">
          Nenhuma edição por aqui ainda. Explore outros assuntos na busca de
          revistas.
        </p>
      ) : (
        <div className="magazine-grid">
          {books.map((book) => (
            <article key={book.id} className="magazine-card">
              <Link
                to="/book/$bookId"
                params={{ bookId: book.id }}
                className="magazine-card__link"
                aria-label={`Ver edição de ${book.title || 'revista'}, ${formatMagazineDate(book.publishedDate)}`}
              >
                <div className="magazine-card__display">
                  <BookCoverImage book={book} appearance="flat" decorative />
                </div>
                <div className="magazine-card__info">
                  <h3>{book.title || 'Revista sem título'}</h3>
                  <p>{formatMagazineDate(book.publishedDate)}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
      <p className="magazine-collection__caption">
        Outras épocas. Sempre uma nova descoberta.
      </p>
    </section>
  )
}
