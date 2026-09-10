import { ArrowRight } from 'lucide-react'

import './discover-topics.css'

interface DiscoverTopicsProps {
  onQueryChange: (query: string) => void
}

const SEARCH_SUGGESTIONS = [
  { label: 'Literatura brasileira', tone: 'coral' },
  { label: 'Romance', tone: 'blue' },
  { label: 'Fantasia', tone: 'gold' },
  { label: 'Ficção científica', tone: 'teal' },
  { label: 'Mistério e suspense', tone: 'wine' },
  { label: 'Terror', tone: 'rose' },
  { label: 'Poesia', tone: 'olive' },
  { label: 'Clássicos', tone: 'sand' },
  { label: 'Contos', tone: 'coral' },
  { label: 'Biografias', tone: 'blue' },
  { label: 'História', tone: 'gold' },
  { label: 'Filosofia', tone: 'teal' },
  { label: 'Psicologia', tone: 'wine' },
  { label: 'Ciência', tone: 'rose' },
  { label: 'Tecnologia', tone: 'olive' },
  { label: 'Design', tone: 'sand' },
  { label: 'Negócios', tone: 'coral' },
  { label: 'Infantojuvenil', tone: 'blue' },
  { label: 'HQs e mangás', tone: 'gold' },
  { label: 'Saúde e bem-estar', tone: 'teal' },
  { label: 'Culinária', tone: 'wine' },
  { label: 'Artes', tone: 'rose' },
  { label: 'Educação', tone: 'olive' },
  { label: 'Viagens', tone: 'sand' },
]

const SUGGESTION_PATTERNS = ['circle', 'lines', 'arch', 'block'] as const

export function DiscoverTopics({ onQueryChange }: DiscoverTopicsProps) {
  return (
    <section
      aria-labelledby="subject-suggestions-title"
      className="discover-topics"
      data-discover-reveal
    >
      <h2 className="sr-only" id="subject-suggestions-title">
        Assuntos para explorar
      </h2>

      <div className="discover-suggestions">
        {SEARCH_SUGGESTIONS.map((suggestion, index) => (
          <button
            aria-label={`Pesquisar por ${suggestion.label}`}
            className="discover-suggestion"
            data-pattern={
              SUGGESTION_PATTERNS[index % SUGGESTION_PATTERNS.length]
            }
            data-tone={suggestion.tone}
            key={suggestion.label}
            type="button"
            onClick={() => onQueryChange(suggestion.label)}
          >
            <span aria-hidden="true" className="discover-suggestion__number">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              aria-hidden="true"
              className="discover-suggestion__ornament"
            />
            <span className="discover-suggestion__label">
              {suggestion.label}
            </span>
            <span aria-hidden="true" className="discover-suggestion__arrow">
              <ArrowRight aria-hidden="true" className="size-5" />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
