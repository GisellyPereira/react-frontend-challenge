import { createFileRoute, redirect } from '@tanstack/react-router'

import { AuthenticatedLayout } from '@/app/layouts/authenticated-layout'
import { selectIsAuthenticated, useAuthStore } from '@/features/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const isAuthenticated = selectIsAuthenticated(useAuthStore.getState())

    if (!isAuthenticated) {
      redirect({
        to: '/login',
        replace: true,
        throw: true,
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
