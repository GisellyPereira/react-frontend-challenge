import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createQueryClient } from '@/app/providers/query-client'
import { createAppRouter } from '@/app/router'
import '@/app/styles/index.css'

const queryClient = createQueryClient()
const router = createAppRouter(queryClient)
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Elemento raiz da aplicação não encontrado.')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
