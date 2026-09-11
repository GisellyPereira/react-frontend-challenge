import './discover-topics.css'

interface DiscoverTopicsProps {
  onQueryChange: (query: string) => void
}

const COVER_ASSETS = import.meta.glob<string>(
  '/src/shared/assets/topic-covers/*.svg',
  { eager: true, query: '?url', import: 'default' },
)

const SEARCH_SUGGESTIONS = [
  {
    label: 'Literatura brasileira',
    tone: 'coral',
    cover: 'literatura-brasileira',
    subtitle: 'Vozes do nosso país',
  },
  {
    label: 'Romance',
    tone: 'blue',
    cover: 'romance',
    subtitle: 'Grandes encontros',
  },
  {
    label: 'Fantasia',
    tone: 'gold',
    cover: 'fantasia',
    subtitle: 'Além do possível',
  },
  {
    label: 'Ficção científica',
    tone: 'teal',
    cover: 'ficcao-cientifica',
    subtitle: 'Ideias sem fronteiras',
  },
  {
    label: 'Mistério e suspense',
    tone: 'wine',
    cover: 'misterio-e-suspense',
    subtitle: 'Segredos em cada página',
  },
  {
    label: 'Terror',
    tone: 'rose',
    cover: 'terror',
    subtitle: 'O desconhecido te espera',
  },
  {
    label: 'Poesia',
    tone: 'olive',
    cover: 'poesia',
    subtitle: 'Sentimentos em palavras',
  },
  {
    label: 'Clássicos',
    tone: 'sand',
    cover: 'classicos',
    subtitle: 'Histórias atemporais',
  },
  {
    label: 'Contos',
    tone: 'coral',
    cover: 'contos',
    subtitle: 'Pequenas grandes histórias',
  },
  {
    label: 'Biografias',
    tone: 'blue',
    cover: 'biografias',
    subtitle: 'Vidas que inspiram',
  },
  {
    label: 'História',
    tone: 'gold',
    cover: 'historia',
    subtitle: 'O passado explica hoje',
  },
  {
    label: 'Filosofia',
    tone: 'teal',
    cover: 'filosofia',
    subtitle: 'Perguntas essenciais',
  },
  {
    label: 'Psicologia',
    tone: 'wine',
    cover: 'psicologia',
    subtitle: 'Por dentro de nós',
  },
  {
    label: 'Ciência',
    tone: 'rose',
    cover: 'ciencia',
    subtitle: 'Descobertas que transformam',
  },
  {
    label: 'Tecnologia',
    tone: 'olive',
    cover: 'tecnologia',
    subtitle: 'O amanhã começa aqui',
  },
  {
    label: 'Design',
    tone: 'sand',
    cover: 'design',
    subtitle: 'Ideias em forma',
  },
  {
    label: 'Negócios',
    tone: 'coral',
    cover: 'negocios',
    subtitle: 'Caminhos para crescer',
  },
  {
    label: 'Infantojuvenil',
    tone: 'blue',
    cover: 'infantojuvenil',
    subtitle: 'Pequenos grandes mundos',
  },
  {
    label: 'HQs e mangás',
    tone: 'gold',
    cover: 'hqs-e-mangas',
    subtitle: 'Histórias em quadrinhos',
  },
  {
    label: 'Saúde e bem-estar',
    tone: 'teal',
    cover: 'saude-e-bem-estar',
    subtitle: 'Uma vida mais leve',
  },
  {
    label: 'Culinária',
    tone: 'wine',
    cover: 'culinaria',
    subtitle: 'Sabores e memórias',
  },
  {
    label: 'Artes',
    tone: 'rose',
    cover: 'artes',
    subtitle: 'Um mundo de expressão',
  },
  {
    label: 'Educação',
    tone: 'olive',
    cover: 'educacao',
    subtitle: 'Aprender é descobrir',
  },
  {
    label: 'Viagens',
    tone: 'sand',
    cover: 'viagens',
    subtitle: 'Novos lugares e olhares',
  },
]

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
            data-tone={suggestion.tone}
            key={suggestion.label}
            type="button"
            onClick={() => onQueryChange(suggestion.label)}
          >
            <img
              alt=""
              aria-hidden="true"
              className="discover-suggestion__artwork"
              draggable={false}
              height={280}
              src={
                COVER_ASSETS[
                  `/src/shared/assets/topic-covers/${suggestion.cover}.svg`
                ]
              }
              width={220}
            />
            <span aria-hidden="true" className="discover-suggestion__number">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="discover-suggestion__label">
              {suggestion.label}
            </span>
            <span aria-hidden="true" className="discover-suggestion__subtitle">
              {suggestion.subtitle}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
