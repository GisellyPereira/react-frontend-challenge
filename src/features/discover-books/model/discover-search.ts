import { z } from 'zod'

import { bookOrderBySchema, bookPrintTypeSchema } from '@/entities/book'

export const discoverSearchDefaults = {
  orderBy: 'relevance',
  printType: 'all',
  q: '',
  startIndex: 0,
} as const

export const discoverSearchSchema = z.object({
  orderBy: bookOrderBySchema
    .catch(discoverSearchDefaults.orderBy)
    .default(discoverSearchDefaults.orderBy),
  printType: bookPrintTypeSchema
    .catch(discoverSearchDefaults.printType)
    .default(discoverSearchDefaults.printType),
  q: z
    .string()
    .catch(discoverSearchDefaults.q)
    .default(discoverSearchDefaults.q),
  startIndex: z
    .number()
    .int()
    .nonnegative()
    .catch(discoverSearchDefaults.startIndex)
    .default(discoverSearchDefaults.startIndex),
})

export type DiscoverSearch = z.output<typeof discoverSearchSchema>
