import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LoginForm } from './login-form'

describe('LoginForm', () => {
  it('exibe os erros e não envia credenciais inválidas', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText('Email'), 'email-invalido')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByText(
        'Confira o email: ele deve estar completo, como nome@exemplo.com.',
      ),
    ).toBeVisible()
    expect(
      screen.getByText('Sua senha precisa ter pelo menos 7 caracteres.'),
    ).toBeVisible()
    expect(handleSubmit).not.toHaveBeenCalled()
  })
})
