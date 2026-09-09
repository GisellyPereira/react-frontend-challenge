import { render, screen, waitFor } from '@testing-library/react'
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

    expect(await screen.findByText('Informe um email válido.')).toBeVisible()
    expect(
      screen.getByText('A senha deve ter pelo menos 7 caracteres.'),
    ).toBeVisible()
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('envia credenciais válidas com o email normalizado', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText('Email'), 'LEITORA@EXAMPLE.COM')
    await user.type(screen.getByLabelText('Senha'), '1234567')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'leitora@example.com',
        password: '1234567',
      })
    })
  })

  it('permite visualizar e ocultar a senha', async () => {
    const user = userEvent.setup()

    render(<LoginForm onSubmit={vi.fn()} />)

    const passwordInput = screen.getByLabelText('Senha')
    const visibilityButton = screen.getByRole('button', {
      name: 'Mostrar senha',
    })

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(visibilityButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(
      screen.getByRole('button', { name: 'Ocultar senha' }),
    ).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }))

    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
