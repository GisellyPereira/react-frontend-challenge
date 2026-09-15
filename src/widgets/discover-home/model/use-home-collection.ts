import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  bookQueryKeys,
  googleBooksClient,
  type BookSearchParams,
} from '@/entities/book'

export function useHomeCollection(query: string, magazines = false) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )
  useEffect(() => {
    if (!ref.current) return
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '240px' },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  const params = {
    query,
    printType: magazines ? 'magazines' : 'books',
    orderBy: 'relevance',
    startIndex: 0,
    maxResults: 24,
    projection: 'full',
    ...(!magazines ? { langRestrict: 'pt' } : {}),
  } satisfies BookSearchParams
  const result = useQuery({
    queryKey: bookQueryKeys.search(params),
    queryFn: ({ signal }) => googleBooksClient.search(params, signal),
    enabled: visible,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
  })
  return { ref, result }
}
