import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BookLoading } from './book-loading'

describe('BookLoading', () => {
  it('anuncia a espera e mantém a ilustração decorativa', () => {
    const { container } = render(<BookLoading />)
    expect(screen.getByRole('status')).toHaveTextContent('Abrindo o livro…')
    expect(
      container.querySelector('.book-loading__illustration'),
    ).toHaveAttribute('aria-hidden', 'true')
  })
  it('adapta texto e tamanho para o leitor', () => {
    render(
      <BookLoading
        compact
        title="Preparando sua leitura…"
        description="Abrindo a amostra."
      />,
    )
    expect(screen.getByRole('status')).toHaveClass('book-loading--compact')
    expect(screen.getByRole('status')).toHaveTextContent('Abrindo a amostra.')
  })
})
