// src/hooks/useClientJit.js
// Auto-resolves boulevard_ids → client names via JIT endpoint.
// Batches requests (10 per call), caches results across renders.
// Returns masked data by default; call reveal() for full PII.
import { useState, useEffect, useCallback, useRef } from 'react'
import { adminFetch } from '@/lib/adminFetch'

// Module-level cache shared across all hook instances (same page)
const globalCache = {}

export function useClientJit(boulevardIds) {
  const [clients, setClients] = useState(globalCache)
  const [loading, setLoading] = useState(false)
  const pendingRef = useRef(new Set())

  useEffect(() => {
    const ids = (boulevardIds || []).filter(
      (id) => id && !globalCache[id] && !pendingRef.current.has(id)
    )
    if (!ids.length) return

    // Mark as pending to prevent duplicate requests
    for (const id of ids) pendingRef.current.add(id)
    setLoading(true)

    // Batch in groups of 10
    const batches = []
    for (let i = 0; i < ids.length; i += 10) {
      batches.push(ids.slice(i, i + 10))
    }

    Promise.all(
      batches.map((batch) =>
        adminFetch(
          `/api/admin/intelligence/client-jit?boulevard_ids=${batch.join(',')}`
        )
          .then((r) => r.json())
          .then((data) => data.clients || {})
          .catch(() => ({}))
      )
    ).then((results) => {
      for (const result of results) {
        Object.assign(globalCache, result)
      }
      for (const id of ids) pendingRef.current.delete(id)
      setClients({ ...globalCache })
      setLoading(false)
    })
  }, [boulevardIds?.join(',')])

  const reveal = useCallback(async (boulevardId) => {
    if (!boulevardId) return null
    try {
      const res = await adminFetch(
        `/api/admin/intelligence/client-jit?boulevard_id=${boulevardId}&reveal=true`
      )
      const data = await res.json()
      if (data.client) {
        globalCache[boulevardId] = {
          ...globalCache[boulevardId],
          ...data.client,
          _revealed: true,
        }
        setClients({ ...globalCache })
      }
      return data.client
    } catch {
      return null
    }
  }, [])

  return { clients, loading, reveal }
}

// Helper to get display name from JIT result
export function jitDisplayName(jitClient, fallbackName) {
  if (!jitClient) return fallbackName || 'Unknown'
  if (jitClient._revealed) {
    return [jitClient.firstName, jitClient.lastName].filter(Boolean).join(' ') || fallbackName || 'Unknown'
  }
  return [jitClient.firstName, jitClient.lastInitial].filter(Boolean).join(' ') || fallbackName || 'Unknown'
}

// Helper to get contact display from JIT result
export function jitContactInfo(jitClient, fallbackEmail, fallbackPhone) {
  if (!jitClient) return fallbackEmail || fallbackPhone || ''
  if (jitClient._revealed) {
    return jitClient.email || jitClient.mobilePhone || ''
  }
  return jitClient.emailMasked || jitClient.phoneMasked || ''
}

// Clear cache (useful for testing)
export function clearJitCache() {
  for (const key of Object.keys(globalCache)) delete globalCache[key]
}
