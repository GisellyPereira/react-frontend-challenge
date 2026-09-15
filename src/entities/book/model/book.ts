export interface BookCover {
  readonly large: string | null
  readonly small: string | null
}

export interface Book {
  readonly reading?: {
    readonly embeddable: boolean
    readonly viewability: string | null
    readonly pdf: string | null
    readonly epub: string | null
  }
  readonly identifiers?: readonly { type: string; identifier: string }[]
  readonly authors: readonly string[]
  readonly averageRating: number | null
  readonly categories: readonly string[]
  readonly cover: BookCover
  readonly description: string | null
  readonly id: string
  readonly infoUrl: string | null
  readonly language: string | null
  readonly pageCount: number | null
  readonly previewUrl: string | null
  readonly publishedDate: string | null
  readonly publisher: string | null
  readonly ratingsCount: number | null
  readonly subtitle: string | null
  readonly title: string | null
}
