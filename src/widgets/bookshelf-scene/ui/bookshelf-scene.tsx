import { useRef, type CSSProperties } from 'react'

import { gsap, useGSAP } from '@/shared/lib/gsap'

import './bookshelf-scene.css'

const bookColors = [
  'var(--book-teal)',
  'var(--book-coral)',
  'var(--book-gold)',
  'var(--book-blue)',
  'var(--book-rose)',
  'var(--book-wine)',
  'var(--book-olive)',
  'var(--book-sand)',
]

const bookDetails = ['line', 'frame', 'dot', 'bands'] as const
const bookShapes = ['square', 'round', 'soft'] as const
const bookAccents = ['#f4e2bc', '#172720', '#e9a822', '#dbe7db']
const printedTitles = ['Libris', 'Contos', 'Poesia', 'Ficção', 'Ensaios']

interface BookDefinition {
  accent: string
  color: string
  detail: (typeof bookDetails)[number]
  height: number
  lean: number
  shape: (typeof bookShapes)[number]
  title?: string
  weight: number
}

function createShelf(seed: number): BookDefinition[] {
  return Array.from({ length: 18 }, (_, index) => {
    const color = bookColors[(index * 3 + seed) % bookColors.length]
    const detail = bookDetails[(index + seed * 2) % bookDetails.length]
    const shape = bookShapes[(index * 2 + seed) % bookShapes.length]
    const accent = bookAccents[(index * 5 + seed) % bookAccents.length]
    const leanPattern = [0, -4, 0, 2, 0, 0, 5, 0]
    const lean = leanPattern[(index + seed) % leanPattern.length]
    const hasTitle = (index + seed) % 7 === 0
    const weight = 0.72 + ((index * 5 + seed) % 5) * 0.16

    return {
      accent: accent ?? '#f4e2bc',
      color: color ?? 'var(--book-coral)',
      detail: detail ?? 'line',
      height: 61 + ((index * 17 + seed * 13) % 37),
      lean: lean ?? 0,
      shape: shape ?? 'square',
      weight: hasTitle ? Math.max(weight, 1.04) : weight,
      ...(hasTitle
        ? {
            title:
              printedTitles[(index + seed) % printedTitles.length] ?? 'Libris',
          }
        : {}),
    }
  })
}

const shelves = [createShelf(1), createShelf(3), createShelf(5), createShelf(7)]

interface BookStyle extends CSSProperties {
  '--book-accent': string
  '--book-color': string
  '--book-delay': string
  '--book-height': string
  '--book-lean': string
  '--book-weight': number
}

interface StackBookStyle extends CSSProperties {
  '--stack-color': string
  '--stack-offset': string
  '--stack-width': string
}

function Book({
  book,
  revealOrder,
}: {
  book: BookDefinition
  revealOrder: number
}) {
  const style: BookStyle = {
    '--book-accent': book.accent,
    '--book-color': book.color,
    '--book-delay': `${0.7 + revealOrder * 0.06}s`,
    '--book-height': `${book.height}%`,
    '--book-lean': `${book.lean}deg`,
    '--book-weight': book.weight,
  }

  return (
    <span
      className={`shelf-book shelf-book--${book.shape}`}
      data-book
      style={style}
    >
      <span
        className={`shelf-book__detail shelf-book__detail--${book.detail}`}
      />
      {book.title ? (
        <span className="shelf-book__title">{book.title}</span>
      ) : null}
    </span>
  )
}

function BookGroup({
  books,
  startIndex = 0,
}: {
  books: BookDefinition[]
  startIndex?: number
}) {
  return (
    <div className="book-shelf__group" style={{ flexGrow: books.length }}>
      {books.map((book, bookIndex) => (
        <Book
          book={book}
          key={bookIndex}
          revealOrder={startIndex + bookIndex}
        />
      ))}
    </div>
  )
}

function ShelfPlant({ tone }: { tone: 'blue' | 'cream' }) {
  return (
    <div className={`shelf-plant shelf-plant--${tone}`} data-decoration>
      <span className="shelf-plant__foliage">
        {Array.from({ length: 6 }, (_, index) => (
          <span className="shelf-plant__leaf" key={index} />
        ))}
      </span>
      <span className="shelf-plant__pot" />
    </div>
  )
}

function HorizontalBookStack() {
  const colors = [
    'var(--book-coral)',
    'var(--book-sand)',
    'var(--book-teal)',
    'var(--book-gold)',
  ]
  const widths = ['82%', '94%', '86%', '100%']
  const offsets = ['-0.2rem', '0.18rem', '-0.1rem', '0.1rem']

  return (
    <div className="horizontal-stack" data-decoration>
      {colors.map((color, index) => (
        <span
          className="horizontal-stack__book"
          key={color}
          style={
            {
              '--stack-color': color,
              '--stack-offset': offsets[index] ?? '0',
              '--stack-width': widths[index] ?? '90%',
            } as StackBookStyle
          }
        />
      ))}
    </div>
  )
}

function ShelfContents({
  books,
  shelfIndex,
}: {
  books: BookDefinition[]
  shelfIndex: number
}) {
  if (shelfIndex === 0) {
    return (
      <>
        <BookGroup books={books.slice(0, 5)} />
        <ShelfPlant tone="blue" />
        <BookGroup books={books.slice(5)} startIndex={5} />
      </>
    )
  }

  if (shelfIndex === 1) {
    return (
      <>
        <BookGroup books={books.slice(0, 8)} />
        <HorizontalBookStack />
        <BookGroup books={books.slice(8)} startIndex={8} />
      </>
    )
  }

  if (shelfIndex === 2) {
    return (
      <>
        <BookGroup books={books.slice(0, 12)} />
        <ShelfPlant tone="cream" />
        <BookGroup books={books.slice(12)} startIndex={12} />
      </>
    )
  }

  return (
    <>
      <BookGroup books={books.slice(0, 7)} />
      <HorizontalBookStack />
      <BookGroup books={books.slice(7)} startIndex={7} />
    </>
  )
}

export function BookshelfScene() {
  const sceneRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (typeof window.matchMedia !== 'function') {
        return
      }

      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
        })

        timeline
          .from('[data-shelf-board]', {
            scaleX: 0,
            transformOrigin: 'left center',
            duration: 0.85,
            stagger: 0.09,
          })
          .from(
            '[data-decoration]',
            {
              autoAlpha: 0,
              y: 35,
              scale: 0.9,
              duration: 0.65,
              stagger: 0.12,
            },
            0.8,
          )
          .from(
            '[data-ladder]',
            { autoAlpha: 0, x: 50, rotation: 0, duration: 0.8 },
            1.15,
          )
      })

      return () => media.revert()
    },
    { scope: sceneRef },
  )

  return (
    <aside
      ref={sceneRef}
      className="bookshelf-scene hidden md:block"
      aria-hidden="true"
    >
      <div className="bookshelf-scene__shelves">
        {shelves.map((books, shelfIndex) => (
          <div className="book-shelf" key={shelfIndex}>
            <div className="book-shelf__books">
              <ShelfContents books={books} shelfIndex={shelfIndex} />
            </div>
            <span className="book-shelf__board" data-shelf-board />
          </div>
        ))}
      </div>

      <div className="bookshelf-ladder" data-ladder>
        <span className="bookshelf-ladder__rail bookshelf-ladder__rail--left" />
        <span className="bookshelf-ladder__rail bookshelf-ladder__rail--right" />
        {Array.from({ length: 6 }, (_, index) => (
          <span className="bookshelf-ladder__step" key={index} />
        ))}
      </div>
    </aside>
  )
}
