import { createFileRoute } from '@tanstack/react-router'

import { DiscoverPage } from '@/pages/discover'

export const Route = createFileRoute('/_authenticated/discover')({
  component: DiscoverPage,
})
