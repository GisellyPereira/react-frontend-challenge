import { useEffect, useRef, useState } from 'react'
import type { Book } from '@/entities/book'
import { Button } from '@/shared/ui/button'
import { BookLoading } from '@/shared/ui/book-loading'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { RadialFillButton } from '@/shared/ui/radial-fill-button'
import { loadGoogleViewer, type BookViewer } from '../lib/google-viewer'

function Reader({ book }: { book: Book }) {
  const container = useRef<HTMLDivElement>(null)
  const viewer = useRef<BookViewer | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  useEffect(() => {
    let cancelled = false
    let failed = false
    const element = container.current
    const fail = (
      message = 'O leitor demorou demais para responder. Tente novamente.',
    ) => {
      failed = true
      if (!cancelled) {
        setErrorMessage(message)
        setStatus('error')
      }
    }
    const timeout = window.setTimeout(fail, 20000)
    let observer: ResizeObserver | undefined
    loadGoogleViewer()
      .then((api) => {
        if (cancelled || failed || !element) return
        const instance = new api.DefaultViewer(element)
        viewer.current = instance
        instance.load(
          book.id,
          () => {
            clearTimeout(timeout)
            fail(
              'O Google não liberou a prévia desta edição no leitor incorporado. Você pode conferir a disponibilidade no Google Books.',
            )
          },
          () => {
            clearTimeout(timeout)
            if (!cancelled && !failed) {
              setStatus('ready')
              observer = new ResizeObserver(() => instance.resize())
              observer.observe(element)
            }
          },
        )
      })
      .catch((error: unknown) => {
        clearTimeout(timeout)
        fail(
          error instanceof Error
            ? `Não foi possível iniciar o leitor: ${error.message}`
            : 'Não foi possível carregar o leitor do Google Books.',
        )
      })
    return () => {
      cancelled = true
      clearTimeout(timeout)
      observer?.disconnect()
      viewer.current = null
      element?.replaceChildren()
    }
  }, [book.id, attempt])
  return (
    <>
      <div className="book-reader__toolbar">
        <Button
          variant="outline"
          disabled={status !== 'ready'}
          onClick={() => viewer.current?.previousPage()}
        >
          Página anterior
        </Button>
        <Button
          variant="outline"
          disabled={status !== 'ready'}
          onClick={() => viewer.current?.nextPage()}
        >
          Próxima página
        </Button>
      </div>
      {status === 'error' && (
        <div role="alert">
          <p>{errorMessage}</p>
          <Button
            variant="outline"
            onClick={() => {
              setStatus('loading')
              setAttempt((value) => value + 1)
            }}
          >
            Tentar novamente
          </Button>
        </div>
      )}
      <div className="book-reader__stage">
        {status === 'loading' && (
          <BookLoading
            compact
            title="Preparando sua leitura…"
            description="Abrindo as páginas disponíveis desta edição."
          />
        )}
        <div
          ref={container}
          className="book-reader__canvas"
          aria-hidden={status !== 'ready'}
          style={{
            display: status === 'error' ? 'none' : undefined,
            visibility: status === 'loading' ? 'hidden' : undefined,
          }}
        />
      </div>
      {book.previewUrl && (
        <a
          className="book-details__external"
          href={book.previewUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir no Google Books ↗
        </a>
      )}
    </>
  )
}

export function BookPreview({ book }: { book: Book }) {
  const canRead =
    book.reading?.viewability === 'PARTIAL' ||
    book.reading?.viewability === 'ALL_PAGES'
  if (!canRead)
    return (
      <p className="book-details__muted">
        Esta edição ainda não tem páginas disponíveis para leitura.
      </p>
    )
  if (!book.reading?.embeddable)
    return book.previewUrl ? (
      <Button asChild variant="outline">
        <a href={book.previewUrl} target="_blank" rel="noopener noreferrer">
          Ler no Google Books ↗
        </a>
      </Button>
    ) : null
  return (
    <Dialog>
      <DialogTrigger asChild>
        <RadialFillButton className="book-details__primary">
          {book.reading.viewability === 'ALL_PAGES'
            ? 'Ler o livro'
            : 'Ler uma amostra'}
        </RadialFillButton>
      </DialogTrigger>
      <DialogContent className="book-reader">
        <DialogTitle className="book-reader__title">
          {book.title || 'Leitura'}
        </DialogTitle>
        <DialogDescription>
          Leia as páginas disponibilizadas para esta edição. Algumas páginas
          podem não fazer parte da amostra.
        </DialogDescription>
        <Reader book={book} />
      </DialogContent>
    </Dialog>
  )
}
