// src/components/search/SearchOverlay.js
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { useSearch } from '@/context/SearchContext'
import { fontPairings, colors } from '@/components/preview/tokens'
import SearchInput from './SearchInput'
import SearchResultGroup from './SearchResultGroup'
import SearchResultCard from './SearchResultCard'
import SearchEmptyState, { addRecentSearch } from './SearchEmptyState'
import useSearchQuery from './useSearchQuery'
import { trackSearchQuery, trackSearchClick } from '@/lib/trackSearchEvent'

const fonts = fontPairings.bold

// Priority order for grouped results in overlay
const GROUP_ORDER = ['services', 'conditions', 'team', 'blog', 'locations', 'products', 'deals', 'stories', 'inspiration', 'faqs', 'comparisons', 'costGuides']

export default function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useSearch()
  const router = useRouter()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const { results, groups, total, loading, error, didYouMean } = useSearchQuery(query)
  const trackedQueryRef = useRef('')

  // Focus input when overlay opens
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('')
      setActiveIndex(-1)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isSearchOpen])

  // Track search queries (debounced — only when results arrive)
  useEffect(() => {
    if (query && !loading && trackedQueryRef.current !== query) {
      trackedQueryRef.current = query
      const source = typeof window !== 'undefined' && window.__searchSource === 'keyboard_shortcut'
        ? 'keyboard_shortcut' : 'overlay'
      trackSearchQuery(query, total, source)
    }
  }, [query, loading, total])

  // Build flat results list for keyboard navigation
  const flatResults = useMemo(() => {
    if (!query || total === 0) return []
    const flat = []
    for (const key of GROUP_ORDER) {
      const count = groups[key]
      if (!count) continue
      const groupResults = results.filter(r => {
        const typeMap = {
          services: 'Service', conditions: 'Condition', faqs: 'FAQ',
          locations: 'Location', comparisons: 'Comparison', costGuides: 'Cost Guide',
          blog: 'Blog', team: 'Team', products: 'Product',
          deals: 'Deal', stories: 'Story', inspiration: 'Inspiration',
        }
        return r.type === typeMap[key]
      }).slice(0, 3)
      flat.push(...groupResults)
    }
    return flat
  }, [results, groups, query, total])

  // Keyboard navigation
  const onKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0 && flatResults[activeIndex]) {
      e.preventDefault()
      navigateToResult(flatResults[activeIndex], activeIndex)
    } else if (e.key === 'Enter' && query.trim()) {
      e.preventDefault()
      addRecentSearch(query)
      closeSearch()
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }, [activeIndex, flatResults, query, closeSearch, router])

  const navigateToResult = useCallback((result, index) => {
    if (!result) return
    addRecentSearch(query)
    const source = typeof window !== 'undefined' && window.__searchSource === 'keyboard_shortcut'
      ? 'keyboard_shortcut' : 'overlay'
    trackSearchClick(query, result.url, result.title, result.type, index, source)
    closeSearch()
    router.push(result.url)
  }, [query, closeSearch, router])

  const onResultClick = useCallback((e, result, index) => {
    if (!result) return
    e.preventDefault()
    navigateToResult(result, index)
  }, [navigateToResult])

  const onSearchSelect = useCallback((q) => {
    setQuery(q)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }, [])

  const handleViewAll = useCallback(() => {
    if (!query.trim()) return
    addRecentSearch(query)
    closeSearch()
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }, [query, closeSearch, router])

  // Build grouped results for display
  const groupedDisplay = useMemo(() => {
    if (!query || total === 0) return []
    const display = []
    let runningIndex = 0
    for (const key of GROUP_ORDER) {
      const count = groups[key]
      if (!count) continue
      const typeMap = {
        services: 'Service', conditions: 'Condition', faqs: 'FAQ',
        locations: 'Location', comparisons: 'Comparison', costGuides: 'Cost Guide',
        blog: 'Blog', team: 'Team', products: 'Product',
        deals: 'Deal', stories: 'Story', inspiration: 'Inspiration',
      }
      const groupResults = results.filter(r => r.type === typeMap[key])
      display.push({ key, results: groupResults, startIndex: runningIndex })
      runningIndex += Math.min(groupResults.length, 3)
    }
    return display
  }, [results, groups, query, total])

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSearch}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              backgroundColor: 'rgba(26,26,26,0.96)',
              backdropFilter: 'blur(24px)',
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 51,
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div style={{
              maxWidth: 640,
              margin: '0 auto',
              padding: '80px 20px 32px',
              position: 'relative',
            }}>
              {/* Close button */}
              <button
                onClick={closeSearch}
                aria-label="Close search"
                style={{
                  position: 'absolute',
                  top: 32,
                  right: 20,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '1px solid rgba(250,248,245,0.12)',
                  background: 'rgba(250,248,245,0.06)',
                  color: 'rgba(250,248,245,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.125rem',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(250,248,245,0.12)'
                  e.currentTarget.style.color = 'rgba(250,248,245,0.8)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(250,248,245,0.06)'
                  e.currentTarget.style.color = 'rgba(250,248,245,0.5)'
                }}
              >
                ✕
              </button>

              {/* Search input */}
              <SearchInput
                ref={inputRef}
                value={query}
                onChange={v => { setQuery(v); setActiveIndex(-1) }}
                onClear={() => { setQuery(''); inputRef.current?.focus() }}
                fonts={fonts}
              />

              {/* Content area */}
              <div style={{ marginTop: 16 }}>
                {/* Loading skeleton */}
                {loading && query && (
                  <div style={{ padding: '12px 4px' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{
                        height: 44, borderRadius: '0.625rem',
                        backgroundColor: 'rgba(250,248,245,0.04)',
                        marginBottom: 4,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }} />
                    ))}
                  </div>
                )}

                {/* Empty state (no query) */}
                {!query && !loading && (
                  <SearchEmptyState fonts={fonts} onSearchSelect={onSearchSelect} />
                )}

                {/* Results */}
                {!loading && query && total > 0 && (
                  <div>
                    {groupedDisplay.map(g => (
                      <SearchResultGroup
                        key={g.key}
                        groupKey={g.key}
                        results={g.results}
                        query={query}
                        fonts={fonts}
                        activeIndex={activeIndex}
                        startIndex={g.startIndex}
                        onResultClick={onResultClick}
                      />
                    ))}

                    {/* View all results on full page */}
                    <button
                      onClick={handleViewAll}
                      style={{
                        width: '100%',
                        fontFamily: fonts.body,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: colors.white,
                        padding: '12px',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(250,248,245,0.1)',
                        background: 'rgba(250,248,245,0.04)',
                        cursor: 'pointer',
                        marginTop: 8,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(124,58,237,0.1)'
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(250,248,245,0.04)'
                        e.currentTarget.style.borderColor = 'rgba(250,248,245,0.1)'
                      }}
                    >
                      View all {total} results →
                    </button>
                  </div>
                )}

                {/* No results */}
                {!loading && query && total === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <p style={{
                      fontFamily: fonts.body,
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: colors.white,
                      marginBottom: 4,
                    }}>
                      No results for &ldquo;{query}&rdquo;
                    </p>
                    {didYouMean && (
                      <p style={{
                        fontFamily: fonts.body,
                        fontSize: '0.8125rem',
                        color: 'rgba(250,248,245,0.5)',
                        marginBottom: 16,
                      }}>
                        Did you mean{' '}
                        <button
                          onClick={() => onSearchSelect(didYouMean)}
                          style={{
                            color: colors.violet,
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
                            textDecoration: 'underline', textUnderlineOffset: 2,
                          }}
                        >
                          {didYouMean}
                        </button>
                        ?
                      </p>
                    )}
                    <SearchEmptyState fonts={fonts} onSearchSelect={onSearchSelect} />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <p style={{
                    fontFamily: fonts.body,
                    fontSize: '0.8125rem',
                    color: colors.rose,
                    textAlign: 'center',
                    padding: '16px 0',
                  }}>
                    {error}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
