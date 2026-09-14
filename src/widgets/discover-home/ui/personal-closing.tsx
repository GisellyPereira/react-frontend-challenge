import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Bookmark } from 'lucide-react'
import { BookCoverImage } from '@/entities/book'
import { useAuthStore } from '@/features/auth'
import { useShelfStore, type SavedBook } from '@/features/manage-shelf'
import { Button } from '@/shared/ui/button'
import collectionNook from '@/shared/assets/collection-nook.svg'
import emptyCollection from '@/shared/assets/collection-empty-books.svg'
import shelf from '@/shared/assets/book-detail-shelf.svg'
import './personal-closing.css'

export function PersonalClosingContent({
  books,
}: {
  books: readonly SavedBook[]
}) {
  const waiting = books.filter((book) => book.status === 'want-to-read')
  const reading = books.filter((book) => book.status === 'reading')
  const finished = books.filter((book) => book.status === 'read')
  const selection = waiting.length ? waiting : reading.length ? reading : books
  const featured = selection.slice(0, 3)
  const collectionLabel = waiting.length
    ? 'Na sua lista de quero ler'
    : reading.length
      ? 'Seus capítulos em andamento'
      : books.length
        ? 'Histórias da sua coleção'
        : 'Tem lugar para suas histórias'

  return (
    <section className="home-closing" aria-labelledby="closing-title">
      <div className="home-closing__copy">
        <p className="home-closing__eyebrow">
          <Bookmark aria-hidden="true" /> O seu cantinho no Libris
        </p>
        <h2 id="closing-title">
          Uma boa história
          <br />
          fica com <em>você.</em>
        </h2>
        <p className="home-closing__description">
          {waiting.length
            ? 'Você já guardou o próximo encontro. Escolha um dos seus livros e dê lugar a uma nova história.'
            : reading.length
              ? 'Tem um próximo capítulo esperando por você. Volte à sua estante e continue de onde parou.'
              : books.length
                ? 'Cada livro guarda um encontro. Reencontre os seus favoritos e abra espaço para novas descobertas.'
                : 'Guarde os livros que despertam sua curiosidade. Acompanhe suas leituras e veja a sua história crescer.'}
        </p>
        <Button asChild className="home-closing__action">
          <Link to="/shelf">
            Abrir minha estante <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
        {books.length > 0 ? (
          <dl className="home-closing__progress" aria-label="Suas leituras">
            <div>
              <dt>Quero ler</dt>
              <dd>{waiting.length}</dd>
            </div>
            <div>
              <dt>Lendo</dt>
              <dd>{reading.length}</dd>
            </div>
            <div>
              <dt>Concluídos</dt>
              <dd>{finished.length}</dd>
            </div>
          </dl>
        ) : (
          <p className="home-closing__hint">
            Um livro de cada vez. Do seu jeito.
          </p>
        )}
      </div>
      <div className="home-closing__collection">
        <div className="home-closing__collection-heading">
          <span>
            {books.length ? 'Escolhidos por você' : 'Sua próxima coleção'}
          </span>
          <span className="home-closing__count">
            {books.length
              ? `${books.length} ${books.length === 1 ? 'livro' : 'livros'}`
              : 'começa aqui'}
          </span>
        </div>
        <div className="home-closing__scene">
          <img
            className="home-closing__backdrop"
            src={collectionNook}
            alt=""
            aria-hidden="true"
            width="600"
            height="370"
            loading="lazy"
          />
          {featured.length ? (
            <ul className="home-closing__books">
              {featured.map((book) => (
                <li key={book.id}>
                  <Link
                    to="/book/$bookId"
                    params={{ bookId: book.id }}
                    aria-label={`Ver detalhes de ${book.title || 'livro'}`}
                    title={book.title || 'Título não informado'}
                  >
                    <BookCoverImage
                      book={book}
                      decorative
                      sizes="(max-width: 600px) 22vw, 150px"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <img
              className="home-closing__empty-books"
              src={emptyCollection}
              alt=""
              aria-hidden="true"
              width="440"
              height="280"
              loading="lazy"
            />
          )}
          <img
            className="home-closing__shelf"
            src={shelf}
            alt=""
            aria-hidden="true"
            width="520"
            height="38"
            loading="lazy"
          />
        </div>
        <p className="home-closing__caption">
          <Bookmark aria-hidden="true" />
          {collectionLabel}
        </p>
      </div>
    </section>
  )
}

export function PersonalClosing() {
  const email = useAuthStore(
    (state) => state.session?.email.trim().toLowerCase() ?? '',
  )
  const shelves = useShelfStore((state) => state.shelves)
  return <PersonalClosingContent books={shelves[email] ?? []} />
}
