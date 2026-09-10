import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

import { Button } from '@/shared/ui/button'

import { useAuthStore } from '../model/auth-store'

export function LogoutButton() {
  const clearSession = useAuthStore((state) => state.clearSession)
  const navigate = useNavigate()

  function handleLogout() {
    clearSession()
    void navigate({ to: '/login', replace: true })
  }

  return (
    <Button
      className="h-11 gap-2 rounded-md px-2.5 text-xs font-bold tracking-[0.06em] text-muted-foreground uppercase hover:bg-book-coral/8 hover:text-book-coral focus-visible:border-book-coral focus-visible:ring-book-coral/25 sm:px-3"
      type="button"
      variant="ghost"
      aria-label="Sair"
      title="Sair da conta"
      onClick={handleLogout}
    >
      <LogOut aria-hidden="true" className="size-4" />
      <span className="hidden sm:inline">Sair</span>
    </Button>
  )
}
