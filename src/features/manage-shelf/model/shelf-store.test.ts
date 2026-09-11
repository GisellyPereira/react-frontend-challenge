import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { parseGoogleVolume } from '@/entities/book/api/map-google-volume'
import { readShelves, useShelfStore, SHELF_STORAGE_KEY } from './shelf-store'

const book = parseGoogleVolume({
  id: 'book-1',
  volumeInfo: { title: 'Dom Casmurro' },
})
beforeEach(() => {
  localStorage.clear()
  useShelfStore.setState({ shelves: {} })
})
afterEach(() => vi.restoreAllMocks())
describe('estante pessoal', () => {
  it('salva, restaura e evita duplicatas por conta', () => {
    expect(useShelfStore.getState().add(' TESTE@libris.com ', book)).toBe(true)
    useShelfStore.getState().add('teste@libris.com', book)
    expect(readShelves()['teste@libris.com']).toHaveLength(1)
    expect(readShelves()['outra@libris.com']).toBeUndefined()
    useShelfStore.getState().add('outra@libris.com', book)
    useShelfStore.getState().remove('teste@libris.com', book.id)
    expect(readShelves()['teste@libris.com']).toHaveLength(0)
    expect(readShelves()['outra@libris.com']).toHaveLength(1)
  })
  it('não altera o estado se o armazenamento falhar', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota')
    })
    expect(useShelfStore.getState().add('teste@libris.com', book)).toBe(false)
    expect(useShelfStore.getState().shelves).toEqual({})
  })
  it('ignora dados locais corrompidos', () => {
    localStorage.setItem(SHELF_STORAGE_KEY, '{invalid')
    expect(readShelves()).toEqual({})
  })
})
