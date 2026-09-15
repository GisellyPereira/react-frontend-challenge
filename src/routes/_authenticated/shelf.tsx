import { createFileRoute } from '@tanstack/react-router'

import { ShelfPage } from '@/pages/shelf'

export const Route = createFileRoute('/_authenticated/shelf')({
  component: ShelfPage,
})
