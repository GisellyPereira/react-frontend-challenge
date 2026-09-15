import { createFileRoute, redirect } from '@tanstack/react-router'

import { selectIsAuthenticated, useAuthStore } from '@/features/auth'
import { LoginPage } from '@/pages/login'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    const isAuthenticated = selectIsAuthenticated(useAuthStore.getState())

    if (isAuthenticated) {
      redirect({ to: '/discover', replace: true, throw: true })
    }
  },
  component: LoginPage,
})
