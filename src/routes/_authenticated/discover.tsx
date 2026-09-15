import { createFileRoute, stripSearchParams } from '@tanstack/react-router'

import {
  discoverSearchDefaults,
  discoverSearchSchema,
} from '@/features/discover-books'
import { DiscoverRoutePage } from '@/pages/discover'

export const Route = createFileRoute('/_authenticated/discover')({
  component: DiscoverRoutePage,
  search: {
    middlewares: [stripSearchParams(discoverSearchDefaults)],
  },
  validateSearch: discoverSearchSchema,
})
