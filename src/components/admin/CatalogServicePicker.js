// src/components/admin/CatalogServicePicker.js
// Search-as-you-type picker for Boulevard services from the cached catalog.
import { useState, useEffect, useRef, useCallback } from 'react'

export default function CatalogServicePicker({ onSelect, location = 'all', placeholder = 'Search Boulevard services...' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)

  const search = useCallback(async (q) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (location && location !== 'all') params.set('location', location)
      const res = await fetch(`/api/admin/blvd-catalog?${params}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [location])

  useEffect(() => {
    if (!query.trim() && !open) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, search, open])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleFocus() {
    setOpen(true)
    if (results.length === 0) search(query)
  }

  function handleSelect(item) {
    onSelect({
      catalogId: item.id,
      label: item.name,
      categoryName: item.category_name,
      locationKey: item.location_key,
    })
    setQuery('')
    setOpen(false)
  }

  // Group results by category
  const grouped = results.reduce((acc, item) => {
    const cat = item.category_name || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-1.5 text-sm"
      />
      {loading && (
        <div className="absolute right-3 top-2 text-xs text-neutral-400">...</div>
      )}

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-50 sticky top-0">
                {category}
              </div>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3 py-2 hover:bg-violet-50 transition flex items-center gap-2"
                >
                  <span className="text-sm flex-1">{item.name}</span>
                  <span className="text-[10px] text-neutral-400 uppercase shrink-0">
                    {item.location_key}
                  </span>
                  {item.duration_min && (
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {item.duration_min}m
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {open && !loading && query.trim() && results.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg p-3 text-sm text-neutral-400 text-center">
          No services found. Try syncing the catalog first.
        </div>
      )}
    </div>
  )
}
