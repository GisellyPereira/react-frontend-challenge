import { describe, expect, it } from 'vitest'

import { createAuthToken } from './create-auth-token'

describe('createAuthToken', () => {
  it('gera tokens fictícios distintos', () => {
    const firstToken = createAuthToken()
    const secondToken = createAuthToken()

    expect(firstToken).toMatch(/^libris_[0-9a-f-]{36}$/)
    expect(secondToken).toMatch(/^libris_[0-9a-f-]{36}$/)
    expect(firstToken).not.toBe(secondToken)
  })
})
