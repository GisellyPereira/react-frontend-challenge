import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { BookCard } from '@/entities/book'
import { useAuthStore } from '@/features/auth'
import { restoreBook, useShelfStore } from '@/features/manage-shelf'
import { Button } from '@/shared/ui/button'
import './shelf.css'

export function ShelfPage() {
  const email = useAuthStore((state) => state.session?.email ?? '')
  const shelves = useShelfStore((state) => state.shelves)
  const remove = useShelfStore((state) => state.remove)
  const books = shelves[email.trim().toLowerCase()] ?? []
  const [error, setError] = useState(false)
  return (
    <main className="personal-shelf">
      <p className="personal-shelf__eyebrow">Os livros que ficam com você</p>
      <h1>Minha estante</h1>
      <p>
        {books.length
          ? `${books.length} ${books.length === 1 ? 'livro guardado' : 'livros guardados'} para os próximos capítulos.`
          : 'Tem espaço para a sua próxima descoberta.'}
      </p>
      <p className="personal-shelf__local">
        Salva neste navegador, para a sua conta de demonstração.
      </p>
      {error && (
        <p role="alert">
          Não foi possível atualizar a estante. Tente novamente.
        </p>
      )}
      {books.length ? (
        <div className="personal-shelf__grid">
          {books.map((saved) => (
            <div key={saved.id}>
              <BookCard book={restoreBook(saved)} />
              <Button
                variant="ghost"
                aria-label={`Remover ${saved.title || 'livro'} da estante`}
                onClick={() => setError(!remove(email, saved.id))}
              >
                Remover da estante
              </Button>
            </div>
          ))}
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
