import { toast } from 'sonner'
import type { Book } from '@/entities/book'
import { useShelfStore, type ReadingStatus } from './shelf-store'

let latestShelfToast: string | number | undefined

export function useShelfActions() {
  const add = useShelfStore((state) => state.add)
  const remove = useShelfStore((state) => state.remove)
  const setStatus = useShelfStore((state) => state.setStatus)

  const notify = (
    success: boolean,
    title: string | null | undefined,
    message: string,
    error: string,
  ) => {
    if (latestShelfToast !== undefined) toast.dismiss(latestShelfToast)
    if (success)
      latestShelfToast = toast.success(message, {
        description: title || 'Título não informado',
      })
    else
      latestShelfToast = toast.error(error, {
        description:
          'Verifique o espaço e as permissões de armazenamento e tente novamente.',
      })
    return success
  }
  const titleOf = (email: string, id: string) =>
    useShelfStore
      .getState()
      .shelves[email.trim().toLowerCase()]?.find((book) => book.id === id)
      ?.title

  return {
    add: (email: string, book: Book) =>
      notify(
        add(email, book),
        book.title,
        'Livro adicionado à sua estante.',
        'Não foi possível adicionar o livro.',
      ),
    remove: (email: string, id: string) => {
      const title = titleOf(email, id)
      return notify(
        remove(email, id),
        title,
        'Livro removido da sua estante.',
        'Não foi possível remover o livro.',
      )
    },
    setStatus: (email: string, id: string, status: ReadingStatus) =>
      notify(
        setStatus(email, id, status),
        titleOf(email, id),
        'Status de leitura atualizado.',
        'Não foi possível atualizar o status.',
      ),
  }
}
