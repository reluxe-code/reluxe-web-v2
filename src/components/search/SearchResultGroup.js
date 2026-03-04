// src/components/search/SearchResultGroup.js
import SearchResultCard from './SearchResultCard'
import { colors } from '@/components/preview/tokens'

const TYPE_LABELS = {
  services: 'Services',
  conditions: 'Conditions',
  faqs: 'FAQs',
  locations: 'Locations',
  comparisons: 'Comparisons',
  costGuides: 'Cost Guides',
  blog: 'Blog',
  team: 'Team',
  products: 'Products',
  deals: 'Deals',
  stories: 'Stories',
  inspiration: 'Inspiration',
}

export default function SearchResultGroup({
  groupKey,
  results,
  query,
  fonts,
  activeIndex,
  startIndex,
  onResultClick,
  maxShow = 3,
}) {
  if (!results?.length) return null

  const shown = results.slice(0, maxShow)
  const remaining = results.length - maxShow

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        padding: '0 4px',
      }}>
        <span style={{
          fontFamily: fonts?.body || 'inherit',
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'rgba(250,248,245,0.35)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {TYPE_LABELS[groupKey] || groupKey}
        </span>
        <span style={{
          fontFamily: fonts?.body || 'inherit',
          fontSize: '0.625rem',
          color: 'rgba(250,248,245,0.25)',
        }}>
          {results.length} result{results.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {shown.map((result, i) => (
          <SearchResultCard
            key={result.url || i}
            result={result}
            index={startIndex + i}
            isActive={activeIndex === startIndex + i}
            fonts={fonts}
            onClick={onResultClick}
            compact
          />
        ))}
      </div>

      {/* View all link */}
      {remaining > 0 && (
        <a
          href={`/search?q=${encodeURIComponent(query)}&type=${groupKey}`}
          onClick={e => { if (onResultClick) onResultClick(e, null, -1) }}
          style={{
            display: 'block',
            fontFamily: fonts?.body || 'inherit',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: colors.violet,
            textDecoration: 'none',
            padding: '6px 16px',
            marginTop: 4,
          }}
        >
          View all {results.length} {TYPE_LABELS[groupKey]?.toLowerCase() || 'results'} →
        </a>
      )}
    </div>
  )
}
