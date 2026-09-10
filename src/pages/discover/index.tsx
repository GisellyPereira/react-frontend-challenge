import { useRef } from 'react'
import { getRouteApi } from '@tanstack/react-router'

import {
  DiscoverControls,
  DiscoverTopics,
  type DiscoverSearch,
} from '@/features/discover-books'
import heroBookStoriesUrl from '@/shared/assets/discover-hero-book-stories.svg'
import heroBookmarksUrl from '@/shared/assets/discover-hero-bookmarks.svg'
import heroDailyStoriesUrl from '@/shared/assets/discover-hero-daily-stories.svg'
import discoverShelfAccentUrl from '@/shared/assets/discover-shelf-accent.svg'
import { gsap, useGSAP } from '@/shared/lib/gsap'
import { BookResults } from '@/widgets/book-results'

import './discover.css'

const discoverRouteApi = getRouteApi('/_authenticated/discover')

interface DiscoverPageProps {
  onFiltersChange: (
    filters: Partial<Pick<DiscoverSearch, 'orderBy' | 'printType'>>,
  ) => void
  onPageChange: (startIndex: number) => void
  onQueryChange: (query: string) => void
  search: DiscoverSearch
}

interface HeroArtworkProps {
  assetUrl: string
}

function HeroArtwork({ assetUrl }: HeroArtworkProps) {
  return <img alt="" aria-hidden="true" draggable="false" src={assetUrl} />
}

export function DiscoverRoutePage() {
  const navigate = discoverRouteApi.useNavigate()
  const search = discoverRouteApi.useSearch()

  return (
    <DiscoverPage
      search={search}
      onFiltersChange={(filters) => {
        void navigate({
          search: (previous) => ({
            ...previous,
            ...filters,
            startIndex: 0,
          }),
        })
      }}
      onPageChange={(startIndex) => {
        void navigate({
          search: (previous) => ({ ...previous, startIndex }),
        }).then(() => {
          document
            .getElementById('book-results-title')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }}
      onQueryChange={(q) => {
        void navigate({
          replace: true,
          search: (previous) => ({ ...previous, q, startIndex: 0 }),
        })
      }}
    />
  )
}

export function DiscoverPage({
  onFiltersChange,
  onPageChange,
  onQueryChange,
  search,
}: DiscoverPageProps) {
  const pageRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (typeof window.matchMedia !== 'function') {
        return
      }

      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

        timeline
          .from('[data-hero-ornament]', {
            autoAlpha: 0,
            duration: 0.8,
            scale: 0.88,
            stagger: 0.12,
            y: 12,
          })
          .from(
            '[data-discover-reveal]',
            {
              autoAlpha: 0,
              duration: 0.72,
              stagger: 0.09,
              y: 16,
            },
            0.12,
          )
      })

      return () => media.revert()
    },
    { scope: pageRef },
  )

  return (
    <main className="discover-page min-h-[calc(100svh-4.5rem)]" ref={pageRef}>
      <section className="discover-hero">
        <div className="discover-hero__inner">
          <div
            aria-hidden="true"
            className="discover-hero__ornament discover-hero__ornament--left"
            data-hero-ornament
          >
            <HeroArtwork assetUrl={heroBookStoriesUrl} />
          </div>

          <div className="discover-hero__content">
            <header className="discover-hero__copy" data-discover-reveal>
              <h1 className="discover-hero__title">
                Que livro entra na sua <span>estante agora?</span>
              </h1>
              <p className="discover-hero__description">
                Comece por um título, uma autoria ou um assunto.
              </p>
            </header>

            <div className="discover-hero__controls" data-discover-reveal>
              <DiscoverControls
                onFiltersChange={onFiltersChange}
                onQueryChange={onQueryChange}
                search={search}
              />
            </div>
          </div>

          <div
            aria-hidden="true"
            className="discover-hero__ornament discover-hero__ornament--right"
            data-hero-ornament
          >
            <HeroArtwork assetUrl={heroBookmarksUrl} />
          </div>

          <div
            aria-hidden="true"
            className="discover-hero__ornament discover-hero__ornament--daily"
            data-hero-ornament
          >
            <HeroArtwork assetUrl={heroDailyStoriesUrl} />
          </div>
        </div>
      </section>

      <div className="discover-catalog">
        <section
          aria-labelledby="discover-start-title"
          className="discover-browser"
        >
          <header className="discover-browser__header" data-discover-reveal>
            <h2 className="discover-browser__title" id="discover-start-title">
              Escolha por onde começar.
            </h2>
            <p className="discover-browser__description">
              Escolha uma capa para pesquisar aquele assunto no catálogo.
            </p>
          </header>

          <div className="discover-browser__shelf">
            <img
              alt="Sua próxima leitura pode estar aqui."
              className="discover-browser__shelf-artwork"
              decoding="async"
              draggable="false"
              height="280"
              src={discoverShelfAccentUrl}
              width="1406"
            />
          </div>
        </section>

        {search.q.trim().length === 0 ? (
          <DiscoverTopics onQueryChange={onQueryChange} />
        ) : null}

        <BookResults onPageChange={onPageChange} search={search} />
      </div>
    </main>
  )
}
