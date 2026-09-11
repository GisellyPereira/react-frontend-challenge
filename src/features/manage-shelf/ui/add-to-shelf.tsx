import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import type { Book } from '@/entities/book'
import { Button } from '@/shared/ui/button'
import { useShelfStore } from '../model/shelf-store'
import './add-to-shelf.css'

export function AddToShelf({ book, email }: { book: Book; email: string }) {
  const saved = useShelfStore(
    (state) =>
      state.shelves[email.trim().toLowerCase()]?.some(
        (item) => item.id === book.id,
      ) ?? false,
  )
  const add = useShelfStore((state) => state.add)
  const [error, setError] = useState(false)
  return (
    <div>
      <Button
        variant="outline"
        className="shelf-save-button"
        disabled={saved}
        onClick={() => setError(!add(email, book))}
      >
        {saved ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
        {saved ? 'Na minha estante' : 'Adicionar à minha estante'}
      </Button>
      <span className="sr-only" role="status">
        {saved ? 'Livro salvo na sua estante.' : ''}
      </span>
      {error && (
        <p role="alert">
          Não foi possível salvar neste navegador. Verifique o espaço e as
          permissões de armazenamento.
        </p>
      )}
    </div>
  )
}
