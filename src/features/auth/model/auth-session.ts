import { z } from 'zod'

export const authSessionSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  authenticatedAt: z.string().datetime(),
})

export type AuthSession = z.infer<typeof authSessionSchema>
