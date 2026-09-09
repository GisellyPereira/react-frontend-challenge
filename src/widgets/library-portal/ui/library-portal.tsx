import { useRef, type CSSProperties } from 'react'

import { gsap, useGSAP } from '@/shared/lib/gsap'

import './library-portal.css'

interface BookDefinition {
  color: string
  height: number
  width: number
  lean?: number
  detail?: 'line' | 'dot' | 'double'
}

const shelves: BookDefinition[][] = [
  [
    {
      color: 'var(--book-coral)',
      height: 74,
      width: 30,
      lean: -5,
      detail: 'double',
    },
    { color: 'var(--book-gold)', height: 90, width: 23, detail: 'line' },
    { color: 'var(--book-blue)', height: 68, width: 36, detail: 'dot' },
    {
      color: 'var(--book-rose)',
      height: 82,
      width: 26,
      lean: 3,
      detail: 'double',
    },
    { color: 'var(--book-jade)', height: 62, width: 32, detail: 'line' },
    {
      color: 'var(--book-plum)',
      height: 86,
      width: 24,
      lean: -4,
      detail: 'dot',
    },
    { color: 'var(--paper)', height: 70, width: 27, detail: 'double' },
  ],
  [
    { color: 'var(--book-jade)', height: 82, width: 28, detail: 'line' },
    {
      color: 'var(--book-blue)',
      height: 66,
      width: 34,
      lean: -3,
      detail: 'double',
    },
    { color: 'var(--book-gold)', height: 88, width: 25, detail: 'dot' },
    { color: 'var(--paper)', height: 76, width: 30, detail: 'line' },
    {
      color: 'var(--book-coral)',
      height: 64,
      width: 38,
      lean: 5,
      detail: 'double',
    },
    { color: 'var(--book-plum)', height: 92, width: 25, detail: 'line' },
    { color: 'var(--book-rose)', height: 72, width: 28, detail: 'dot' },
  ],
  [
    { color: 'var(--book-blue)', height: 76, width: 27, detail: 'dot' },
    {
      color: 'var(--book-rose)',
      height: 88,
      width: 31,
      lean: -4,
      detail: 'double',
    },
    { color: 'var(--paper)', height: 62, width: 38, detail: 'line' },
    { color: 'var(--book-gold)', height: 84, width: 23, detail: 'double' },
    {
      color: 'var(--book-jade)',
      height: 70,
      width: 34,
      lean: 4,
      detail: 'dot',
    },
    { color: 'var(--book-coral)', height: 94, width: 26, detail: 'line' },
    { color: 'var(--book-plum)', height: 68, width: 32, detail: 'double' },
  ],
]

interface BookStyle extends CSSProperties {
  '--book-color': string
  '--book-height': string
  '--book-width': string
  '--book-lean': string
}

function BookSpine({ book }: { book: BookDefinition }) {
  const style: BookStyle = {
    '--book-color': book.color,
    '--book-height': `${book.height}px`,
    '--book-width': `${book.width}px`,
    '--book-lean': `${book.lean ?? 0}deg`,
  }

  return (
    <span className="portal-book" data-book style={style}>
      <span
        className={`portal-book__detail portal-book__detail--${book.detail}`}
      />
    </span>
  )
}

export function LibraryPortal() {
  const portalRef = useRef<HTMLElement>(null)
  const artworkRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const portal = portalRef.current
      const artwork = artworkRef.current

      if (!portal || !artwork) {
        return
      }

      if (typeof window.matchMedia !== 'function') {
        gsap.set('[data-portal-reveal], [data-shelf], [data-book]', {
          clearProps: 'all',
        })
        return
      }

      const media = gsap.matchMedia()

      media.add(
        {
          desktop: '(min-width: 1024px)',
          reducedMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const conditions = context.conditions as {
            desktop: boolean
            reducedMotion: boolean
          }

          if (conditions.reducedMotion) {
            gsap.set('[data-portal-reveal], [data-shelf], [data-book]', {
              clearProps: 'all',
            })
            return
          }

          const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

          timeline
            .from('[data-portal-reveal]', {
              autoAlpha: 0,
              y: 22,
              duration: 0.7,
              stagger: 0.08,
            })
            .from(
              '[data-shelf]',
              { scaleX: 0.3, transformOrigin: 'left center', duration: 0.7 },
              0.1,
            )
            .from(
              '[data-book]',
              {
                autoAlpha: 0,
                y: 70,
                rotation: () => gsap.utils.random(-8, 8),
                duration: 0.75,
                stagger: { amount: 0.7, from: 'random' },
                ease: 'back.out(1.4)',
              },
              0.18,
            )

          gsap.to('[data-float]', {
            y: -10,
            rotation: 2,
            duration: 2.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            stagger: 0.35,
          })

          if (!conditions.desktop) {
            return
          }

          const rotateX = gsap.quickTo(artwork, 'rotationX', {
            duration: 0.7,
            ease: 'power3.out',
          })
          const rotateY = gsap.quickTo(artwork, 'rotationY', {
            duration: 0.7,
            ease: 'power3.out',
          })

          const handlePointerMove = (event: PointerEvent) => {
            const bounds = portal.getBoundingClientRect()
            const x = (event.clientX - bounds.left) / bounds.width - 0.5
            const y = (event.clientY - bounds.top) / bounds.height - 0.5

            rotateX(y * -5)
            rotateY(x * 7)
          }

          const handlePointerLeave = () => {
            rotateX(0)
            rotateY(0)
          }

          portal.addEventListener('pointermove', handlePointerMove)
          portal.addEventListener('pointerleave', handlePointerLeave)

          return () => {
            portal.removeEventListener('pointermove', handlePointerMove)
            portal.removeEventListener('pointerleave', handlePointerLeave)
          }
        },
      )

      return () => media.revert()
    },
    { scope: portalRef },
  )

  return (
    <aside ref={portalRef} className="library-portal" aria-hidden="true">
      <div className="library-portal__noise" />
      <div className="library-portal__orb library-portal__orb--top" />
      <div className="library-portal__orb library-portal__orb--bottom" />

      <div className="library-portal__eyebrow" data-portal-reveal>
        <span>Arquivo pessoal</span>
        <span>Vol. 01</span>
      </div>

      <div ref={artworkRef} className="library-portal__artwork">
        <div className="library-portal__copy" data-portal-reveal>
          <p>Descubra.</p>
          <p>Guarde.</p>
          <p className="library-portal__copy-accent">Viva histórias.</p>
        </div>

        <div className="library-portal__shelves">
          {shelves.map((books, shelfIndex) => (
            <div className="portal-shelf" key={shelfIndex}>
              <div className="portal-shelf__books">
                {books.map((book, bookIndex) => (
                  <BookSpine book={book} key={`${shelfIndex}-${bookIndex}`} />
                ))}
              </div>
              <span className="portal-shelf__board" data-shelf />
            </div>
          ))}
        </div>

        <div className="library-portal__bookmark" data-float>
          <span>Continue</span>
          <span>lendo</span>
        </div>
        <div className="library-portal__spark" data-float>
          ✦
        </div>
      </div>

      <p className="library-portal__footer" data-portal-reveal>
        Sua próxima história já está esperando.
      </p>
    </aside>
  )
}
