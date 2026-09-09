import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HomePage } from './index'

describe('HomePage', () => {
  it('identifica a aplicação', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Libris' }),
    ).toBeInTheDocument()
  })
})
