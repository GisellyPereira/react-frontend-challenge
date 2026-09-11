import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
import './discover-results.css'

const discoverRouteApi = getRouteApi('/_authenticated/discover')

interface DiscoverPageProps {
  onFiltersChange: (
    filters: Partial<Pick<DiscoverSearch, 'orderBy' | 'printType'>>,
  ) => void
  onPageChange: (startIndex: number) => void
  onSearchSubmit: (query: string) => void
  resultsScrollRequest: number
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
  const [resultsScrollRequest, setResultsScrollRequest] = useState(0)

  const requestResultsScroll = () => {
    setResultsScrollRequest((request) => request + 1)
  }

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
        }).then(requestResultsScroll)
      }}
      onSearchSubmit={(query) => {
        const q = query.trim()

        void navigate({
          search: (previous) => ({ ...previous, q, startIndex: 0 }),
        }).then(() => {
          if (q.length > 0) {
            requestResultsScroll()
          }
        })
      }}
      resultsScrollRequest={resultsScrollRequest}
    />
  )
}

function DiscoverSearchForm({
  search,
  onFiltersChange,
  onSearchSubmit,
  variant = 'home',
}: Pick<DiscoverPageProps, 'search' | 'onFiltersChange' | 'onSearchSubmit'> & {
  variant?: 'home' | 'results'
}) {
  const [query, setQuery] = useState(search.q)

  return (
    <DiscoverControls
      onFiltersChange={onFiltersChange}
      onQueryChange={setQuery}
      onSearchSubmit={onSearchSubmit}
      search={{ ...search, q: query }}
      variant={variant}
    />
  )
}

export function DiscoverPage({
  onFiltersChange,
  onPageChange,
  onSearchSubmit,
  resultsScrollRequest,
  search,
}: DiscoverPageProps) {
  const pageRef = useRef<HTMLElement>(null)
  const hasSearch = search.q.trim().length > 0

  useEffect(() => {
    if (resultsScrollRequest === 0 || search.q.trim().length === 0) {
      return
    }

    document.getElementById('discover-results')?.scrollIntoView({
      behavior: 'instant',
      block: 'start',
    })
    document
      .getElementById('discover-results-heading')
      ?.focus({ preventScroll: true })
  }, [resultsScrollRequest, search.q])

  useGSAP(
    () => {
      if (hasSearch || typeof window.matchMedia !== 'function') {
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
    { scope: pageRef, dependencies: [hasSearch], revertOnUpdate: true },
  )

  if (hasSearch) {
    return (
      <main
        className="discover-page discover-results-page min-h-[calc(100svh-4.5rem)]"
        ref={pageRef}
      >
        <div
          className="discover-catalog discover-catalog--results discover-results-anchor"
          id="discover-results"
        >
          <header className="discover-results-header">
            <div>
              <button
                className="discover-results-header__back"
                type="button"
                onClick={() => onSearchSubmit('')}
              >
                <ArrowLeft aria-hidden="true" /> Voltar para descobrir
              </button>
              <h1
                className="discover-results-header__title"
                id="discover-results-heading"
                tabIndex={-1}
              >
                <span className="discover-script">Só mais</span> um capítulo?
              </h1>
              <p className="discover-results-header__description">
                Encontre uma história que dá vontade de continuar.
              </p>
            </div>
            <div className="discover-results-header__search">
              <DiscoverSearchForm
                key={search.q}
                onFiltersChange={onFiltersChange}
                onSearchSubmit={onSearchSubmit}
                search={search}
                variant="results"
              />
            </div>
          </header>
          <BookResults onPageChange={onPageChange} search={search} />
        </div>
      </main>
    )
  }

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
                <span className="discover-hero__line">
                  <span className="discover-script">Que</span> livro entra na
                </span>{' '}
                <span className="discover-hero__line">sua estante agora?</span>
              </h1>
              <p className="discover-hero__description">
                Comece por um título, uma autoria ou um assunto.
              </p>
            </header>

            <div className="discover-hero__controls" data-discover-reveal>
              <DiscoverSearchForm
                key={search.q}
                onFiltersChange={onFiltersChange}
                onSearchSubmit={onSearchSubmit}
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
        <section aria-label="Estante de sugestões" className="discover-browser">
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
          <header className="discover-browser__intro" data-discover-reveal>
            <h2 className="discover-browser__title">
              <span className="discover-script">Explore</span>
              <br />
              novos temas.
            </h2>
            <p className="discover-browser__description">
              Escolha uma capa e encontre sua próxima leitura.
            </p>
          </header>
        </section>

        <DiscoverTopics onQueryChange={onSearchSubmit} />
      </div>
    </main>
  )
}
