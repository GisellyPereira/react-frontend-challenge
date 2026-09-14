import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth'
import {
  useShelfStore,
  useShelfActions,
  type ReadingStatus,
} from '@/features/manage-shelf'
import { BookCoverImage } from '@/entities/book'
import { Input } from '@/shared/ui/input'
import { Library, List, Search, X, ArrowUpRight, Trash2 } from 'lucide-react'
import { ShelfStatus } from './shelf-status'
import { ShelfSortHeader } from './shelf-sort-header'
import { sortBooks, type ShelfSort } from './sort-books'
import { readingLabels } from './reading-labels'
import { Button } from '@/shared/ui/button'
import './shelf.css'
import { ShelfRow } from './shelf-row'
import { distributeBooks, shelfCapacity } from './distribute-books'
import shelfBookmark from '@/shared/assets/shelf-header-bookmark.svg'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/shared/ui/pagination'

const TABLE_PAGE_SIZE = 10

export function ShelfPage() {
  const email = useAuthStore((state) => state.session?.email ?? '')
  const shelves = useShelfStore((state) => state.shelves)
  const { remove, setStatus } = useShelfActions()
  const books = shelves[email.trim().toLowerCase()] ?? []
  const [error, setError] = useState(false)
  const [view, setView] = useState<'shelves' | 'table'>('shelves')
  const [filter, setFilter] = useState<ReadingStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [tablePage, setTablePage] = useState(1)
  const [sort, setSort] = useState<ShelfSort | null>(null)
  const shelfContainer = useRef<HTMLDivElement>(null)
  const [capacity, setCapacity] = useState(1)
  const hasBooks = books.length > 0
  useEffect(() => {
    const element = shelfContainer.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const rem =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      setCapacity(shelfCapacity(entry.contentRect.width, rem))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [hasBooks])
  const visibleBooks = books.filter(
    (book) =>
      (filter === 'all' || book.status === filter) &&
      `${book.title ?? ''} ${book.authors.join(' ')}`
        .toLocaleLowerCase('pt-BR')
        .includes(query.trim().toLocaleLowerCase('pt-BR')),
  )
  const onStatusChange = (id: string, status: ReadingStatus) =>
    setError(!setStatus(email, id, status))
  const totalPages = Math.max(
    1,
    Math.ceil(visibleBooks.length / TABLE_PAGE_SIZE),
  )
  const currentPage = Math.min(tablePage, totalPages)
  const pageStart = (currentPage - 1) * TABLE_PAGE_SIZE
  const tableBooks = sortBooks(visibleBooks, sort).slice(
    pageStart,
    pageStart + TABLE_PAGE_SIZE,
  )
  const onSort = (nextSort: ShelfSort) => {
    setSort(nextSort)
    setTablePage(1)
  }
  const firstVisiblePage = Math.max(
    1,
    Math.min(currentPage - 1, totalPages - 2),
  )
  const pageNumbers = Array.from(
    { length: Math.min(3, totalPages) },
    (_, index) => firstVisiblePage + index,
  )
  const rows = distributeBooks(visibleBooks, capacity)
  return (
    <main className="personal-shelf">
      <header className="personal-shelf__heading">
        <div>
          <p className="personal-shelf__eyebrow">
            Os livros que ficam com você
          </p>
          <h1>
            <span className="personal-shelf__script">Minha</span> estante
          </h1>
          <div className="personal-shelf__summary">
            <p className="personal-shelf__count">
              <Library size={16} aria-hidden="true" />
              {books.length}{' '}
              {books.length === 1 ? 'livro guardado' : 'livros guardados'}
            </p>
          </div>
        </div>
        <img
          className="personal-shelf__illustration"
          src={shelfBookmark}
          alt=""
          aria-hidden="true"
          width="180"
          height="150"
        />
      </header>
      {error && (
        <p role="alert">
          Não foi possível atualizar a estante. Tente novamente.
        </p>
      )}
      {books.length ? (
        <div className="personal-shelf__rows" ref={shelfContainer}>
          <div className="personal-shelf__toolbar">
            <div className="personal-shelf__search-field">
              <Search aria-hidden="true" size={20} />
              <Input
                type="search"
                className="personal-shelf__search"
                aria-label="Buscar na minha estante"
                placeholder="Buscar título ou autoria na sua estante…"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setTablePage(1)
                }}
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Limpar busca"
                  onClick={() => {
                    setQuery('')
                    setTablePage(1)
                  }}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
            <div
              className="personal-shelf__filters"
              role="group"
              aria-label="Filtrar por leitura"
            >
              <Button
                variant="ghost"
                aria-pressed={filter === 'all'}
                onClick={() => {
                  setFilter('all')
                  setTablePage(1)
                }}
              >
                Todos <span>{books.length}</span>
              </Button>
              {Object.entries(readingLabels).map(([value, label]) => (
                <Button
                  key={value}
                  variant="ghost"
                  aria-pressed={filter === value}
                  onClick={() => {
                    setFilter(value as ReadingStatus)
                    setTablePage(1)
                  }}
                >
                  {label}{' '}
                  <span>
                    {books.filter((book) => book.status === value).length}
                  </span>
                </Button>
              ))}
            </div>
            <div
              className="personal-shelf__view"
              role="group"
              aria-label="Visualização da coleção"
            >
              <Button
                variant={view === 'shelves' ? 'secondary' : 'ghost'}
                aria-pressed={view === 'shelves'}
                onClick={() => setView('shelves')}
              >
                <Library size={16} /> Prateleiras
              </Button>
              <Button
                variant={view === 'table' ? 'secondary' : 'ghost'}
                aria-pressed={view === 'table'}
                onClick={() => setView('table')}
              >
                <List size={16} /> Tabela
              </Button>
            </div>
          </div>
          {!visibleBooks.length && (
            <p className="personal-shelf__no-results">
              Nenhum livro nesta seleção. Experimente outro filtro ou busca.
            </p>
          )}
          {view === 'shelves'
            ? rows.map((row, index) => (
                <ShelfRow
                  key={index}
                  books={row}
                  number={index + 1}
                  startIndex={rows
                    .slice(0, index)
                    .reduce((total, item) => total + item.length, 0)}
                  onRemove={(id) => setError(!remove(email, id))}
                  onStatusChange={onStatusChange}
                />
              ))
            : visibleBooks.length > 0 && (
                <div className="personal-shelf__table-scroll">
                  <table className="personal-shelf__table">
                    <caption className="sr-only">
                      Livros da minha estante
                    </caption>
                    <thead>
                      <tr>
                        <ShelfSortHeader
                          field="title"
                          sort={sort}
                          onSort={onSort}
                        />
                        <th scope="col">Publicação</th>
                        <th scope="col">Páginas</th>
                        <ShelfSortHeader
                          field="status"
                          sort={sort}
                          onSort={onSort}
                        />
                        <th scope="col">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableBooks.map((book) => (
                        <tr key={book.id}>
                          <td>
                            <Link
                              className="personal-shelf__table-book"
                              to="/book/$bookId"
                              params={{ bookId: book.id }}
                            >
                              <BookCoverImage
                                book={book}
                                decorative
                                sizes="56px"
                              />
                              <span>
                                <strong>
                                  {book.title || 'Título não informado'}
                                </strong>
                                <small>
                                  {book.authors.join(', ') ||
                                    'Autoria não informada'}
                                </small>
                              </span>
                            </Link>
                          </td>
                          <td>{book.publishedDate?.slice(0, 4) || '—'}</td>
                          <td>{book.pageCount ?? '—'}</td>
                          <td>
                            <ShelfStatus
                              book={book}
                              onChange={onStatusChange}
                            />
                          </td>
                          <td>
                            <div className="personal-shelf__table-actions">
                              <Button
                                variant="ghost"
                                className="personal-shelf__table-details"
                                asChild
                              >
                                <Link
                                  to="/book/$bookId"
                                  params={{ bookId: book.id }}
                                  aria-label={`Ver detalhes de ${book.title || 'livro'}`}
                                >
                                  Detalhes{' '}
                                  <ArrowUpRight size={16} aria-hidden="true" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Remover da estante"
                                aria-label={`Remover ${book.title || 'livro'} da estante`}
                                onClick={() =>
                                  setError(!remove(email, book.id))
                                }
                              >
                                <Trash2 size={16} aria-hidden="true" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          {view === 'table' && visibleBooks.length > 0 && (
            <div className="personal-shelf__pagination">
              <p aria-live="polite">
                Exibindo {pageStart + 1}–{pageStart + tableBooks.length} de{' '}
                {visibleBooks.length} livros
              </p>
              <Pagination aria-label="Paginação da minha estante">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      text="Anterior"
                      aria-label="Página anterior"
                      disabled={currentPage === 1}
                      onClick={() => setTablePage(currentPage - 1)}
                    />
                  </PaginationItem>
                  {pageNumbers.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        aria-label={`Página ${page}`}
                        isActive={page === currentPage}
                        onClick={() => setTablePage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      text="Próxima"
                      aria-label="Próxima página"
                      disabled={currentPage === totalPages}
                      onClick={() => setTablePage(currentPage + 1)}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        <div className="personal-shelf__empty">
          <p>
            Encontrou um livro que chamou sua atenção?
            <br />
            Abra os detalhes e adicione à sua estante.
          </p>
          <Button asChild>
            <Link to="/discover">Encontrar meu próximo livro</Link>
          </Button>
        </div>
      )}
    </main>
  )
}
