import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi, useCanGoBack, useRouter } from '@tanstack/react-router'
import {
  ArrowLeft,
  Download,
  Star,
  BookOpen,
  Languages,
  CalendarDays,
} from 'lucide-react'
import {
  BookCard,
  BookCoverImage,
  bookQueryKeys,
  googleBooksClient,
  type Book,
} from '@/entities/book'
import { BookPreview } from '@/features/read-book'
import { findSuggestedBooks } from '@/features/discover-books'
import { ShelfToggle } from '@/features/manage-shelf'
import { useAuthStore } from '@/features/auth'
import shelfUrl from '@/shared/assets/book-detail-shelf.svg'
import marksUrl from '@/shared/assets/book-detail-marks.svg'
import arrowUrl from '@/shared/assets/book-detail-arrow.svg'
import noteArrowUrl from '@/shared/assets/book-detail-note-arrow.svg'
import { Button } from '@/shared/ui/button'
import { BookLoading } from '@/shared/ui/book-loading'
import './book-details.css'

const route = getRouteApi('/_authenticated/book/$bookId')

function BackButton() {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  return (
    <Button
      variant="ghost"
      className="book-details__back"
      onClick={() => {
        if (canGoBack) router.history.back()
        else void router.navigate({ to: '/discover', replace: true })
      }}
    >
      <ArrowLeft size={22} aria-hidden="true" /> Voltar
    </Button>
  )
}

function RelatedBooks({ book }: { book: Book }) {
  const { id, categories, authors } = book
  const related = useQuery({
    queryKey: ['books', 'suggestions', id, categories, authors],
    queryFn: ({ signal }) =>
      findSuggestedBooks(
        { id, categories, authors },
        (params, searchSignal) =>
          googleBooksClient.search(params, searchSignal),
        signal,
      ),
    retry: false,
  })
  const books = related.data?.books ?? []
  return (
    <section className="book-details__related" aria-labelledby="related-title">
      <p className="book-details__eyebrow">Continue pela estante</p>
      <h2 id="related-title">Mais páginas para descobrir.</h2>
      <p className="book-details__muted">
        {related.data?.broadened || (!categories.length && !authors.length)
          ? 'Um assunto puxa outro. Conheça também estas leituras.'
          : 'Outras histórias, assuntos e autores para continuar descobrindo.'}
      </p>
      {related.isPending && (
        <p role="status">Procurando leituras que combinam com esta…</p>
      )}
      {related.isError && (
        <div role="alert">
          <p>Não conseguimos buscar os relacionados agora.</p>
          <Button variant="outline" onClick={() => void related.refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}
      {related.isSuccess && books.length === 0 && (
        <div role="status">
          <p>O catálogo não retornou sugestões desta vez.</p>
          <Button variant="outline" onClick={() => void related.refetch()}>
            Buscar sugestões novamente
          </Button>
        </div>
      )}
      <div className="book-details__related-grid">
        {books.map((item) => (
          <BookCard key={item.id} book={item} />
        ))}
      </div>
    </section>
  )
}

function languageName(language: string | null) {
  if (!language) return null
  try {
    return (
      new Intl.DisplayNames(['pt-BR'], { type: 'language' }).of(language) ||
      language
    )
  } catch {
    return language
  }
}

export function BookDetailsContent({ book }: { book: Book }) {
  const email = useAuthStore((state) => state.session?.email ?? '')
  const facts = [
    ['Editora', book.publisher],
    ['Publicação', book.publishedDate],
    ['Páginas', book.pageCount ? String(book.pageCount) : null],
    ['Idioma', languageName(book.language)],
    ...(book.identifiers ?? []).map((item) => [
      item.type.replace('_', ' '),
      item.identifier,
    ]),
  ].filter(([, value]) => Boolean(value))
  const downloads = [
    ['PDF', book.reading?.pdf],
    ['EPUB', book.reading?.epub],
  ].filter((item): item is [string, string] => Boolean(item[1]))
  return (
    <>
      <BackButton />
      <article aria-labelledby="book-title">
        <div className="book-details__feature">
          <div className="book-details__cover-stage">
            <div className="book-details__cover-art">
              <img
                className="book-details__marks"
                src={marksUrl}
                alt=""
                aria-hidden="true"
              />
              <BookCoverImage
                book={book}
                className="book-details__cover"
                loading="eager"
                sizes="(max-width: 680px) 60vw, 300px"
              />
            </div>
            <img
              className="book-details__little-shelf"
              src={shelfUrl}
              alt=""
              aria-hidden="true"
            />
            <span className="book-details__cover-note">
              <span>um livro, tantas possibilidades.</span>
              <img src={noteArrowUrl} alt="" aria-hidden="true" />
            </span>
          </div>
          <div className="book-details__presentation">
            <p className="book-details__category-bubble">
              {book.categories[0] || 'Na estante do Libris'}
            </p>
            <h1 id="book-title">{book.title || 'Título não informado'}</h1>
            {book.subtitle && (
              <p className="book-details__subtitle">{book.subtitle}</p>
            )}
            <p className="book-details__authors">
              {book.authors.length
                ? book.authors.join(' · ')
                : 'Autoria não informada'}
            </p>
            <div className="book-details__rating">
              <div
                className="book-details__stars"
                role="img"
                aria-label={
                  book.averageRating === null
                    ? 'Sem avaliação'
                    : `Nota ${book.averageRating.toLocaleString('pt-BR')} de 5`
                }
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <span className="book-details__star" key={index}>
                    <Star aria-hidden="true" />
                    <span
                      style={{
                        width: `${Math.max(0, Math.min(1, (book.averageRating ?? 0) - index)) * 100}%`,
                      }}
                    >
                      <Star aria-hidden="true" />
                    </span>
                  </span>
                ))}
              </div>
              <p>
                {book.averageRating === null ? (
                  'Ainda sem avaliações no Google Books'
                ) : (
                  <>
                    <strong>
                      {book.averageRating.toLocaleString('pt-BR')} / 5
                    </strong>
                    <span>
                      {' '}
                      ·{' '}
                      {book.ratingsCount === null
                        ? 'Avaliação no Google Books'
                        : `${book.ratingsCount.toLocaleString('pt-BR')} ${book.ratingsCount === 1 ? 'avaliação' : 'avaliações'} no Google Books`}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="book-details__quick-facts">
              {book.pageCount ? (
                <span>
                  <BookOpen aria-hidden="true" />
                  {book.pageCount} páginas
                </span>
              ) : null}
              {book.language && (
                <span>
                  <Languages aria-hidden="true" />
                  {languageName(book.language)}
                </span>
              )}
              {book.publishedDate && (
                <span>
                  <CalendarDays aria-hidden="true" />
                  {book.publishedDate.slice(0, 4)}
                </span>
              )}
            </div>
            {book.publisher && (
              <p className="book-details__publisher">
                Publicado por <strong>{book.publisher}</strong>
              </p>
            )}
            <a className="book-details__synopsis-link" href="#synopsis-title">
              Conheça a história ↓
            </a>
            <div className="book-details__actions">
              <BookPreview key={book.id} book={book} />
              {email && (
                <ShelfToggle
                  key={`${email}:${book.id}`}
                  book={book}
                  email={email}
                />
              )}
            </div>
            {(book.reading?.viewability === 'PARTIAL' ||
              book.reading?.viewability === 'ALL_PAGES') && (
              <div className="book-details__action-note" aria-hidden="true">
                <img src={arrowUrl} alt="" />
                <span>Dê uma espiada nas primeiras páginas</span>
              </div>
            )}
          </div>
        </div>
        <div className="book-details__body">
          <section aria-labelledby="synopsis-title">
            <p className="book-details__eyebrow">Antes da primeira página</p>
            <h2 id="synopsis-title">Sobre o livro</h2>
            <p className="book-details__synopsis">
              {book.description ||
                'A sinopse desta edição ainda não foi disponibilizada. Os dados ao lado ajudam a conhecer o livro.'}
            </p>
            {book.infoUrl && (
              <a
                className="book-details__external"
                href={book.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Consultar esta edição no Google Books ↗
              </a>
            )}
          </section>
          <aside
            className="book-details__edition"
            aria-labelledby="edition-title"
          >
            <p className="book-details__eyebrow">Ficha da edição</p>
            <h2 id="edition-title">Anota aí.</h2>
            <dl>
              {facts.map(([label, value], index) => (
                <div key={`${label}-${index}`}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {facts.length === 0 && (
              <p>Os dados desta edição ainda não foram informados.</p>
            )}
            {book.categories.length > 0 && (
              <div className="book-details__categories">
                {book.categories.map((category) => (
                  <span key={category}>{category}</span>
                ))}
              </div>
            )}
            {downloads.length > 0 && (
              <div className="book-details__downloads">
                <h3>Leve a leitura com você</h3>
                <p>
                  Arquivos disponibilizados para esta edição pelo Google Books.
                </p>
                {downloads.map(([format, url]) => (
                  <Button key={format} asChild variant="outline">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <Download /> Baixar {format} ↗
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </article>
      <RelatedBooks key={book.id} book={book} />
    </>
  )
}

export function BookDetailsPage() {
  const { bookId } = route.useParams()
  const detail = useQuery({
    meta: { errorMessage: 'Não foi possível abrir os detalhes do livro.' },
    queryKey: bookQueryKeys.detail(bookId),
    queryFn: ({ signal }) => googleBooksClient.getById(bookId, signal),
  })
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [bookId])
  return (
    <main className="book-details">
      {detail.isPending ? (
        <BookLoading />
      ) : detail.isError ? (
        <div className="book-details__status" role="alert">
          <h1>Esta página não abriu.</h1>
          <p>{detail.error.message}</p>
          <Button onClick={() => void detail.refetch()}>
            Tentar novamente
          </Button>
          <BackButton />
        </div>
      ) : (
        <BookDetailsContent book={detail.data} />
      )}
    </main>
  )
}
