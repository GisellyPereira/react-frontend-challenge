import { createAuthToken } from '../lib/create-auth-token'
import { authSessionSchema, type AuthSession } from './auth-session'
import { loginSchema, type LoginCredentials } from './login-schema'

interface CreateAuthSessionDependencies {
  generateToken: () => string
  now: () => Date
}

const defaultDependencies: CreateAuthSessionDependencies = {
  generateToken: createAuthToken,
  now: () => new Date(),
}

export function createAuthSession(
  credentials: LoginCredentials,
  dependencies: CreateAuthSessionDependencies = defaultDependencies,
): AuthSession {
  const { email } = loginSchema.parse(credentials)

  return authSessionSchema.parse({
    email,
    token: dependencies.generateToken(),
    authenticatedAt: dependencies.now().toISOString(),
  })
}
