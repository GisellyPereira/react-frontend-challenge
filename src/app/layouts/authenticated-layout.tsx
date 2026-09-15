import { Outlet } from '@tanstack/react-router'

import { AppHeader } from '@/widgets/app-header'
import { AppFooter } from '@/widgets/app-footer'

export function AuthenticatedLayout() {
  return (
    <div className="authenticated-shell flex min-h-dvh flex-col text-foreground">
      <AppHeader />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  )
}
