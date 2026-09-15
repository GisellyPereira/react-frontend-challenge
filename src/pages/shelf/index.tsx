import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { useAuthStore } from '@/features/auth'
import {
  useShelfStore,
  useShelfActions,
  type SavedBook,
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
const shelfTableFeatures = tableFeatures({
  rowPaginationFeature,
  rowSortingFeature,
  paginatedRowModel: createPaginatedRowModel(),
})
const shelfColumnHelper = createColumnHelper<
  typeof shelfTableFeatures,
  SavedBook
>()

export function ShelfPage() {
  const email = useAuthStore((state) => state.session?.email ?? '')
  const shelves = useShelfStore((state) => state.shelves)
  const { remove, setStatus } = useShelfActions()
  const books = shelves[email.trim().toLowerCase()] ?? []
  const [error, setError] = useState(false)
  const [view, setView] = useState<'shelves' | 'table'>('shelves')
  const [filter, setFilter] = useState<ReadingStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: TABLE_PAGE_SIZE,
  })
  const [shelfPage, setShelfPage] = useState(0)
  const [sort, setSort] = useState<ShelfSort | null>(null)
  const shelfContainer = useRef<HTMLDivElement>(null)
  const [capacity, setCapacity] = useState(1)
  const hasBooks = books.length > 0
  useEffect(() => {
    const element = shelfContainer.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const compact = window.matchMedia?.('(max-width: 600px)').matches ?? false
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const rem =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      setCapacity(shelfCapacity(entry.contentRect.width, rem, compact))
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
  const tableData = useMemo(
    () => sortBooks(visibleBooks, sort),
    [sort, visibleBooks],
  )
  const totalPages = Math.max(
    1,
    Math.ceil(tableData.length / pagination.pageSize),
  )
  const currentPage = Math.min(pagination.pageIndex + 1, totalPages)
  const effectivePageIndex = currentPage - 1
  const pageStart = effectivePageIndex * pagination.pageSize
  const tablePageData = tableData.slice(
    pageStart,
    pageStart + pagination.pageSize,
  )
  const columns = useMemo(
    () =>
      shelfColumnHelper.columns([
        shelfColumnHelper.accessor('title', {
          id: 'title',
          header: 'Título',
          cell: ({ row }) => {
            const book = row.original
            return (
              <Link
                className="personal-shelf__table-book"
                to="/book/$bookId"
                params={{ bookId: book.id }}
              >
                <BookCoverImage book={book} decorative sizes="56px" />
                <span>
                  <strong>{book.title || 'Título não informado'}</strong>
                  <small>
                    {book.authors.join(', ') || 'Autoria não informada'}
                  </small>
                </span>
              </Link>
            )
          },
        }),
        shelfColumnHelper.accessor('publishedDate', {
          id: 'publishedDate',
          header: 'Publicação',
          cell: ({ getValue }) => getValue()?.slice(0, 4) || '—',
          enableSorting: false,
        }),
        shelfColumnHelper.accessor('pageCount', {
          id: 'pageCount',
          header: 'Páginas',
          cell: ({ getValue }) => getValue() ?? '—',
          enableSorting: false,
        }),
        shelfColumnHelper.accessor('status', {
          id: 'status',
          header: 'Status',
          cell: ({ row }) => (
            <ShelfStatus
              book={row.original}
              onChange={(id, status) => setError(!setStatus(email, id, status))}
            />
          ),
        }),
        shelfColumnHelper.display({
          id: 'actions',
          header: 'Ações',
          cell: ({ row }) => {
            const book = row.original
            return (
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
                    Detalhes <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Remover da estante"
                  aria-label={`Remover ${book.title || 'livro'} da estante`}
                  onClick={() => setError(!remove(email, book.id))}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </Button>
              </div>
            )
          },
        }),
      ]),
    [email, remove, setStatus],
  )
  const sorting = useMemo<SortingState>(
    () => (sort ? [{ id: sort.field, desc: sort.direction === 'desc' }] : []),
    [sort],
  )
  const table = useTable(
    {
      features: shelfTableFeatures,
      columns,
      data: tablePageData,
      manualPagination: true,
      manualSorting: true,
      rowCount: tableData.length,
      state: { pagination, sorting },
      onPaginationChange: setPagination,
    },
    (state) => ({ pagination: state.pagination }),
  )
  const tableRows = table.getRowModel().rows
  const onSort = (nextSort: ShelfSort) => {
    setSort(nextSort)
    setPagination((current) => ({ ...current, pageIndex: 0 }))
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
  const activeShelfPage = Math.min(shelfPage, Math.max(0, rows.length - 1))
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
                  setPagination((current) => ({ ...current, pageIndex: 0 }))
                }}
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Limpar busca"
                  onClick={() => {
                    setQuery('')
                    setPagination((current) => ({ ...current, pageIndex: 0 }))
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
                  setPagination((current) => ({ ...current, pageIndex: 0 }))
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
                    setPagination((current) => ({ ...current, pageIndex: 0 }))
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
          {view === 'shelves' ? (
            <div className="personal-shelf__shelf-carousel">
              <div className="personal-shelf__shelf-track">
                {rows.map((row, index) => (
                  <ShelfRow
                    key={index}
                    books={row}
                    number={index + 1}
                    carouselActive={index === activeShelfPage}
                    startIndex={rows
                      .slice(0, index)
                      .reduce((total, item) => total + item.length, 0)}
                    onRemove={(id) => setError(!remove(email, id))}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
              {rows.length > 1 && (
                <div
                  className="personal-shelf__shelf-pagination"
                  aria-label="Navegação das prateleiras"
                >
                  <Button
                    variant="ghost"
                    aria-label="Prateleira anterior"
                    disabled={activeShelfPage === 0}
                    onClick={() =>
                      setShelfPage((current) => Math.max(0, current - 1))
                    }
                  >
                    Anterior
                  </Button>
                  <span aria-live="polite">
                    {activeShelfPage + 1} / {rows.length}
                  </span>
                  <Button
                    variant="ghost"
                    aria-label="Próxima prateleira"
                    disabled={activeShelfPage === rows.length - 1}
                    onClick={() =>
                      setShelfPage((current) =>
                        Math.min(rows.length - 1, current + 1),
                      )
                    }
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          ) : (
            visibleBooks.length > 0 && (
              <div className="personal-shelf__table-scroll">
                <table className="personal-shelf__table">
                  <caption className="sr-only">Livros da minha estante</caption>
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) =>
                          header.column.id === 'title' ||
                          header.column.id === 'status' ? (
                            <ShelfSortHeader
                              key={header.id}
                              field={header.column.id}
                              sort={sort}
                              onSort={onSort}
                            />
                          ) : (
                            <th key={header.id} scope="col">
                              <table.FlexRender header={header} />
                            </th>
                          ),
                        )}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.id}>
                        {row.getAllCells().map((cell) => (
                          <td key={cell.id}>
                            <table.FlexRender cell={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
          {view === 'table' && visibleBooks.length > 0 && (
            <div className="personal-shelf__pagination">
              <p aria-live="polite">
                Exibindo {pageStart + 1}–{pageStart + tableRows.length} de{' '}
                {visibleBooks.length} livros
              </p>
              <Pagination aria-label="Paginação da minha estante">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      text="Anterior"
                      aria-label="Página anterior"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setPagination((current) => ({
                          ...current,
                          pageIndex: effectivePageIndex - 1,
                        }))
                      }
                    />
                  </PaginationItem>
                  {pageNumbers.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        aria-label={`Página ${page}`}
                        isActive={page === currentPage}
                        onClick={() =>
                          setPagination((current) => ({
                            ...current,
                            pageIndex: page - 1,
                          }))
                        }
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
                      onClick={() =>
                        setPagination((current) => ({
                          ...current,
                          pageIndex: effectivePageIndex + 1,
                        }))
                      }
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
