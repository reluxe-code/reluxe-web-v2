// src/components/booking/WidgetFallback.js
// Inline fallback shown when Boulevard API is degraded.
// Opens the Boulevard native booking widget instead.
import { colors, gradients } from '@/components/preview/tokens'

// Best-effort mapping from category/service names to widget slugs.
// Falls back to '' (general menu) if no match found.
const NAME_TO_SLUG = {
  'injectables': 'tox',
  'wrinkle relaxers': 'tox',
  'tox': 'tox',
  'botox': 'botox',
  'filler': 'filler',
  'fillers': 'filler',
  'massage': 'massage',
  'hydrafacial': 'hydrafacial',
  'glo2facial': 'glo2facial',
  'facials': 'facials',
  'signature facials': 'facials',
  'microneedling': 'morpheus8',
  'morpheus8': 'morpheus8',
  'laser': 'ipl',
  'body contouring': 'body-contouring',
  'consultations': 'consult',
  'salt': 'salt-sauna',
  'sauna': 'salt-sauna',
}

function resolveSlug(serviceSlug, serviceName, categoryName) {
  // Direct slug match is best
  if (serviceSlug) return serviceSlug

  // Try service name
  const sName = (serviceName || '').toLowerCase()
  for (const [key, slug] of Object.entries(NAME_TO_SLUG)) {
    if (sName.includes(key)) return slug
  }

  // Try category name
  const cName = (categoryName || '').toLowerCase()
  for (const [key, slug] of Object.entries(NAME_TO_SLUG)) {
    if (cName.includes(key)) return slug
  }

  // Default: open general menu
  return ''
}

export default function WidgetFallback({ slug, serviceName, categoryName, locationKey, onClose, fonts }) {
  const resolvedSlug = resolveSlug(slug, serviceName, categoryName)

  const handleBookWithWidget = () => {
    if (typeof window !== 'undefined' && window.__openBlvdForSlug) {
      window.__openBlvdForSlug(resolvedSlug, locationKey)
    }
    onClose?.()
  }

  return (
    <div style={{
      padding: '1.5rem', borderRadius: 16, textAlign: 'center',
      border: '1px solid rgba(250,248,245,0.08)',
      background: 'rgba(250,248,245,0.02)',
    }}>
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px',
        background: 'rgba(167,139,250,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>

      <p style={{
        fontFamily: fonts?.body, fontSize: '0.9375rem', fontWeight: 600,
        color: colors.white, margin: '0 0 6px',
      }}>
        High demand right now
      </p>

      <p style={{
        fontFamily: fonts?.body, fontSize: '0.8125rem', lineHeight: 1.45,
        color: 'rgba(250,248,245,0.5)', margin: '0 0 20px',
      }}>
        Complete your booking below — same providers, same experience.
      </p>

      <button
        onClick={handleBookWithWidget}
        style={{
          width: '100%', padding: '0.875rem 1.5rem', borderRadius: 999,
          border: 'none', cursor: 'pointer',
          background: gradients.primary,
          fontFamily: fonts?.body, fontSize: '0.9375rem', fontWeight: 700,
          color: '#fff', letterSpacing: '0.01em',
        }}
      >
        Continue Booking
      </button>

      <p style={{
        fontFamily: fonts?.body, fontSize: '0.6875rem',
        color: 'rgba(250,248,245,0.3)', margin: '10px 0 0',
      }}>
        Opens RELUXE booking powered by Boulevard
      </p>
    </div>
  )
}
