import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, Compass, Lightbulb, Search } from 'lucide-react'
import { BookCoverImage, type Book } from '@/entities/book'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import readingArt from '@/shared/assets/reading-cover-person.svg'
import readingCover from '@/shared/assets/reading-book-cover.svg'
import readingBookmark from '@/shared/assets/reading-bookmark-ribbon.svg'
import { useHomeCollection } from '../model/use-home-collection'
import { uniqueBooks } from '../model/select-home-books'
import { PersonalClosing } from './personal-closing'
import { MagazineCollection } from './magazine-collection'
import './discover-home.css'
import { BookCarousel } from './book-carousel'

const moods = [
  {
    label: 'Me perder numa história',
    query: 'subject:fiction',
    icon: BookOpen,
    note: 'Outras vidas. Outros lugares. Uma boa desculpa para ficar mais um pouco.',
  },
  {
    label: 'Aprender algo novo',
    query: 'subject:science',
    icon: Lightbulb,
    note: 'Para aquelas perguntas que começam com “e se?” e não saem da cabeça.',
  },
  {
    label: 'Desvendar um mistério',
    query: 'subject:mystery',
    icon: Search,
    note: 'Pistas, suspeitas e aquela vontade de ler só mais uma página.',
  },
  {
    label: 'Conhecer uma vida',
    query: 'subject:biography',
    icon: Compass,
    note: 'Histórias de quem viveu, tentou, mudou de ideia e deixou algo para contar.',
  },
] as const

function CollectionState({
  loading,
  error,
  empty,
  retry,
}: {
  loading: boolean
  error: boolean
  empty: boolean
  retry: () => void
}) {
  if (error)
    return (
      <div className="home-collection-state" role="alert">
        <p>Esta parte do catálogo não abriu agora.</p>
        <Button variant="outline" onClick={retry}>
          Tentar novamente
        </Button>
      </div>
    )
  if (loading)
    return (
      <div
        className="home-book-grid"
        role="status"
        aria-label="Carregando sugestões"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="home-book-skeleton" />
        ))}
      </div>
    )
  if (empty)
    return (
      <p className="home-collection-state" role="status">
        Nenhum título nesta seleção por enquanto. Experimente outro assunto na
        busca.
      </p>
    )
  return null
}

function HomeBook({ book }: { book: Book }) {
  return (
    <article className="home-book">
      <Link
        to="/book/$bookId"
        params={{ bookId: book.id }}
        className="home-book__link"
        aria-label={`Ver detalhes de ${book.title || 'livro'}`}
      >
        <BookCoverImage
          book={book}
          decorative
          sizes="(max-width: 600px) 42vw, 200px"
        />
        <h3>{book.title || 'Título não informado'}</h3>
      </Link>
      <p className="home-book__author">
        {book.authors.join(', ') || 'Autoria não informada'}
      </p>
    </article>
  )
}

function ReadingPause() {
  return (
    <section className="reading-pause" aria-labelledby="reading-pause-title">
      <img
        className="reading-pause__cover"
        src={readingCover}
        alt=""
        aria-hidden="true"
        width="1440"
        height="560"
        loading="lazy"
      />
      <div className="reading-pause__art">
        <img
          src={readingArt}
          alt="Pessoa sentada numa poltrona, lendo tranquilamente ao lado de uma planta."
          width="560"
          height="500"
          loading="lazy"
        />
      </div>
      <div className="reading-pause__copy">
        <p className="home-eyebrow">Entre você e uma boa história</p>
        <h2 id="reading-pause-title">
          O mundo pode esperar.
          <em>Só mais um capítulo.</em>
        </h2>
        <p>
          Escolha um cantinho, encontre uma história e deixe o resto para
          depois. A próxima página é sua.
        </p>
        <Button asChild>
          <a href="#reading-mood">
            Encontrar minha leitura <ArrowRight size={18} aria-hidden="true" />
          </a>
        </Button>
      </div>
      <img
        className="reading-pause__bookmark"
        src={readingBookmark}
        alt=""
        aria-hidden="true"
        width="150"
        height="100"
        loading="lazy"
      />
    </section>
  )
}

function MoodCollection() {
  const [choice, setChoice] = useState(0)
  const mood = moods[choice] ?? moods[0]
  const { ref, result } = useHomeCollection(mood.query)
  const books = uniqueBooks(result.data?.books ?? [])
  return (
    <section
      className="home-section mood-collection"
      ref={ref}
      id="reading-mood"
      aria-labelledby="mood-title"
    >
      <header className="home-section__heading">
        <div>
          <p className="home-eyebrow">Siga a curiosidade</p>
          <h2 id="mood-title">
            Hoje eu quero <em>encontrar…</em>
          </h2>
        </div>
        <span className="home-hand-note" aria-hidden="true">
          qual é a sua vibe?
        </span>
      </header>
      <div
        className="mood-choices"
        role="group"
        aria-label="Escolha seu interesse"
      >
        {moods.map((item, index) => (
          <Button
            key={item.query}
            variant="outline"
            aria-pressed={choice === index}
            onClick={() => setChoice(index)}
          >
            <item.icon size={19} aria-hidden="true" />
            {item.label}
          </Button>
        ))}
      </div>
      <p className="mood-collection__note" aria-live="polite">
        {mood.note}
      </p>
      <CollectionState
        loading={result.isPending}
        error={result.isError}
        empty={books.length === 0}
        retry={() => void result.refetch()}
      />
      {!result.isPending && !result.isError && books.length > 0 && (
        <BookCarousel key={mood.query} label={mood.label}>
          {books.map((book) => (
            <HomeBook key={book.id} book={book} />
          ))}
        </BookCarousel>
      )}
    </section>
  )
}

export function DiscoverHome() {
  return (
    <div className="discover-home">
      <ReadingPause />
      <MoodCollection />
      <MagazineCollection />
      <PersonalClosing />
    </div>
  )
}
