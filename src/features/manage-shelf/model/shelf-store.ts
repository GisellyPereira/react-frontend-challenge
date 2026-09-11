import { create } from 'zustand'
import { z } from 'zod'
import type { Book } from '@/entities/book'

const savedBookSchema = z.object({
  id: z.string().min(1),
  title: z.string().nullable(),
  authors: z.array(z.string()),
  cover: z.object({
    large: z.string().url().nullable(),
    small: z.string().url().nullable(),
  }),
  publishedDate: z.string().nullable(),
})
export type SavedBook = z.infer<typeof savedBookSchema>
const shelvesSchema = z.record(z.string(), z.array(savedBookSchema))
export const SHELF_STORAGE_KEY = 'libris:shelves:v1'
const accountKey = (email: string) => email.trim().toLowerCase()

export function readShelves(): Record<string, SavedBook[]> {
  try {
    const data = shelvesSchema.safeParse(
      JSON.parse(localStorage.getItem(SHELF_STORAGE_KEY) || '{}'),
    )
    return data.success ? data.data : {}
  } catch {
    return {}
  }
}

interface ShelfState {
  shelves: Record<string, SavedBook[]>
  add: (email: string, book: Book) => boolean
  remove: (email: string, id: string) => boolean
}

export const useShelfStore = create<ShelfState>((set, get) => {
  const save = (shelves: ShelfState['shelves']) => {
    try {
      localStorage.setItem(SHELF_STORAGE_KEY, JSON.stringify(shelves))
      set({ shelves })
      return true
    } catch {
      return false
    }
  }
  return {
    shelves: readShelves(),
    add: (email, book) => {
      const key = accountKey(email)
      if (!key) return false
      const books = get().shelves[key] ?? []
      if (books.some((item) => item.id === book.id)) return true
      return save({
        ...get().shelves,
        [key]: [savedBookSchema.parse(book), ...books],
      })
    },
    remove: (email, id) => {
      const key = accountKey(email)
      return save({
        ...get().shelves,
        [key]: (get().shelves[key] ?? []).filter((book) => book.id !== id),
      })
    },
  }
})

export function restoreBook(saved: SavedBook): Book {
  return {
    ...saved,
    categories: [],
    averageRating: null,
    ratingsCount: null,
    description: null,
    infoUrl: null,
    language: null,
    pageCount: null,
    previewUrl: null,
    publisher: null,
    subtitle: null,
  }
}
