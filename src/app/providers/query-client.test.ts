import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api/api-error'

import { createQueryClient } from './query-client'

function getRetryDecision(failureCount: number, error: Error) {
  const retry = createQueryClient().getDefaultOptions().queries?.retry

  if (typeof retry !== 'function') {
    throw new Error(
      'O cliente de consultas deve definir uma política de retry.',
    )
  }

  return retry(failureCount, error)
}

describe('createQueryClient', () => {
  it('não repete erros permanentes ou de limite da API', () => {
    const permanentErrors = [
      new ApiError('Não autorizado.', 'forbidden', 403),
      new ApiError('Limite atingido.', 'rate-limit', 429),
      new ApiError('Resposta inválida.', 'invalid-response', 200),
    ]

    for (const error of permanentErrors) {
      expect(getRetryDecision(0, error)).toBe(false)
    }
  })

  it('faz somente uma nova tentativa para falhas transitórias', () => {
    const transientErrors = [
      new ApiError('Falha de rede.', 'network', null),
      new ApiError('Serviço indisponível.', 'server', 500),
    ]

    for (const error of transientErrors) {
      expect(getRetryDecision(0, error)).toBe(true)
      expect(getRetryDecision(1, error)).toBe(false)
    }
  })
})
