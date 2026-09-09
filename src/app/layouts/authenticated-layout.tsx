import { Link, Outlet } from '@tanstack/react-router'

import { LogoutButton } from '@/features/auth'

export function AuthenticatedLayout() {
  return (
    <>
      <header>
        <nav aria-label="Navegação principal">
          <Link to="/discover">Descobrir</Link>
          <Link to="/shelf">Minha estante</Link>
        </nav>
        <LogoutButton />
      </header>
      <Outlet />
    </>
  )
}
