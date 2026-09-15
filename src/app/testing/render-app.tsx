import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createQueryClient } from '@/app/providers/query-client'
import { createAppRouter } from '@/app/router'

export async function renderAppAt(path: string) {
  const history = createMemoryHistory({ initialEntries: [path] })
  const queryClient = createQueryClient()
  const router = createAppRouter({ queryClient, history })
  const user = userEvent.setup()

  await router.load()

  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { ...view, queryClient, router, user }
}
