// src/components/beta/MemberPageWidget.js
// Personalized member widget for beta page heroes.
// Variants: services, team, location — adapts content per page.
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { colors, gradients } from '@/components/preview/tokens'
import { useMember } from '@/context/MemberContext'

const LOCATION_LABELS = { westfield: 'Westfield', carmel: 'Carmel' }

const cardBase = {
  borderRadius: '1.5rem',
  background: 'rgba(26,26,26,0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(124,58,237,0.2)',
  padding: 'clamp(1.25rem, 2.5vw, 2rem)',
}

function daysAgo(dateStr) {
  if (!dateStr) return null
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'yesterday'
  return `${diff} days ago`
}

// ─── Services Variant ───
function ServicesVariant({ member, profile, fonts, openDrawer, openRebookModal }) {
  const lastSvc = profile.lastService
  const rec = profile.recommendations?.[0]
  const categories = profile.serviceCategories || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Greeting */}
      <div>
        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.violet, marginBottom: 4 }}>
          Your Treatments
        </p>
        <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white }}>
          Hey, {member.first_name}
        </p>
      </div>

      {/* Last service */}
      {lastSvc && (
        <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white }}>{lastSvc.name}</p>
              <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>
                {lastSvc.provider?.name ? `w/ ${lastSvc.provider.name}` : ''}{lastSvc.date ? ` · ${daysAgo(lastSvc.date)}` : ''}
              </p>
            </div>
            {lastSvc.slug && lastSvc.provider?.staffId && (
              <button
                onClick={() => openRebookModal({
                  serviceSlug: lastSvc.slug,
                  serviceName: lastSvc.name,
                  providerName: lastSvc.provider?.name,
                  providerStaffId: lastSvc.provider?.staffId,
                  locationKey: lastSvc.location_key,
                  lastVisitDate: lastSvc.date,
                })}
                style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, padding: '0.375rem 0.875rem', borderRadius: 999, background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}
              >
                Rebook
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top recommendation */}
      {rec && (
        <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', background: `${colors.violet}08`, border: `1px solid ${colors.violet}20` }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white, marginBottom: 2 }}>{rec.title}</p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.45)', lineHeight: 1.4 }}>{rec.subtitle}</p>
        </div>
      )}

      {/* Services tried pills */}
      {categories.length > 0 && (
        <div>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.3)', marginBottom: 8 }}>
            Services You've Tried
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {categories.slice(0, 6).map(cat => (
              <span key={cat.slug} style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, padding: '0.3rem 0.625rem', borderRadius: 999, background: `${colors.violet}12`, color: colors.violet }}>{cat.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* See all */}
      <button
        onClick={() => openDrawer('visits')}
        style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
      >
        See your full history →
      </button>
    </div>
  )
}

// ─── Team Variant ───
function TeamVariant({ member, profile, fonts, openDrawer, openRebookModal }) {
  const providers = profile.providers || []
  const topProviders = providers.slice(0, 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Greeting */}
      <div>
        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.violet, marginBottom: 4 }}>
          Your Providers
        </p>
        <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white }}>
          Hey, {member.first_name}
        </p>
      </div>

      {/* Provider list */}
      {topProviders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topProviders.map((p, i) => (
            <div key={p.staffId || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 0.875rem', borderRadius: '0.75rem', background: i === 0 ? `${colors.violet}08` : 'rgba(250,248,245,0.03)', border: `1px solid ${i === 0 ? `${colors.violet}20` : 'rgba(250,248,245,0.06)'}` }}>
              {p.image
                ? <img src={p.image} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(250,248,245,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(250,248,245,0.3)', flexShrink: 0 }}>{(p.name || '?')[0]}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white }}>
                  {p.name}
                  {i === 0 && <span style={{ fontSize: '0.625rem', fontWeight: 500, color: colors.violet, marginLeft: 6 }}>Your go-to</span>}
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>
                  {p.title || 'Provider'} · {p.visit_count} visit{p.visit_count !== 1 ? 's' : ''}
                </p>
              </div>
              {p.serviceMap && Object.keys(p.serviceMap).length > 0 && (
                <button
                  onClick={() => {
                    // Find the most recent service slug this provider did
                    const lastVisitWithProvider = profile.visits?.find(v =>
                      v.services?.some(s => s.provider?.staffId === p.staffId)
                    )
                    const svc = lastVisitWithProvider?.services?.find(s => s.provider?.staffId === p.staffId)
                    if (svc) {
                      openRebookModal({
                        serviceSlug: svc.slug,
                        serviceName: svc.name,
                        providerName: p.name,
                        providerStaffId: p.staffId,
                        locationKey: lastVisitWithProvider.location,
                        lastVisitDate: lastVisitWithProvider.date,
                      })
                    }
                  }}
                  style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, padding: '0.3rem 0.625rem', borderRadius: 999, background: `${colors.violet}15`, color: colors.violet, border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  Book
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)' }}>
          Book your first visit to see your provider history here.
        </p>
      )}

      {/* See all */}
      {providers.length > 3 && (
        <button
          onClick={() => openDrawer('providers')}
          style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
        >
          All your providers →
        </button>
      )}
      <button
        onClick={() => openDrawer('account')}
        style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: 'rgba(250,248,245,0.35)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
      >
        Open My RELUXE →
      </button>
    </div>
  )
}

// ─── Location Variant ───
function LocationVariant({ member, profile, fonts, openDrawer, openRebookModal, locationKey }) {
  const split = profile.locationSplit
  const locData = split?.locations?.find(l => l.key === locationKey)
  const isHome = split?.primary === locationKey
  const locLabel = LOCATION_LABELS[locationKey] || locationKey

  // Filter visits to this location
  const visitsHere = useMemo(() => {
    return (profile.visits || []).filter(v => v.location === locationKey)
  }, [profile.visits, locationKey])

  const lastVisitHere = visitsHere[0]
  const lastSvc = lastVisitHere?.services?.[0]

  // Providers seen at this location
  const providersHere = useMemo(() => {
    const seen = new Map()
    for (const v of visitsHere) {
      for (const svc of (v.services || [])) {
        if (svc.provider?.staffId && !seen.has(svc.provider.staffId)) {
          seen.set(svc.provider.staffId, svc.provider)
        }
      }
    }
    return [...seen.values()].slice(0, 3)
  }, [visitsHere])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Greeting */}
      <div>
        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.violet, marginBottom: 4 }}>
          Your {locLabel} History
        </p>
        <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white }}>
          Hey, {member.first_name}
        </p>
      </div>

      {/* Visit stats at this location */}
      {locData ? (
        <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', background: isHome ? `${colors.violet}08` : 'rgba(250,248,245,0.04)', border: `1px solid ${isHome ? `${colors.violet}20` : 'rgba(250,248,245,0.06)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white }}>
              {locData.visits} visit{locData.visits !== 1 ? 's' : ''} here
            </span>
            {isHome && <span style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, color: colors.violet, background: `${colors.violet}15`, padding: '0.15rem 0.5rem', borderRadius: 999 }}>Home base</span>}
          </div>
          {split?.multi && (
            <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>
              {locData.pct}% of your visits
            </p>
          )}
        </div>
      ) : (
        <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.06)' }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.45)' }}>
            You haven't visited {locLabel} yet. Book your first appointment here!
          </p>
        </div>
      )}

      {/* Last visit at this location */}
      {lastVisitHere && lastSvc && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.875rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)' }}>
          <div>
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white }}>{lastSvc.name}</p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>
              {lastSvc.provider?.name ? `w/ ${lastSvc.provider.name} · ` : ''}{daysAgo(lastVisitHere.date)}
            </p>
          </div>
          {lastSvc.slug && lastSvc.provider?.staffId && (
            <button
              onClick={() => openRebookModal({
                serviceSlug: lastSvc.slug,
                serviceName: lastSvc.name,
                providerName: lastSvc.provider?.name,
                providerStaffId: lastSvc.provider?.staffId,
                locationKey,
                lastVisitDate: lastVisitHere.date,
              })}
              style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, padding: '0.3rem 0.625rem', borderRadius: 999, background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              Rebook
            </button>
          )}
        </div>
      )}

      {/* Providers at this location */}
      {providersHere.length > 0 && (
        <div>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.3)', marginBottom: 8 }}>
            Your providers here
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {providersHere.map((p) => (
              <div key={p.staffId} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.625rem', borderRadius: 999, background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.06)' }}>
                {p.image && <img src={p.image} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />}
                <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(250,248,245,0.6)' }}>{p.name?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open drawer */}
      <button
        onClick={() => openDrawer('locations')}
        style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
      >
        Your full profile →
      </button>
    </div>
  )
}

// ─── Main Component ───
export default function MemberPageWidget({ variant, fonts, locationKey }) {
  const { member, profile, isAuthenticated, openDrawer, openRebookModal } = useMember()

  if (!isAuthenticated || !profile || !member) return null

  const sharedProps = { member, profile, fonts, openDrawer, openRebookModal }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={cardBase}
    >
      {variant === 'services' && <ServicesVariant {...sharedProps} />}
      {variant === 'team' && <TeamVariant {...sharedProps} />}
      {variant === 'location' && <LocationVariant {...sharedProps} locationKey={locationKey} />}
    </motion.div>
  )
}
