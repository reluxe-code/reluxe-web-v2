// src/components/search/useSearchQuery.js
import { useState, useEffect, useRef, useCallback } from 'react'

export default function useSearchQuery(query, { debounceMs = 250 } = {}) {
  const [results, setResults] = useState([])
  const [groups, setGroups] = useState({})
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [didYouMean, setDidYouMean] = useState(null)
  const abortRef = useRef(null)
  const timerRef = useRef(null)

  const search = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([])
      setGroups({})
      setTotal(0)
      setDidYouMean(null)
      setLoading(false)
      return
    }

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&limit=30`, {
        signal: controller.signal,
      })
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      if (!controller.signal.aborted) {
        setResults(data.results || [])
        setGroups(data.groups || {})
        setTotal(data.total || 0)
        setDidYouMean(data.didYouMean || null)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Search failed. Please try again.')
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!query || query.trim().length < 2) {
      setResults([])
      setGroups({})
      setTotal(0)
      setDidYouMean(null)
      setLoading(false)
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(() => search(query), debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, debounceMs, search])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { results, groups, total, loading, error, didYouMean }
}
