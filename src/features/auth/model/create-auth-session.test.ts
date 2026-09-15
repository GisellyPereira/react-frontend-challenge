import { describe, expect, it } from 'vitest'

import { createAuthSession } from './create-auth-session'

describe('createAuthSession', () => {
  it('cria uma sessão determinística sem armazenar a senha', () => {
    const session = createAuthSession(
      {
        email: '  LEITORA@EXAMPLE.COM ',
        password: '1234567',
      },
      {
        generateToken: () => 'token-ficticio',
        now: () => new Date('2026-09-09T12:00:00.000Z'),
      },
    )

    expect(session).toEqual({
      email: 'leitora@example.com',
      token: 'token-ficticio',
      authenticatedAt: '2026-09-09T12:00:00.000Z',
    })
    expect(session).not.toHaveProperty('password')
  })
})
