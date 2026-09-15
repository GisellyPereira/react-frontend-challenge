import { createFileRoute } from '@tanstack/react-router'

import { BookDetailsPage } from '@/pages/book-details'

export const Route = createFileRoute('/_authenticated/book/$bookId')({
  component: BookDetailsPage,
})
