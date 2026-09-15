import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { parseGoogleVolume } from '@/entities/book/api/map-google-volume'
import { useShelfStore, SHELF_STORAGE_KEY } from './shelf-store'

const book = parseGoogleVolume({
  id: 'book-1',
  volumeInfo: { title: 'Dom Casmurro' },
})
const otherBook = parseGoogleVolume({
  id: 'book-2',
  volumeInfo: { title: 'Água viva', authors: ['Clarice Lispector'] },
})
const legacyBook = {
  id: book.id,
  title: book.title,
  authors: book.authors,
  cover: book.cover,
  publishedDate: book.publishedDate,
}

async function reloadShelf() {
  vi.resetModules()
  return (await import('./shelf-store')).useShelfStore
}

beforeEach(() => {
  useShelfStore.setState({ shelves: {} })
  localStorage.clear()
})
afterEach(() => vi.restoreAllMocks())

describe('estante com persist do Zustand', () => {
  it('persiste somente as coleções no envelope versionado do middleware', () => {
    const store = useShelfStore.getState()
    store.add('teste@libris.com', book)

    expect(
      JSON.parse(localStorage.getItem(SHELF_STORAGE_KEY) || 'null'),
    ).toEqual({
      state: { shelves: useShelfStore.getState().shelves },
      version: 1,
    })
    expect(useShelfStore.persist.hasHydrated()).toBe(true)
  })

  it('restaura livros e status por conta ao recriar o store', async () => {
    const store = useShelfStore.getState()
    store.add('teste@libris.com', book)
    store.add('outra@libris.com', book)
    expect(store.setStatus('teste@libris.com', book.id, 'reading')).toBe(true)

    const reloaded = await reloadShelf()
    expect(reloaded.persist.hasHydrated()).toBe(true)
    expect(reloaded.getState().shelves['teste@libris.com']?.[0]?.status).toBe(
      'reading',
    )
    expect(reloaded.getState().shelves['outra@libris.com']?.[0]?.status).toBe(
      'want-to-read',
    )
    expect(
      reloaded.getState().setStatus('teste@libris.com', 'inexistente', 'read'),
    ).toBe(false)
  })

  it('normaliza a conta, evita duplicatas e mantém remoções após refresh', async () => {
    const store = useShelfStore.getState()
    expect(store.add(' TESTE@libris.com ', book)).toBe(true)
    expect(store.add('teste@libris.com', book)).toBe(true)
    expect(useShelfStore.getState().shelves['teste@libris.com']).toHaveLength(1)
    expect(store.add(' ', book)).toBe(false)
    store.add('teste@libris.com', otherBook)
    store.add('outra@libris.com', book)
    expect(store.remove(' TESTE@libris.com ', book.id)).toBe(true)

    const reloaded = await reloadShelf()
    expect(
      reloaded.getState().shelves['teste@libris.com']?.map(({ id }) => id),
    ).toEqual([otherBook.id])
    expect(
      reloaded.getState().shelves['outra@libris.com']?.map(({ id }) => id),
    ).toEqual([book.id])
    expect(reloaded.getState().shelves['terceira@libris.com']).toBeUndefined()
  })

  it('migra o formato manual, preserva todas as contas e completa campos antigos', async () => {
    localStorage.setItem(
      SHELF_STORAGE_KEY,
      JSON.stringify({
        'teste@libris.com': [
          legacyBook,
          {
            ...legacyBook,
            id: otherBook.id,
            status: 'reading',
            pageCount: 120,
            categories: ['Ficção'],
          },
        ],
        'outra@libris.com': [{ ...legacyBook, status: 'read' }],
      }),
    )

    const migrated = await reloadShelf()
    const shelves = migrated.getState().shelves
    expect(migrated.persist.hasHydrated()).toBe(true)
    expect(shelves['teste@libris.com']?.[0]).toEqual({
      ...legacyBook,
      status: 'want-to-read',
      pageCount: null,
      categories: [],
    })
    expect(shelves['teste@libris.com']?.[1]).toMatchObject({
      id: otherBook.id,
      status: 'reading',
      pageCount: 120,
      categories: ['Ficção'],
    })
    expect(shelves['outra@libris.com']?.[0]?.status).toBe('read')
    const persisted = localStorage.getItem(SHELF_STORAGE_KEY)
    expect(JSON.parse(persisted || 'null')).toEqual({
      state: { shelves },
      version: 1,
    })

    const reloaded = await reloadShelf()
    expect(reloaded.getState().shelves).toEqual(shelves)
    expect(localStorage.getItem(SHELF_STORAGE_KEY)).toBe(persisted)
    expect(
      reloaded.getState().setStatus('teste@libris.com', book.id, 'read'),
    ).toBe(true)
    expect(
      (await reloadShelf()).getState().shelves['teste@libris.com']?.[0]?.status,
    ).toBe('read')
  })

  it('valida também os dados salvos no formato atual', async () => {
    localStorage.setItem(
      SHELF_STORAGE_KEY,
      JSON.stringify({
        state: {
          shelves: {
            'teste@libris.com': [{ ...legacyBook, status: 'desconhecido' }],
          },
        },
        version: 1,
      }),
    )
    const reloaded = await reloadShelf()
    expect(reloaded.getState().shelves['teste@libris.com']?.[0]).toMatchObject({
      status: 'want-to-read',
      pageCount: null,
      categories: [],
    })
    expect(typeof reloaded.getState().add).toBe('function')
  })

  it.each([
    '{invalid',
    'null',
    '[]',
    '{"state":{"shelves":{"teste@libris.com":[{"id":"incompleto"}]}},"version":1}',
  ])('ignora dados corrompidos sem derrubar a aplicação: %s', async (value) => {
    localStorage.setItem(SHELF_STORAGE_KEY, value)
    const reloaded = await reloadShelf()
    expect(reloaded.getState().shelves).toEqual({})
    expect(localStorage.getItem(SHELF_STORAGE_KEY)).toBe(value)
    expect(reloaded.getState().add('teste@libris.com', book)).toBe(true)
    expect(
      (await reloadShelf()).getState().shelves['teste@libris.com']?.[0]?.id,
    ).toBe(book.id)
  })

  it.each(['add', 'setStatus', 'remove'] as const)(
    'restaura o estado e permite tentar novamente se %s falhar ao salvar',
    async (action) => {
      const store = useShelfStore.getState()
      store.add('teste@libris.com', book)
      store.add('outra@libris.com', book)
      const shelves = useShelfStore.getState().shelves
      const persisted = localStorage.getItem(SHELF_STORAGE_KEY)
      const write = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Quota')
        })
      const perform = () => {
        if (action === 'add') return store.add('teste@libris.com', otherBook)
        if (action === 'setStatus')
          return store.setStatus('teste@libris.com', book.id, 'read')
        return store.remove('teste@libris.com', book.id)
      }

      expect(perform()).toBe(false)
      expect(useShelfStore.getState().shelves).toBe(shelves)
      expect(localStorage.getItem(SHELF_STORAGE_KEY)).toBe(persisted)
      write.mockRestore()
      expect(perform()).toBe(true)
      expect(useShelfStore.getState().shelves).not.toEqual(shelves)
      expect((await reloadShelf()).getState().shelves).toEqual(
        useShelfStore.getState().shelves,
      )
    },
  )

  it('mantém os livros antigos legíveis se a gravação da migração falhar', async () => {
    const legacy = JSON.stringify({ 'teste@libris.com': [legacyBook] })
    localStorage.setItem(SHELF_STORAGE_KEY, legacy)
    const write = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Quota')
      })

    const migrated = await reloadShelf()
    expect(migrated.getState().shelves['teste@libris.com']?.[0]?.id).toBe(
      book.id,
    )
    expect(localStorage.getItem(SHELF_STORAGE_KEY)).toBe(legacy)
    expect(migrated.getState().add('teste@libris.com', otherBook)).toBe(false)
    expect(migrated.getState().shelves['teste@libris.com']).toHaveLength(1)
    write.mockRestore()
    await migrated.persist.rehydrate()
    expect(migrated.persist.hasHydrated()).toBe(true)
    expect((await reloadShelf()).getState().shelves).toEqual(
      migrated.getState().shelves,
    )
  })

  it('continua abrindo e retorna falha nas ações quando o navegador bloqueia localStorage', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    const reloaded = await reloadShelf()
    expect(reloaded.getState().shelves).toEqual({})
    expect(reloaded.getState().add('teste@libris.com', book)).toBe(false)
    expect(reloaded.getState().shelves).toEqual({})
  })
})
