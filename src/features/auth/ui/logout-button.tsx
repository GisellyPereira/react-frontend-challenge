import { useNavigate } from '@tanstack/react-router'

import { useAuthStore } from '../model/auth-store'

export function LogoutButton() {
  const clearSession = useAuthStore((state) => state.clearSession)
  const navigate = useNavigate()

  function handleLogout() {
    clearSession()
    void navigate({ to: '/login', replace: true })
  }

  return (
    <button type="button" onClick={handleLogout}>
      Sair
    </button>
  )
}
