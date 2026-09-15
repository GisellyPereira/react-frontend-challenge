export type ApiErrorCode =
  | 'forbidden'
  | 'invalid-response'
  | 'network'
  | 'not-found'
  | 'rate-limit'
  | 'request'
  | 'server'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number | null

  constructor(message: string, code: ApiErrorCode, status: number | null) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}
