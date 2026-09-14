import { z } from 'zod'

export const BOOKS_PER_PAGE = 15

export const bookPrintTypeSchema = z.enum(['all', 'books', 'magazines'])
export const bookOrderBySchema = z.enum(['relevance', 'newest'])

export const bookSearchParamsSchema = z.object({
  projection: z.enum(['lite', 'full']).optional(),
  langRestrict: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional(),
  maxResults: z.number().int().min(1).max(40).default(BOOKS_PER_PAGE),
  orderBy: bookOrderBySchema.default('relevance'),
  printType: bookPrintTypeSchema.default('all'),
  query: z
    .string()
    .trim()
    .min(1)
    .transform((query) => query.replace(/\s+/g, ' ')),
  startIndex: z.number().int().nonnegative().default(0),
})

export type BookOrderBy = z.infer<typeof bookOrderBySchema>
export type BookPrintType = z.infer<typeof bookPrintTypeSchema>
export type BookSearchParams = z.input<typeof bookSearchParamsSchema>
export type NormalizedBookSearchParams = z.output<typeof bookSearchParamsSchema>

export function normalizeBookSearchParams(
  params: BookSearchParams,
): NormalizedBookSearchParams {
  return bookSearchParamsSchema.parse(params)
}
