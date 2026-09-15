import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Book } from '@/entities/book'
import { Button } from '@/shared/ui/button'
import { useShelfStore } from '../model/shelf-store'
import { useShelfActions } from '../model/use-shelf-actions'
import './shelf-toggle.css'

export function ShelfToggle({ book, email }: { book: Book; email: string }) {
  const saved = useShelfStore(
    (state) =>
      state.shelves[email.trim().toLowerCase()]?.some(
        (item) => item.id === book.id,
      ) ?? false,
  )
  const { add, remove } = useShelfActions()
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)

  const toggle = () => {
    const success = saved ? remove(email, book.id) : add(email, book)
    setFeedback(
      success
        ? {
            kind: 'success',
            message: saved
              ? 'Livro removido da sua estante.'
              : 'Livro adicionado à sua estante.',
          }
        : {
            kind: 'error',
            message: `Não foi possível ${saved ? 'remover o livro da estante' : 'adicionar o livro à estante'} neste navegador. Verifique o espaço e as permissões de armazenamento.`,
          },
    )
  }

  return (
    <div className="shelf-toggle">
      <Button
        type="button"
        variant="outline"
        className="shelf-toggle__button"
        data-saved={saved}
        onClick={toggle}
      >
        {saved ? <Trash2 aria-hidden="true" /> : <Plus aria-hidden="true" />}
        {saved ? 'Remover da minha estante' : 'Adicionar à minha estante'}
      </Button>
      <span className="sr-only" role="status">
        {feedback?.kind === 'success' ? feedback.message : ''}
      </span>
      {feedback?.kind === 'error' && (
        <p className="shelf-toggle__error" role="alert">
          {feedback.message}
        </p>
      )}
    </div>
  )
}
