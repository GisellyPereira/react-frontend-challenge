import { createRouter } from '@tanstack/react-router'

import type { QueryClient } from '@tanstack/react-query'
import type { RouterHistory } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'

interface CreateAppRouterOptions {
  queryClient: QueryClient
  history?: RouterHistory
}

export function createAppRouter({
  queryClient,
  history,
}: CreateAppRouterOptions) {
  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    scrollRestoration: true,
    ...(history ? { history } : {}),
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
