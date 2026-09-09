import { z } from 'zod'

export const LOGIN_PASSWORD_MIN_LENGTH = 7

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu email.')
    .email('Informe um email válido.')
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(1, 'Informe sua senha.')
    .min(
      LOGIN_PASSWORD_MIN_LENGTH,
      `A senha deve ter pelo menos ${LOGIN_PASSWORD_MIN_LENGTH} caracteres.`,
    ),
})

export type LoginCredentials = z.input<typeof loginSchema>
export type ValidLoginCredentials = z.output<typeof loginSchema>
