import { useCallback, useEffect, useRef, useState } from 'react'

export const BOOK_SEARCH_DEBOUNCE_MS = 450
export type SearchSubmitOptions = { automatic?: boolean }

export function useDiscoverInput(
  confirmedQuery: string,
  onSearch: (query: string, options?: SearchSubmitOptions) => void,
) {
  const [draft, setDraft] = useState({
    source: confirmedQuery,
    value: confirmedQuery,
  })
  if (draft.source !== confirmedQuery) {
    setDraft({ source: confirmedQuery, value: confirmedQuery })
  }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancel = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
  }, [])

  useEffect(() => cancel, [cancel, confirmedQuery])

  const changeQuery = (value: string) => {
    cancel()
    setDraft({ source: confirmedQuery, value })
    const query = value.trim()
    if (!query || query === confirmedQuery.trim()) return
    timer.current = setTimeout(() => {
      timer.current = null
      onSearch(query, { automatic: true })
    }, BOOK_SEARCH_DEBOUNCE_MS)
  }

  const submitQuery = (query: string) => {
    cancel()
    setDraft({ source: confirmedQuery, value: query })
    onSearch(query)
  }

  return {
    query: draft.source === confirmedQuery ? draft.value : confirmedQuery,
    changeQuery,
    submitQuery,
  }
}
