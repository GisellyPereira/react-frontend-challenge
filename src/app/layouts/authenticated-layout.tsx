import { Outlet } from '@tanstack/react-router'

import { AppHeader } from '@/widgets/app-header'

export function AuthenticatedLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <AppHeader />
      <Outlet />
    </div>
  )
}
