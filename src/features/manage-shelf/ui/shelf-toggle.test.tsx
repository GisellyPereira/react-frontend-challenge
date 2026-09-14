import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseGoogleVolume } from '@/entities/book/api/map-google-volume'
import { SHELF_STORAGE_KEY, useShelfStore } from '../model/shelf-store'
import { ShelfToggle } from './shelf-toggle'

const email = 'leitora@example.com'
const book = parseGoogleVolume({
  id: 'dom-casmurro',
  volumeInfo: { title: 'Dom Casmurro' },
})
const otherBook = parseGoogleVolume({
  id: 'agua-viva',
  volumeInfo: { title: 'Água viva' },
})

beforeEach(() => {
  useShelfStore.setState({ shelves: {} })
  useShelfStore.persist.clearStorage()
})
afterEach(() => vi.restoreAllMocks())

describe('ShelfToggle nos detalhes do livro', () => {
  it('remove um livro salvo, preservando os demais livros e as outras contas', async () => {
    const store = useShelfStore.getState()
    store.add(email, book)
    store.setStatus(email, book.id, 'reading')
    store.add(email, otherBook)
    store.add('outra@example.com', book)
    const user = userEvent.setup()
    render(<ShelfToggle book={book} email=" LEITORA@example.com " />)

    const remove = screen.getByRole('button', {
      name: 'Remover da minha estante',
    })
    expect(remove).toBeEnabled()
    await user.click(remove)

    expect(
      screen.getByRole('button', { name: 'Adicionar à minha estante' }),
    ).toBeEnabled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Livro removido da sua estante.',
    )
    expect(
      useShelfStore.getState().shelves[email]?.map(({ id }) => id),
    ).toEqual([otherBook.id])
    expect(useShelfStore.getState().shelves['outra@example.com']?.[0]?.id).toBe(
      book.id,
    )
    expect(
      JSON.parse(localStorage.getItem(SHELF_STORAGE_KEY) || 'null'),
    ).toEqual({
      state: { shelves: useShelfStore.getState().shelves },
      version: 1,
    })
  })

  it('permite adicionar, remover e adicionar novamente por teclado, mantendo o foco', async () => {
    const user = userEvent.setup()
    render(<ShelfToggle book={book} email={email} />)
    await user.tab()
    const button = screen.getByRole('button', {
      name: 'Adicionar à minha estante',
    })
    expect(button).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(button).toHaveAccessibleName('Remover da minha estante')
    expect(button).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Livro adicionado à sua estante.',
    )
    await user.keyboard(' ')
    expect(button).toHaveAccessibleName('Adicionar à minha estante')
    expect(button).toHaveFocus()
    expect(useShelfStore.getState().shelves[email]).toHaveLength(0)
    await user.keyboard('{Enter}')
    expect(button).toHaveAccessibleName('Remover da minha estante')
    expect(useShelfStore.getState().shelves[email]).toHaveLength(1)
  })

  it('mantém o livro e seu status se a remoção falhar, e aceita uma nova tentativa', async () => {
    const store = useShelfStore.getState()
    store.add(email, book)
    store.setStatus(email, book.id, 'reading')
    const persisted = localStorage.getItem(SHELF_STORAGE_KEY)
    const user = userEvent.setup()
    render(<ShelfToggle book={book} email={email} />)
    const write = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Quota')
      })

    await user.click(
      screen.getByRole('button', { name: 'Remover da minha estante' }),
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível remover o livro da estante',
    )
    expect(
      screen.getByRole('button', { name: 'Remover da minha estante' }),
    ).toBeEnabled()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(useShelfStore.getState().shelves[email]?.[0]).toMatchObject({
      id: book.id,
      status: 'reading',
    })
    expect(localStorage.getItem(SHELF_STORAGE_KEY)).toBe(persisted)

    write.mockRestore()
    await user.click(
      screen.getByRole('button', { name: 'Remover da minha estante' }),
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Livro removido da sua estante.',
    )
    expect(
      screen.getByRole('button', { name: 'Adicionar à minha estante' }),
    ).toBeEnabled()
  })

  it('informa a falha de inclusão sem apresentar o livro como salvo', async () => {
    const user = userEvent.setup()
    render(<ShelfToggle book={book} email={email} />)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota')
    })
    await user.click(
      screen.getByRole('button', { name: 'Adicionar à minha estante' }),
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível adicionar o livro à estante',
    )
    expect(
      screen.getByRole('button', { name: 'Adicionar à minha estante' }),
    ).toBeEnabled()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(useShelfStore.getState().shelves[email]).toBeUndefined()
  })

  it('acompanha alterações feitas na estante enquanto os detalhes estão abertos', () => {
    render(<ShelfToggle book={book} email={email} />)
    act(() => {
      useShelfStore.getState().add(email, book)
    })
    expect(
      screen.getByRole('button', { name: 'Remover da minha estante' }),
    ).toBeEnabled()
    act(() => {
      useShelfStore.getState().remove(email, book.id)
    })
    expect(
      screen.getByRole('button', { name: 'Adicionar à minha estante' }),
    ).toBeEnabled()
  })
})
