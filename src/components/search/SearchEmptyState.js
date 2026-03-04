// src/components/search/SearchEmptyState.js
import { useState, useEffect } from 'react'
import { colors } from '@/components/preview/tokens'

const POPULAR_SEARCHES = [
  'Botox',
  'HydraFacial',
  'Morpheus8',
  'Fillers',
  'Laser Hair Removal',
  'Facials',
  'Acne Scars',
  'Lip Filler',
  'Microneedling',
  'Chemical Peel',
]

const RECENT_KEY = 'reluxe_recent_searches'
const MAX_RECENT = 8

export function getRecentSearches() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

export function addRecentSearch(query) {
  if (typeof window === 'undefined' || !query?.trim()) return
  const q = query.trim()
  const existing = getRecentSearches().filter(s => s.query.toLowerCase() !== q.toLowerCase())
  existing.unshift({ query: q, timestamp: Date.now() })
  localStorage.setItem(RECENT_KEY, JSON.stringify(existing.slice(0, MAX_RECENT)))
}

export function clearRecentSearches() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(RECENT_KEY)
}

export default function SearchEmptyState({ fonts, onSearchSelect }) {
  const [recent, setRecent] = useState([])

  useEffect(() => {
    setRecent(getRecentSearches())
  }, [])

  const handleClear = () => {
    clearRecentSearches()
    setRecent([])
  }

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Recent searches */}
      {recent.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 4px', marginBottom: 10,
          }}>
            <span style={{
              fontFamily: fonts?.body || 'inherit',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'rgba(250,248,245,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Recent Searches
            </span>
            <button
              onClick={handleClear}
              style={{
                fontFamily: fonts?.body || 'inherit',
                fontSize: '0.6875rem',
                color: 'rgba(250,248,245,0.3)',
                background: 'none', border: 'none', cursor: 'pointer',
                textDecoration: 'underline', textUnderlineOffset: 2,
              }}
            >
              Clear
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {recent.map(r => (
              <button
                key={r.query}
                onClick={() => onSearchSelect(r.query)}
                style={{
                  fontFamily: fonts?.body || 'inherit',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'rgba(250,248,245,0.7)',
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: '1px solid rgba(250,248,245,0.1)',
                  background: 'rgba(250,248,245,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(250,248,245,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(250,248,245,0.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(250,248,245,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(250,248,245,0.1)'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(250,248,245,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                {r.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular searches */}
      <div>
        <span style={{
          display: 'block',
          fontFamily: fonts?.body || 'inherit',
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'rgba(250,248,245,0.35)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0 4px',
          marginBottom: 10,
        }}>
          Popular Searches
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {POPULAR_SEARCHES.map(s => (
            <button
              key={s}
              onClick={() => onSearchSelect(s)}
              style={{
                fontFamily: fonts?.body || 'inherit',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'rgba(250,248,245,0.55)',
                padding: '6px 14px',
                borderRadius: 999,
                border: '1px solid rgba(250,248,245,0.08)',
                background: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(250,248,245,0.05)'
                e.currentTarget.style.color = 'rgba(250,248,245,0.8)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none'
                e.currentTarget.style.color = 'rgba(250,248,245,0.55)'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard hint */}
      <div style={{
        marginTop: 28,
        padding: '0 4px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{
          fontFamily: fonts?.body || 'inherit',
          fontSize: '0.6875rem',
          color: 'rgba(250,248,245,0.2)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <kbd style={{
            padding: '1px 4px', borderRadius: 3,
            background: 'rgba(250,248,245,0.06)',
            border: '1px solid rgba(250,248,245,0.08)',
            fontSize: '0.625rem',
          }}>↑↓</kbd>
          navigate
        </span>
        <span style={{
          fontFamily: fonts?.body || 'inherit',
          fontSize: '0.6875rem',
          color: 'rgba(250,248,245,0.2)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <kbd style={{
            padding: '1px 4px', borderRadius: 3,
            background: 'rgba(250,248,245,0.06)',
            border: '1px solid rgba(250,248,245,0.08)',
            fontSize: '0.625rem',
          }}>↵</kbd>
          select
        </span>
        <span style={{
          fontFamily: fonts?.body || 'inherit',
          fontSize: '0.6875rem',
          color: 'rgba(250,248,245,0.2)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <kbd style={{
            padding: '1px 4px', borderRadius: 3,
            background: 'rgba(250,248,245,0.06)',
            border: '1px solid rgba(250,248,245,0.08)',
            fontSize: '0.625rem',
          }}>esc</kbd>
          close
        </span>
      </div>
    </div>
  )
}
