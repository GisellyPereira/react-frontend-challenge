import { describe, expect, it } from 'vitest'

import { LOGIN_PASSWORD_MIN_LENGTH, loginSchema } from './login-schema'

describe('loginSchema', () => {
  it('aceita credenciais válidas e normaliza o email', () => {
    const credentials = loginSchema.parse({
      email: '  LEITORA@EXAMPLE.COM  ',
      password: '1234567',
    })

    expect(credentials).toEqual({
      email: 'leitora@example.com',
      password: '1234567',
    })
  })

  it('rejeita um email inválido', () => {
    const result = loginSchema.safeParse({
      email: 'email-invalido',
      password: '1234567',
    })

    expect(result.success).toBe(false)
  })

  it('exibe somente a orientação necessária para campos vazios', () => {
    const result = loginSchema.safeParse({ email: '', password: '' })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.issues).toEqual([
        expect.objectContaining({
          path: ['email'],
          message: 'Digite o email usado para acessar o Libris.',
        }),
        expect.objectContaining({
          path: ['password'],
          message: 'Digite sua senha para entrar na sua estante.',
        }),
      ])
    }
  })

  it(`rejeita senhas com menos de ${LOGIN_PASSWORD_MIN_LENGTH} caracteres`, () => {
    const result = loginSchema.safeParse({
      email: 'leitora@example.com',
      password: '123456',
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.issues).toEqual([
        expect.objectContaining({
          path: ['password'],
          message: `Sua senha precisa ter pelo menos ${LOGIN_PASSWORD_MIN_LENGTH} caracteres.`,
        }),
      ])
    }
  })
})
