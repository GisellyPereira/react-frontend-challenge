import { createFileRoute, redirect } from '@tanstack/react-router'

import { selectIsAuthenticated, useAuthStore } from '@/features/auth'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const isAuthenticated = selectIsAuthenticated(useAuthStore.getState())

    redirect({
      to: isAuthenticated ? '/discover' : '/login',
      replace: true,
      throw: true,
    })
  },
})
