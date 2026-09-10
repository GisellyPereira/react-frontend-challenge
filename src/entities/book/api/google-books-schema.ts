import { z } from 'zod'

const optionalStringSchema = z.string().optional().catch(undefined)
const optionalRatingSchema = z
  .number()
  .min(1)
  .max(5)
  .optional()
  .catch(undefined)
const optionalNonNegativeIntegerSchema = z
  .number()
  .int()
  .nonnegative()
  .optional()
  .catch(undefined)

const googleBookImageLinksSchema = z.object({
  extraLarge: optionalStringSchema,
  large: optionalStringSchema,
  medium: optionalStringSchema,
  small: optionalStringSchema,
  smallThumbnail: optionalStringSchema,
  thumbnail: optionalStringSchema,
})

export const googleBookVolumeSchema = z.object({
  accessInfo: z
    .object({
      webReaderLink: optionalStringSchema,
    })
    .optional()
    .catch(undefined),
  id: z.string().trim().min(1),
  volumeInfo: z
    .object({
      authors: z.array(z.unknown()).optional().catch([]),
      averageRating: optionalRatingSchema,
      categories: z.array(z.unknown()).optional().catch([]),
      description: optionalStringSchema,
      imageLinks: googleBookImageLinksSchema.optional().catch(undefined),
      infoLink: optionalStringSchema,
      language: optionalStringSchema,
      pageCount: optionalNonNegativeIntegerSchema,
      previewLink: optionalStringSchema,
      publishedDate: optionalStringSchema,
      publisher: optionalStringSchema,
      ratingsCount: optionalNonNegativeIntegerSchema,
      subtitle: optionalStringSchema,
      title: optionalStringSchema,
    })
    .optional()
    .catch(undefined),
})

export const googleBooksSearchResponseSchema = z.object({
  items: z.array(z.unknown()).optional().default([]),
  totalItems: z.number().int().nonnegative(),
})

export type GoogleBookVolume = z.infer<typeof googleBookVolumeSchema>
