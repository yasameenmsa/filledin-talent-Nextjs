'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
  enabled?: boolean
}

interface UseInfiniteScrollReturn {
  ref: (node: HTMLElement | null) => void
  isIntersecting: boolean
}

/**
 * Custom hook for infinite scrolling
 *
 * Uses Intersection Observer API to detect when the user has scrolled
 * to the bottom of the content area, triggering a callback to load more items.
 */
export function useInfiniteScroll(
  callback: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!enabled || !node) return

      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      // Create new observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry?.isIntersecting) {
            setIsIntersecting(true)
            callback()
          } else {
            setIsIntersecting(false)
          }
        },
        { threshold, rootMargin }
      )

      observerRef.current.observe(node)
    },
    [callback, threshold, rootMargin, enabled]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return { ref, isIntersecting }
}

/**
 * Hook for managing infinite scroll state
 */
export function useInfiniteScrollList<T>(fetchItems: (page: number) => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const newItems = await fetchItems(page)

      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        setItems(prev => [...prev, ...newItems])
        setPage(prev => prev + 1)
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [fetchItems, page, loading, hasMore])

  const reset = useCallback(() => {
    setItems([])
    setPage(1)
    setLoading(false)
    setHasMore(true)
    setError(null)
  }, [])

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
  }
}
