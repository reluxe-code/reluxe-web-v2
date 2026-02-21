// src/components/beta/MemberDrawer.js
// Slide-out drawer for member dashboard deep-dive.
// Opens from HeroIdentityCard when clicking stats, visits, providers, avatar, etc.
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, gradients } from '@/components/preview/tokens'
import { useMember } from '@/context/MemberContext'

// ─── Section: Visit History ───
function VisitsSection({ visits, fonts, onRebook }) {
  if (!visits?.length) return <EmptyState text="No visits yet" fonts={fonts} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {visits.map((visit, i) => {
        const svc = visit.services?.[0]
        const otherCount = (visit.services?.length || 1) - 1
        const dateStr = new Date(visit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

        return (
          <div key={visit.id || i} style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>{svc?.name || 'Treatment'}</p>
                {otherCount > 0 && <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>+ {otherCount} more</p>}
              </div>
              <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(250,248,245,0.35)', flexShrink: 0, marginLeft: 8 }}>{dateStr}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {svc?.provider?.image && <img src={svc.provider.image} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />}
                <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)' }}>
                  {svc?.provider?.name || 'Provider'} · {visit.location === 'westfield' ? 'Westfield' : 'Carmel'}
                </span>
              </div>
              {svc?.slug && (
                <button onClick={() => onRebook({
                  serviceSlug: svc.slug,
                  serviceName: svc.name,
                  providerName: svc.provider?.name,
                  providerStaffId: svc.provider?.staffId,
                  locationKey: visit.location,
                  lastVisitDate: visit.date,
                })} style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, padding: '0.375rem 0.875rem', borderRadius: 999, background: `${colors.violet}15`, color: colors.violet, border: 'none', cursor: 'pointer' }}>
                  Rebook
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Section: Tox Status ───
function ToxSection({ toxStatus, fonts, onRebook, member }) {
  if (!toxStatus) return <EmptyState text="No tox history" fonts={fonts} />

  const segCfg = {
    on_schedule: { label: 'On Schedule', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: '✓' },
    due: { label: 'Due Soon', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⏰' },
    overdue: { label: 'Overdue', color: colors.rose, bg: 'rgba(225,29,115,0.1)', icon: '⚠' },
    probably_lost: { label: 'Been a While', color: colors.rose, bg: 'rgba(225,29,115,0.08)', icon: '💭' },
    lost: { label: 'Inactive', color: 'rgba(250,248,245,0.4)', bg: 'rgba(250,248,245,0.04)', icon: '—' },
  }
  const seg = segCfg[toxStatus.segment] || segCfg.on_schedule
  const nextWindow = toxStatus.avg_interval ? Math.max(0, toxStatus.avg_interval - (toxStatus.days_since_last || 0)) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: seg.bg, border: `1px solid ${seg.color}25` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: '1.25rem' }}>{seg.icon}</span>
          <span style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 700, color: seg.color }}>{seg.label}</span>
        </div>
        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.6)', lineHeight: 1.5 }}>
          {toxStatus.days_since_last != null ? `${toxStatus.days_since_last} days since your last tox session` : 'Welcome to your tox journey'}
        </p>
        {nextWindow > 0 && toxStatus.segment === 'on_schedule' && (
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', marginTop: 4 }}>Next window opens in ~{nextWindow} days</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatBox label="Tox Visits" value={toxStatus.visits || 0} fonts={fonts} />
        <StatBox label="Your Brand" value={toxStatus.primary_type || '—'} fonts={fonts} />
        <StatBox label="Avg Interval" value={toxStatus.avg_interval ? `${toxStatus.avg_interval}d` : '—'} fonts={fonts} />
        <StatBox label="Tried Multiple" value={toxStatus.switching ? 'Yes' : 'No'} fonts={fonts} />
      </div>

      {toxStatus.last_provider && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)' }}>
          {toxStatus.last_provider.image && <img src={toxStatus.last_provider.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />}
          <div>
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white }}>Your tox provider</p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.45)' }}>{toxStatus.last_provider.name}</p>
          </div>
        </div>
      )}

      {['due', 'overdue', 'probably_lost'].includes(toxStatus.segment) && (
        <button onClick={() => onRebook({
          serviceSlug: 'tox',
          serviceName: toxStatus.last_type || 'Tox',
          providerName: toxStatus.last_provider?.name,
          providerStaffId: toxStatus.last_provider?.staffId,
          locationKey: member?.preferred_location || null,
          lastVisitDate: toxStatus.days_since_last != null
            ? new Date(Date.now() - toxStatus.days_since_last * 86400000).toISOString()
            : null,
        })} style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, width: '100%', padding: '0.875rem', borderRadius: 999, background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
          Book Tox Now →
        </button>
      )}
    </div>
  )
}

// ─── Section: Providers ───
function ProvidersSection({ providers, fonts }) {
  if (!providers?.length) return <EmptyState text="No provider history yet" fonts={fonts} />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {providers.map((p, i) => (
        <a key={p.slug || i} href={`/beta/team/${p.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1rem', borderRadius: '0.75rem', background: i === 0 ? `${colors.violet}08` : 'rgba(250,248,245,0.03)', border: `1px solid ${i === 0 ? `${colors.violet}20` : 'rgba(250,248,245,0.06)'}`, textDecoration: 'none' }}>
          {p.image
            ? <img src={p.image} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(250,248,245,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: 'rgba(250,248,245,0.3)' }}>{(p.name || '?')[0]}</div>
          }
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>
              {p.name}{i === 0 && <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: colors.violet, marginLeft: 8 }}>Your go-to</span>}
            </p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.45)' }}>{p.title || 'Provider'} · {p.visit_count} visit{p.visit_count !== 1 ? 's' : ''}</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="rgba(250,248,245,0.3)" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </a>
      ))}
    </div>
  )
}

// ─── Section: Recommendations ───
function RecommendationsSection({ recommendations, fonts, onRebook, member }) {
  if (!recommendations?.length) return <EmptyState text="Check back soon for personalized tips" fonts={fonts} />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {recommendations.map((rec, i) => (
        <div key={i} style={{ padding: '1rem', borderRadius: '0.75rem', background: rec.type === 'rebook' ? `${colors.violet}08` : 'rgba(250,248,245,0.03)', border: `1px solid ${rec.type === 'rebook' ? `${colors.violet}20` : 'rgba(250,248,245,0.06)'}` }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white, marginBottom: 4 }}>{rec.title}</p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)', lineHeight: 1.5, marginBottom: 10 }}>{rec.subtitle}</p>
          <button onClick={() => onRebook({
            serviceSlug: rec.slug,
            serviceName: rec.title,
            locationKey: member?.preferred_location || null,
          })} style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: 999, background: rec.type === 'rebook' ? gradients.primary : `${colors.violet}15`, color: rec.type === 'rebook' ? '#fff' : colors.violet, border: 'none', cursor: 'pointer' }}>
            {rec.action} →
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Section: Account ───
function AccountSection({ member, stats, fonts }) {
  const memberSince = stats?.first_visit
    ? new Date(stats.first_visit).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : member?.onboarded_at ? new Date(member.onboarded_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null
  const tierLabels = { vip: 'VIP Member', high: 'Preferred Member', medium: 'RELUXE Member', low: 'RELUXE Member' }
  const tier = tierLabels[stats?.ltv_bucket] || 'RELUXE Member'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, ${colors.violet}15, ${colors.fuchsia}08)`, border: `1px solid ${colors.violet}20` }}>
        <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white, marginBottom: 4 }}>{tier}</p>
        {memberSince && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)' }}>Member since {memberSince}</p>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {stats?.total_visits > 0 && <StatBox label="Total Visits" value={stats.total_visits} fonts={fonts} />}
        {stats?.months_with_us > 0 && <StatBox label="Months With Us" value={stats.months_with_us} fonts={fonts} />}
        {stats?.avg_days_between_visits && <StatBox label="Visit Cadence" value={`${stats.avg_days_between_visits}d`} fonts={fonts} />}
        {stats?.total_treatments > 0 && <StatBox label="Treatments" value={stats.total_treatments} fonts={fonts} />}
      </div>
      <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 8 }}>Your Info</p>
        {member?.first_name && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.white }}>{member.first_name} {member.last_name || ''}</p>}
        {member?.email && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)' }}>{member.email}</p>}
      </div>
    </div>
  )
}

// ─── Section: Locations ───
const LOCATION_META = {
  westfield: { city: 'Westfield', address: '514 E State Road 32, Westfield, IN 46074', phone: '(317) 763-1142', mapUrl: 'https://maps.google.com/?q=RELUXE+Med+Spa+Westfield' },
  carmel: { city: 'Carmel', address: '10485 N Pennsylvania St, Carmel, IN 46280', phone: '(317) 763-1142', mapUrl: 'https://maps.google.com/?q=RELUXE+Med+Spa+Carmel' },
}

function LocationsSection({ locationSplit, member, fonts }) {
  const preferred = member?.preferred_location
  const locations = locationSplit?.locations || []
  const hasData = locations.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Visit split bar */}
      {hasData && (
        <div>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 10 }}>Your Visit Split</p>
          <div style={{ display: 'flex', borderRadius: 999, overflow: 'hidden', height: 8, background: 'rgba(250,248,245,0.06)' }}>
            {locations.map((loc) => (
              <div key={loc.key} style={{ width: `${loc.pct}%`, background: loc.key === 'westfield' ? colors.violet : colors.fuchsia, transition: 'width 0.5s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {locations.map((loc) => (
              <span key={loc.key} style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)' }}>
                <span style={{ color: loc.key === 'westfield' ? colors.violet : colors.fuchsia, fontWeight: 600 }}>{loc.pct}%</span> {LOCATION_META[loc.key]?.city || loc.key}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Location cards */}
      {Object.entries(LOCATION_META).map(([key, meta]) => {
        const locData = locations.find(l => l.key === key)
        const isPrimary = locationSplit?.primary === key
        return (
          <div key={key} style={{ padding: '1rem', borderRadius: '0.75rem', background: isPrimary ? `${colors.violet}08` : 'rgba(250,248,245,0.03)', border: `1px solid ${isPrimary ? `${colors.violet}20` : 'rgba(250,248,245,0.06)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isPrimary ? colors.violet : 'rgba(250,248,245,0.4)'} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.white }}>{meta.city}</span>
              </div>
              {isPrimary && <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, background: `${colors.violet}15`, padding: '0.2rem 0.5rem', borderRadius: 999 }}>Home base</span>}
            </div>
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.45)', marginBottom: 4 }}>{meta.address}</p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.45)', marginBottom: 10 }}>{meta.phone}</p>
            {locData && (
              <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.35)' }}>{locData.visits} visit{locData.visits !== 1 ? 's' : ''} here</p>
            )}
            <a href={meta.mapUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.violet, textDecoration: 'none', display: 'inline-block', marginTop: 6 }}>
              Get Directions →
            </a>
          </div>
        )
      })}
    </div>
  )
}

// ─── Section: Products ───
function ProductsSection({ products, fonts }) {
  if (!products?.items?.length) return <EmptyState text="No product purchases yet" fonts={fonts} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatBox label="Products Bought" value={products.total_purchases} fonts={fonts} />
        <StatBox label="Product Spend" value={`$${products.total_spend.toLocaleString()}`} fonts={fonts} />
      </div>

      {/* Product list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.items.map((item, i) => (
          <div key={i} style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>{item.name}</p>
                {item.brand && <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.violet, fontWeight: 500 }}>{item.brand}</p>}
              </div>
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: 'rgba(250,248,245,0.35)', flexShrink: 0, marginLeft: 8 }}>x{item.qty}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>
                {item.purchases > 1 ? `${item.purchases} purchases` : '1 purchase'}
              </span>
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: 'rgba(250,248,245,0.5)' }}>${item.spend}</span>
            </div>
            {item.last_purchased && (
              <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.3)', marginTop: 4 }}>
                Last purchased {new Date(item.last_purchased).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Service categories pills ───
function ServiceCategoriesSection({ categories, fonts }) {
  if (!categories?.length) return null
  return (
    <div>
      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 10 }}>Services You've Tried</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {categories.map((cat) => (
          <span key={cat.slug} style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, padding: '0.375rem 0.75rem', borderRadius: 999, background: `${colors.violet}12`, color: colors.violet }}>{cat.label}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Shared ───
function StatBox({ label, value, fonts }) {
  return (
    <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)' }}>
      <p style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white }}>{value}</p>
      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', fontWeight: 500 }}>{label}</p>
    </div>
  )
}

function EmptyState({ text, fonts }) {
  return <div style={{ padding: 32, textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.3)' }}>{text}</p></div>
}

// ─── Tab list ───
const ALL_TABS = [
  { key: 'visits', label: 'Visits' },
  { key: 'tox', label: 'Tox' },
  { key: 'providers', label: 'Providers' },
  { key: 'products', label: 'Products' },
  { key: 'locations', label: 'Locations' },
  { key: 'recommendations', label: 'For You' },
  { key: 'account', label: 'Account' },
]

// ─── Main Drawer ───
export default function MemberDrawer({ isOpen, onClose, initialTab = 'visits', fonts, member, profile }) {
  const [activeTab, setActiveTab] = useState(initialTab)

  // Reset tab when drawer opens to a specific one
  useEffect(() => { if (isOpen) setActiveTab(initialTab) }, [isOpen, initialTab])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const { openRebookModal } = useMember()

  const handleRebook = useCallback((data) => {
    openRebookModal(data)
  }, [openRebookModal])

  // Filter tabs to those with data
  const tabs = ALL_TABS.filter((t) => {
    if (t.key === 'tox' && !profile?.toxStatus) return false
    if (t.key === 'products' && !profile?.products?.items?.length) return false
    if (t.key === 'recommendations' && !profile?.recommendations?.length) return false
    return true
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 51,
              width: 'min(420px, 92vw)', background: colors.ink,
              borderLeft: '1px solid rgba(250,248,245,0.08)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(250,248,245,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white }}>My RELUXE</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(250,248,245,0.5)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(250,248,245,0.06)', paddingLeft: '1.5rem', overflowX: 'auto', flexShrink: 0 }}>
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: activeTab === tab.key ? 600 : 500,
                  color: activeTab === tab.key ? colors.white : 'rgba(250,248,245,0.4)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.875rem 1rem', whiteSpace: 'nowrap',
                  borderBottom: activeTab === tab.key ? `2px solid ${colors.violet}` : '2px solid transparent',
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              {activeTab === 'visits' && <VisitsSection visits={profile?.visits} fonts={fonts} onRebook={handleRebook} />}
              {activeTab === 'tox' && <ToxSection toxStatus={profile?.toxStatus} fonts={fonts} onRebook={handleRebook} member={member} />}
              {activeTab === 'providers' && <ProvidersSection providers={profile?.providers} fonts={fonts} />}
              {activeTab === 'products' && <ProductsSection products={profile?.products} fonts={fonts} />}
              {activeTab === 'locations' && <LocationsSection locationSplit={profile?.locationSplit} member={member} fonts={fonts} />}
              {activeTab === 'recommendations' && <RecommendationsSection recommendations={profile?.recommendations} fonts={fonts} onRebook={handleRebook} member={member} />}
              {activeTab === 'account' && <AccountSection member={member} stats={profile?.stats} fonts={fonts} />}

              {!['account', 'locations', 'products'].includes(activeTab) && profile?.serviceCategories?.length > 0 && (
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(250,248,245,0.06)' }}>
                  <ServiceCategoriesSection categories={profile.serviceCategories} fonts={fonts} />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
