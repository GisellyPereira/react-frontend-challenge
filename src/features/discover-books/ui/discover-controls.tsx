import { useForm } from '@tanstack/react-form'
import { Search, X } from 'lucide-react'
import { useEffect } from 'react'

import {
  bookOrderBySchema,
  bookPrintTypeSchema,
  type BookOrderBy,
  type BookPrintType,
} from '@/entities/book'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { RadialFillButton } from '@/shared/ui/radial-fill-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import type { DiscoverSearch } from '../model/discover-search'

interface DiscoverFilters {
  orderBy: BookOrderBy
  printType: BookPrintType
}

interface DiscoverControlsProps {
  onFiltersChange: (filters: Partial<DiscoverFilters>) => void
  onQueryChange: (query: string) => void
  search: DiscoverSearch
}

const popularSearches = [
  'Romance',
  'Fantasia',
  'Mais lidos',
  'Clássicos',
  'Biografias',
] as const

export function DiscoverControls({
  onFiltersChange,
  onQueryChange,
  search,
}: DiscoverControlsProps) {
  const form = useForm({
    defaultValues: {
      orderBy: search.orderBy,
      printType: search.printType,
    } satisfies DiscoverFilters,
  })

  useEffect(() => {
    form.reset({
      orderBy: search.orderBy,
      printType: search.printType,
    })
  }, [form, search.orderBy, search.printType])

  return (
    <section aria-label="Busca e filtros" className="discover-controls">
      <form
        className="discover-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          const query = new FormData(event.currentTarget).get('q')

          onQueryChange(typeof query === 'string' ? query.trim() : '')
        }}
      >
        <div className="discover-search__field">
          <Label className="sr-only" htmlFor="book-search">
            Pesquisar no catálogo
          </Label>
          <span aria-hidden="true" className="discover-search__icon">
            <Search />
          </span>
          <Input
            autoComplete="off"
            className="discover-search__input"
            id="book-search"
            name="q"
            placeholder="Título, autoria ou assunto"
            type="search"
            value={search.q}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          {search.q.length > 0 ? (
            <button
              aria-label="Limpar pesquisa"
              className="discover-search__clear"
              type="button"
              onClick={() => onQueryChange('')}
            >
              <X />
            </button>
          ) : null}
        </div>

        <RadialFillButton
          className="discover-search__submit border-transparent hover:border-transparent focus-visible:border-transparent focus-visible:ring-0"
          type="submit"
        >
          Buscar
        </RadialFillButton>
      </form>

      <div
        aria-label="Buscas populares"
        className="discover-popular-searches"
        role="group"
      >
        <span className="discover-popular-searches__label">
          Buscas populares:
        </span>
        <div className="discover-popular-searches__list">
          {popularSearches.map((term) => (
            <Button
              className="discover-popular-searches__button"
              key={term}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => onQueryChange(term)}
            >
              {term}
            </Button>
          ))}
        </div>
      </div>

      <fieldset className="discover-filters">
        <legend className="sr-only">Filtros da pesquisa</legend>
        <form.Field name="printType">
          {(field) => (
            <div className="discover-filter min-w-0">
              <Label className="discover-filter__label" htmlFor="print-type">
                Tipo de publicação
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  const printType = bookPrintTypeSchema.parse(value)

                  field.handleChange(printType)
                  onFiltersChange({ printType })
                }}
              >
                <SelectTrigger
                  className="discover-filter__trigger"
                  id="print-type"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">Livros e revistas</SelectItem>
                  <SelectItem value="books">Somente livros</SelectItem>
                  <SelectItem value="magazines">Somente revistas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="orderBy">
          {(field) => (
            <div className="discover-filter min-w-0">
              <Label className="discover-filter__label" htmlFor="order-by">
                Ordenar por
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  const orderBy = bookOrderBySchema.parse(value)

                  field.handleChange(orderBy)
                  onFiltersChange({ orderBy })
                }}
              >
                <SelectTrigger
                  className="discover-filter__trigger"
                  id="order-by"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="relevance">Mais relevantes</SelectItem>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
      </fieldset>
    </section>
  )
}
