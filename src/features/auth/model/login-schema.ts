import { z } from 'zod'

export const LOGIN_PASSWORD_MIN_LENGTH = 7

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .superRefine((email, context) => {
      if (email.length === 0) {
        context.addIssue({
          code: 'custom',
          message: 'Digite o email usado para acessar o Libris.',
        })
        return
      }

      if (!z.string().email().safeParse(email).success) {
        context.addIssue({
          code: 'custom',
          message:
            'Confira o email: ele deve estar completo, como nome@exemplo.com.',
        })
      }
    })
    .transform((email) => email.toLowerCase()),
  password: z.string().superRefine((password, context) => {
    if (password.length === 0) {
      context.addIssue({
        code: 'custom',
        message: 'Digite sua senha para entrar na sua estante.',
      })
      return
    }

    if (password.length < LOGIN_PASSWORD_MIN_LENGTH) {
      context.addIssue({
        code: 'custom',
        message: `Sua senha precisa ter pelo menos ${LOGIN_PASSWORD_MIN_LENGTH} caracteres.`,
      })
    }
  }),
})

export type LoginCredentials = z.input<typeof loginSchema>
export type ValidLoginCredentials = z.output<typeof loginSchema>
