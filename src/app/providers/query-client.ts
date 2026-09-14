import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/shared/api/api-error'

function shouldRetryQuery(failureCount: number, error: unknown) {
  if (error instanceof ApiError) {
    const isTransientError = error.code === 'network' || error.code === 'server'

    return isTransientError && failureCount < 1
  }

  return failureCount < 1
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const message = query.meta?.errorMessage
        if (typeof message === 'string') {
          toast.error(message, {
            id: `query:${query.queryHash}`,
            description: error.message,
          })
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: false,
      },
    },
  })
}
