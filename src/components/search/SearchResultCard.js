// src/components/search/SearchResultCard.js
import { colors } from '@/components/preview/tokens'

const TYPE_COLORS = {
  Service: { bg: 'rgba(124,58,237,0.15)', text: colors.violet },
  Condition: { bg: 'rgba(192,38,211,0.15)', text: '#C026D3' },
  Team: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  Blog: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  Product: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  Deal: { bg: 'rgba(225,29,115,0.15)', text: colors.rose },
  Location: { bg: 'rgba(14,165,233,0.15)', text: '#0EA5E9' },
  FAQ: { bg: 'rgba(250,248,245,0.08)', text: 'rgba(250,248,245,0.5)' },
  Story: { bg: 'rgba(168,85,247,0.15)', text: '#A855F7' },
  Inspiration: { bg: 'rgba(236,72,153,0.15)', text: '#EC4899' },
  Comparison: { bg: 'rgba(250,248,245,0.08)', text: 'rgba(250,248,245,0.5)' },
  'Cost Guide': { bg: 'rgba(250,248,245,0.08)', text: 'rgba(250,248,245,0.5)' },
}

export default function SearchResultCard({ result, index, isActive, fonts, onClick, compact = false }) {
  const typeStyle = TYPE_COLORS[result.type] || TYPE_COLORS.FAQ
  const hasImage = result.image && (result.type === 'Service' || result.type === 'Team' || result.type === 'Product' || result.type === 'Blog')

  return (
    <a
      href={result.url}
      onClick={e => {
        if (onClick) onClick(e, result, index)
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 10 : 14,
        padding: compact ? '8px 12px' : '12px 16px',
        borderRadius: compact ? '0.625rem' : '0.75rem',
        backgroundColor: isActive ? 'rgba(124,58,237,0.1)' : 'rgba(250,248,245,0.03)',
        border: isActive ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(250,248,245,0.06)',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgba(250,248,245,0.06)'
          e.currentTarget.style.borderColor = 'rgba(250,248,245,0.1)'
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgba(250,248,245,0.03)'
          e.currentTarget.style.borderColor = 'rgba(250,248,245,0.06)'
        }
      }}
    >
      {/* Image thumbnail */}
      {hasImage && !compact && (
        <div style={{
          width: 48, height: 48, borderRadius: result.type === 'Team' ? '50%' : '0.5rem',
          overflow: 'hidden', flexShrink: 0,
          backgroundColor: 'rgba(250,248,245,0.06)',
        }}>
          <img
            src={result.image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: fonts?.body || 'inherit',
            fontSize: compact ? '0.8125rem' : '0.875rem',
            fontWeight: 600,
            color: colors.white,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {result.title}
          </span>
          <span style={{
            fontSize: '0.625rem',
            fontWeight: 600,
            fontFamily: fonts?.body || 'inherit',
            padding: '2px 6px',
            borderRadius: 999,
            backgroundColor: typeStyle.bg,
            color: typeStyle.text,
            flexShrink: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {result.type}
          </span>
        </div>
        {result.description && !compact && (
          <p style={{
            fontFamily: fonts?.body || 'inherit',
            fontSize: '0.75rem',
            color: 'rgba(250,248,245,0.45)',
            marginTop: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {result.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke={isActive ? colors.violet : 'rgba(250,248,245,0.2)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, transition: 'stroke 0.15s' }}
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </a>
  )
}
