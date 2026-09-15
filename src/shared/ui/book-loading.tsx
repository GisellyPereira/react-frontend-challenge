import './book-loading.css'

type BookLoadingProps = {
  title?: string
  description?: string
  compact?: boolean
}

export function BookLoading({
  title = 'Abrindo o livro…',
  description = 'Estamos reunindo os detalhes desta edição.',
  compact = false,
}: BookLoadingProps) {
  return (
    <div
      className={
        compact ? 'book-loading book-loading--compact' : 'book-loading'
      }
      role="status"
      aria-live="polite"
    >
      <div className="book-loading__illustration" aria-hidden="true">
        <span className="book-loading__spark book-loading__spark--one">✦</span>
        <span className="book-loading__spark book-loading__spark--two">✧</span>
        <svg className="book-loading__book" viewBox="0 0 180 120" fill="none">
          <ellipse
            cx="90"
            cy="108"
            rx="64"
            ry="6"
            fill="currentColor"
            opacity=".08"
          />
          <path
            d="M18 29Q51 17 90 35Q129 17 162 29L162 97Q126 87 90 104Q54 87 18 97Z"
            fill="var(--book-teal)"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M24 22Q57 13 90 30Q123 13 156 22V89Q123 80 90 97Q57 80 24 89Z"
            fill="var(--paper)"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M90 30V97M35 37Q57 33 78 42M35 49Q57 45 78 54M35 61Q57 57 78 66M102 42Q123 33 145 37M102 54Q123 45 145 49M102 66Q123 57 145 61"
            stroke="currentColor"
            opacity=".35"
            strokeLinecap="round"
          />
          <path d="M127 20V51L134 45L141 48V20" fill="var(--book-coral)" />
          <g className="book-loading__page">
            <path
              d="M90 30Q123 13 156 22V89Q123 80 90 97Z"
              fill="var(--paper)"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M103 42Q123 33 145 37M103 54Q123 45 145 49M103 66Q123 57 145 61"
              stroke="currentColor"
              opacity=".3"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
      <p className="book-loading__eyebrow">Só mais um instante</p>
      <p className="book-loading__title">{title}</p>
      <p className="book-loading__description">{description}</p>
      <div className="book-loading__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}
