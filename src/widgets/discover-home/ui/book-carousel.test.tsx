import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useEmblaCarousel from 'embla-carousel-react'
import { BookCarousel } from './book-carousel'

const api = vi.hoisted(() => ({
  canScrollPrev: vi.fn(() => true),
  canScrollNext: vi.fn(() => true),
  scrollPrev: vi.fn(),
  scrollNext: vi.fn(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
}))
vi.mock('embla-carousel-react', () => ({
  default: vi.fn(() => [vi.fn(), api]),
}))
describe('carrossel de livros', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.canScrollPrev.mockReturnValue(true)
    api.canScrollNext.mockReturnValue(true)
  })
  const show = () =>
    render(
      <BookCarousel label="Histórias">
        <a href="#livro">Livro</a>
      </BookCarousel>,
    )
  it('configura loop e navega nos dois sentidos por botão e teclado', async () => {
    show()
    expect(useEmblaCarousel).toHaveBeenCalledWith({
      loop: true,
      align: 'start',
      slidesToScroll: 1,
    })
    const previous = screen.getByRole('button', {
      name: 'Livros anteriores: Histórias',
    })
    const next = screen.getByRole('button', {
      name: 'Próximos livros: Histórias',
    })
    await waitFor(() => expect(previous).toBeEnabled())
    expect(next).toBeEnabled()
    fireEvent.click(next)
    expect(api.scrollNext).toHaveBeenCalledTimes(1)
    fireEvent.click(previous)
    expect(api.scrollPrev).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(
      screen.getByLabelText('Livros de Histórias. Use as setas para navegar.'),
      { key: 'ArrowLeft' },
    )
    expect(api.scrollPrev).toHaveBeenCalledTimes(2)
    fireEvent.keyDown(screen.getByRole('link'), { key: 'ArrowRight' })
    expect(api.scrollNext).toHaveBeenCalledTimes(1)
  })
  it('desabilita controles quando todos os livros cabem na tela', async () => {
    api.canScrollPrev.mockReturnValue(false)
    api.canScrollNext.mockReturnValue(false)
    show()
    await waitFor(() => expect(api.canScrollNext).toHaveBeenCalled())
    screen
      .getAllByRole('button')
      .forEach((button) => expect(button).toBeDisabled())
  })
})
