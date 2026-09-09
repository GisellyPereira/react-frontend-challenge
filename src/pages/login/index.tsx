import { useNavigate } from '@tanstack/react-router'

import {
  createAuthSession,
  LoginForm,
  useAuthStore,
  type ValidLoginCredentials,
} from '@/features/auth'

export function LoginPage() {
  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()

  async function handleLogin(credentials: ValidLoginCredentials) {
    const session = createAuthSession(credentials)

    setSession(session)
    await navigate({ to: '/discover', replace: true })
  }

  return (
    <main>
      <section aria-labelledby="login-title">
        <h1 id="login-title">Acesse o Libris</h1>
        <p>Entre para descobrir livros e organizar sua estante.</p>
        <LoginForm onSubmit={handleLogin} />
      </section>
    </main>
  )
}
