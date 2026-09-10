function readOptionalEnv(value: string | undefined) {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : undefined
}

export const env = Object.freeze({
  googleBooksApiKey: readOptionalEnv(import.meta.env.VITE_GOOGLE_BOOKS_API_KEY),
})
