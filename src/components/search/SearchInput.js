// src/components/search/SearchInput.js
import { forwardRef } from 'react'
import { colors } from '@/components/preview/tokens'

const SearchInput = forwardRef(function SearchInput({ value, onChange, onClear, fonts, showEscHint = true }, ref) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Magnifying glass icon */}
      <svg
        width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="rgba(250,248,245,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        ref={ref}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search services, treatments, providers..."
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        style={{
          fontFamily: fonts?.body || 'inherit',
          fontSize: '1.125rem',
          fontWeight: 500,
          width: '100%',
          padding: '0.875rem 5rem 0.875rem 3rem',
          borderRadius: '1rem',
          border: '1.5px solid rgba(250,248,245,0.12)',
          backgroundColor: 'rgba(250,248,245,0.06)',
          color: colors.white,
          outline: 'none',
          caretColor: colors.violet,
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)' }}
        onBlur={e => { e.target.style.borderColor = 'rgba(250,248,245,0.12)' }}
      />

      {/* Right side: clear button + Esc hint */}
      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {value && (
          <button
            onClick={onClear}
            style={{
              background: 'rgba(250,248,245,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(250,248,245,0.5)',
              fontSize: '0.75rem',
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        {showEscHint && (
          <kbd style={{
            fontFamily: fonts?.body || 'inherit',
            fontSize: '0.6875rem',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'rgba(250,248,245,0.08)',
            color: 'rgba(250,248,245,0.35)',
            border: '1px solid rgba(250,248,245,0.1)',
          }}>
            ESC
          </kbd>
        )}
      </div>
    </div>
  )
})

export default SearchInput
