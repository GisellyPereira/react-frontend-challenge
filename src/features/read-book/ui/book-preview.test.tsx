import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseGoogleVolume } from '@/entities/book/api/map-google-volume'
import { loadGoogleViewer } from '../lib/google-viewer'
import { BookPreview } from './book-preview'

vi.mock('../lib/google-viewer', () => ({ loadGoogleViewer: vi.fn() }))

function makeBook(viewability = 'PARTIAL', embeddable = true) {
  return parseGoogleVolume({
    id: 'test-volume',
    volumeInfo: {
      title: 'Dom Casmurro',
      previewLink: 'https://books.google.com/preview',
    },
    accessInfo: { viewability, embeddable },
  })
}

describe('BookPreview', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  it('não oferece leitura quando a edição não libera páginas', () => {
    render(<BookPreview book={makeBook('NO_PAGES')} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(loadGoogleViewer).not.toHaveBeenCalled()
  })

  it('usa um link externo quando a incorporação não é permitida', () => {
    render(<BookPreview book={makeBook('PARTIAL', false)} />)
    expect(
      screen.getByRole('link', { name: /Ler no Google Books/ }),
    ).toHaveAttribute('href', 'https://books.google.com/preview')
    expect(loadGoogleViewer).not.toHaveBeenCalled()
  })

  it('abre o modal, navega pelas páginas e devolve o foco ao fechar', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn()
        disconnect = vi.fn()
      },
    )
    const nextPage = vi.fn()
    const previousPage = vi.fn()
    vi.mocked(loadGoogleViewer).mockResolvedValue({
      load: vi.fn(),
      DefaultViewer: class {
        nextPage = nextPage
        previousPage = previousPage
        resize = vi.fn()
        load(_id: string, _failure: () => void, success: () => void) {
          success()
        }
      },
    })
    const user = userEvent.setup()
    render(<BookPreview book={makeBook()} />)
    const trigger = screen.getByRole('button', { name: 'Ler uma amostra' })
    await user.click(trigger)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Próxima página' }),
      ).toBeEnabled(),
    )
    await user.click(screen.getByRole('button', { name: 'Próxima página' }))
    await user.click(screen.getByRole('button', { name: 'Página anterior' }))
    expect(nextPage).toHaveBeenCalledOnce()
    expect(previousPage).toHaveBeenCalledOnce()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('explica a falha e mantém a alternativa externa', async () => {
    vi.mocked(loadGoogleViewer).mockRejectedValue(new Error('Indisponível'))
    const user = userEvent.setup()
    render(<BookPreview book={makeBook()} />)
    await user.click(screen.getByRole('button', { name: 'Ler uma amostra' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível iniciar o leitor',
    )
    expect(
      screen.getByRole('button', { name: 'Próxima página' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('link', { name: /Abrir no Google Books/ }),
    ).toBeInTheDocument()
  })
})
