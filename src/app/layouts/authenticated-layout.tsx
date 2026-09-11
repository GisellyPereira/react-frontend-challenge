import { Outlet } from '@tanstack/react-router'

import { AppHeader } from '@/widgets/app-header'

export function AuthenticatedLayout() {
  return (
    <div className="authenticated-shell min-h-svh text-foreground">
      <AppHeader />
      <Outlet />
    </div>
  )
}
