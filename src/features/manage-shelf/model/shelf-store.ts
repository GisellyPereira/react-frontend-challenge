import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
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
  status: z.enum(['want-to-read', 'reading', 'read']).catch('want-to-read'),
  pageCount: z.number().nullable().catch(null),
  categories: z.array(z.string()).catch([]),
})
export type SavedBook = z.infer<typeof savedBookSchema>
export type ReadingStatus = SavedBook['status']
const shelvesSchema = z.record(z.string(), z.array(savedBookSchema))
const persistedShelfSchema = z.object({ shelves: shelvesSchema })
type PersistedShelf = z.infer<typeof persistedShelfSchema>
export const SHELF_STORAGE_KEY = 'libris:shelves:v1'
const accountKey = (email: string) => email.trim().toLowerCase()

const shelfStorage = createJSONStorage<PersistedShelf>(
  () => ({
    getItem: (name) => localStorage.getItem(name),
    setItem: (name, value) => localStorage.setItem(name, value),
    removeItem: (name) => localStorage.removeItem(name),
  }),
  {
    reviver: (key, value: unknown) => {
      if (key !== '') return value
      const legacy = shelvesSchema.safeParse(value)
      return legacy.success
        ? { state: { shelves: legacy.data }, version: 0 }
        : value
    },
  },
)

interface ShelfState {
  shelves: Record<string, SavedBook[]>
  add: (email: string, book: Book) => boolean
  remove: (email: string, id: string) => boolean
  setStatus: (email: string, id: string, status: ReadingStatus) => boolean
}

export const useShelfStore = create<ShelfState>()(
  persist(
    (set, get) => {
      const save = (shelves: ShelfState['shelves']) => {
        const previousShelves = get().shelves
        try {
          set({ shelves })
          return true
        } catch {
          try {
            set({ shelves: previousShelves })
          } catch {
            return false
          }
          return false
        }
      }
      return {
        shelves: {},
        setStatus: (email, id, status) => {
          const key = accountKey(email)
          const books = get().shelves[key] ?? []
          if (!books.some((book) => book.id === id)) return false
          return save({
            ...get().shelves,
            [key]: books.map((book) =>
              book.id === id ? { ...book, status } : book,
            ),
          })
        },
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
    },
    {
      name: SHELF_STORAGE_KEY,
      version: 1,
      storage: shelfStorage,
      partialize: ({ shelves }) => ({ shelves }),
      migrate: (persisted, version) => {
        if (version !== 0) throw new Error('Versão da estante não suportada')
        return persistedShelfSchema.parse(persisted)
      },
      merge: (persisted, current) => {
        const parsed = persistedShelfSchema.safeParse(persisted)
        return { ...current, ...(parsed.success ? parsed.data : {}) }
      },
    },
  ),
)

export function restoreBook(saved: SavedBook): Book {
  return {
    ...saved,
    averageRating: null,
    ratingsCount: null,
    description: null,
    infoUrl: null,
    language: null,
    previewUrl: null,
    publisher: null,
    subtitle: null,
  }
}
