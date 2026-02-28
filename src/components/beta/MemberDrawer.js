// src/components/beta/MemberDrawer.js
// Slide-out drawer for member dashboard deep-dive.
// Opens from HeroIdentityCard when clicking stats, visits, providers, avatar, etc.
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, gradients } from '@/components/preview/tokens'
import { supabase } from '@/lib/supabase'
import { useMember } from '@/context/MemberContext'
import ReferralDashboard from '@/components/member/ReferralDashboard'

// ─── Section: Visit History ───
function VisitsSection({ visits, fonts, onRebook, hasUpcoming, onNavigate }) {
  if (!visits?.length) return <EmptyState text="No visits yet" fonts={fonts} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {hasUpcoming && (
        <button
          onClick={() => onNavigate('upcoming')}
          style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.violet, background: `${colors.violet}08`, border: `1px solid ${colors.violet}15`, borderRadius: '0.75rem', padding: '0.625rem 1rem', cursor: 'pointer', textAlign: 'center', marginBottom: 4 }}
        >
          Looking for upcoming visits? →
        </button>
      )}
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

// ─── Section: Upcoming Visits ───
function UpcomingSection({ appointments, fonts, onNavigate, member }) {
  const { openBookingModal } = useMember()

  if (!appointments?.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', textAlign: 'center' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)' }}>Nothing scheduled yet.</p>
        <button
          onClick={() => openBookingModal(member?.preferred_location || 'westfield')}
          style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, marginTop: 12, padding: '0.625rem 1.25rem', borderRadius: 999, background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Book a Visit →
        </button>
      </div>
    )
  }

  const formatDateTime = (d) => {
    if (!d) return ''
    const dt = new Date(d)
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' at ' + dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {appointments.map((appt, i) => (
        <div key={appt.id || i} style={{ padding: '1rem', borderRadius: '0.75rem', background: `${colors.violet}08`, border: `1px solid ${colors.violet}15` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>{appt.service}</p>
            </div>
            <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: colors.violet, flexShrink: 0, marginLeft: 8 }}>{formatDateTime(appt.date)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {appt.providerImage && <img src={appt.providerImage} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />}
            <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)' }}>
              {appt.provider || 'Provider'} · {appt.location_key === 'westfield' ? 'Westfield' : 'Carmel'}
            </span>
          </div>
        </div>
      ))}

      {/* Book another */}
      <button
        onClick={() => openBookingModal(member?.preferred_location || 'westfield')}
        style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, width: '100%', padding: '0.75rem', borderRadius: 999, background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer', marginTop: 4 }}
      >
        Book Another Visit →
      </button>

      {/* Cross-link */}
      <button
        onClick={() => onNavigate('visits')}
        style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: 'rgba(250,248,245,0.35)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', marginTop: 4 }}
      >
        Looking for past visits? →
      </button>
    </div>
  )
}

// ─── Section: Tox Status ───
const TOX_BRANDS = ['Botox', 'Dysport', 'Daxxify', 'Jeuveau', 'Xeomin']

function ToxSection({ toxStatus, fonts, onRebook, member }) {
  if (!toxStatus) return <EmptyState text="No tox history" fonts={fonts} />

  const [showExternal, setShowExternal] = useState(false)
  const [externalDate, setExternalDate] = useState('')
  const [externalBrand, setExternalBrand] = useState('')
  const [externalSaving, setExternalSaving] = useState(false)
  const [externalDone, setExternalDone] = useState(false)
  const [showBrandPicker, setShowBrandPicker] = useState(false)
  const [brandSaving, setBrandSaving] = useState(false)

  const segCfg = {
    on_schedule: { label: 'On Schedule', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: '✓' },
    due: { label: 'Due Soon', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⏰' },
    overdue: { label: 'Overdue', color: colors.rose, bg: 'rgba(225,29,115,0.1)', icon: '⚠' },
    probably_lost: { label: 'Been a While', color: colors.rose, bg: 'rgba(225,29,115,0.08)', icon: '💭' },
    lost: { label: 'Inactive', color: 'rgba(250,248,245,0.4)', bg: 'rgba(250,248,245,0.04)', icon: '—' },
  }
  const seg = segCfg[toxStatus.segment] || segCfg.on_schedule
  const nextWindow = toxStatus.avg_interval ? Math.max(0, toxStatus.avg_interval - (toxStatus.days_since_last || 0)) : null

  const apiCall = async (body) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    const res = await fetch('/api/member/tox-update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(body),
    })
    return res.ok ? res.json() : null
  }

  const handleExternalSubmit = async () => {
    if (!externalDate) return
    setExternalSaving(true)
    const result = await apiCall({ action: 'log_external', external_date: externalDate, external_brand: externalBrand || null })
    setExternalSaving(false)
    if (result) { setExternalDone(true); setShowExternal(false) }
  }

  const handleBrandChange = async (brand) => {
    setBrandSaving(true)
    await apiCall({ action: 'set_brand', tox_brand: brand })
    setBrandSaving(false)
    setShowBrandPicker(false)
    toxStatus.preferred_brand = brand
  }

  const displayBrand = toxStatus.preferred_brand || toxStatus.primary_type || '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Status banner */}
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

        {/* "I got it elsewhere" for overdue/due */}
        {['overdue', 'probably_lost'].includes(toxStatus.segment) && !externalDone && (
          <div style={{ marginTop: 12 }}>
            {!showExternal ? (
              <button
                onClick={() => setShowExternal(true)}
                style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.45)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                I got tox somewhere else
              </button>
            ) : (
              <div style={{ marginTop: 8, padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(250,248,245,0.08)' }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)', marginBottom: 8 }}>
                  Help us update your records
                </p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="date"
                    value={externalDate}
                    onChange={e => setExternalDate(e.target.value)}
                    style={{ flex: 1, fontFamily: fonts.body, fontSize: '0.8125rem', padding: '8px 10px', borderRadius: 8, background: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.1)', color: colors.white, outline: 'none' }}
                  />
                  <select
                    value={externalBrand}
                    onChange={e => setExternalBrand(e.target.value)}
                    style={{ flex: 1, fontFamily: fonts.body, fontSize: '0.8125rem', padding: '8px 10px', borderRadius: 8, background: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.1)', color: colors.white, outline: 'none' }}
                  >
                    <option value="">Brand (optional)</option>
                    {TOX_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleExternalSubmit}
                    disabled={!externalDate || externalSaving}
                    style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, padding: '8px 16px', borderRadius: 8, background: colors.violet, color: '#fff', border: 'none', cursor: 'pointer', opacity: !externalDate || externalSaving ? 0.5 : 1 }}
                  >
                    {externalSaving ? 'Saving...' : 'Update Records'}
                  </button>
                  <button
                    onClick={() => setShowExternal(false)}
                    style={{ fontFamily: fonts.body, fontSize: '0.75rem', padding: '8px 12px', borderRadius: 8, background: 'none', border: '1px solid rgba(250,248,245,0.1)', color: 'rgba(250,248,245,0.4)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {externalDone && (
          <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: '#22c55e', marginTop: 8 }}>Thanks! We've updated your records.</p>
        )}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatBox label="Tox Visits" value={toxStatus.visits || 0} fonts={fonts} />
        {/* Brand with edit pencil */}
        <div style={{ position: 'relative' }}>
          <StatBox label="Your Brand" value={displayBrand} fonts={fonts} />
          <button
            onClick={() => setShowBrandPicker(!showBrandPicker)}
            style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.4, transition: 'opacity 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.4' }}
            title="Change preferred brand"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          {showBrandPicker && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 10, background: '#1a1a1a', border: '1px solid rgba(250,248,245,0.12)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
              {TOX_BRANDS.map(b => (
                <button
                  key={b}
                  onClick={() => handleBrandChange(b)}
                  disabled={brandSaving}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: displayBrand === b ? 600 : 400,
                    padding: '10px 14px', background: displayBrand === b ? `${colors.violet}15` : 'transparent',
                    color: displayBrand === b ? colors.violet : colors.white,
                    border: 'none', borderBottom: '1px solid rgba(250,248,245,0.06)', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (displayBrand !== b) e.currentTarget.style.background = 'rgba(250,248,245,0.04)' }}
                  onMouseLeave={e => { if (displayBrand !== b) e.currentTarget.style.background = 'transparent' }}
                >
                  {b}{displayBrand === b ? ' ✓' : ''}
                </button>
              ))}
            </div>
          )}
        </div>
        <StatBox label="Avg Interval" value={toxStatus.avg_interval ? `${toxStatus.avg_interval}d` : '—'} fonts={fonts} />
        <StatBox label="Tried Multiple" value={toxStatus.switching ? 'Yes' : 'No'} fonts={fonts} />
      </div>

      {/* Provider */}
      {toxStatus.last_provider && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)' }}>
          {toxStatus.last_provider.image && <img src={toxStatus.last_provider.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />}
          <div>
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white }}>Your tox provider</p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.45)' }}>{toxStatus.last_provider.name}</p>
          </div>
        </div>
      )}

      {/* Book CTA */}
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
        <a key={p.slug || i} href={`/team/${p.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1rem', borderRadius: '0.75rem', background: i === 0 ? `${colors.violet}08` : 'rgba(250,248,245,0.03)', border: `1px solid ${i === 0 ? `${colors.violet}20` : 'rgba(250,248,245,0.06)'}`, textDecoration: 'none' }}>
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

// ─── Section: Membership ───
function MembershipSection({ membership, accountCredit, fonts }) {
  const STATUS_CFG = {
    ACTIVE: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: '✓' },
    PAST_DUE: { label: 'Past Due', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '!' },
    PAUSED: { label: 'Paused', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⏸' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Account credit card */}
      {accountCredit && (
        <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))', border: '1px solid rgba(34,197,94,0.2)' }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.4)', marginBottom: 6 }}>RELUXE Credit</p>
          <p style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 700, color: '#22c55e' }}>{accountCredit.formatted}</p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', marginTop: 4 }}>Applied automatically at checkout</p>
        </div>
      )}

      {/* Membership card */}
      {membership ? (() => {
        const cfg = STATUS_CFG[membership.status] || STATUS_CFG.ACTIVE
        const vouchers = membership.vouchers || []
        const allServices = vouchers.flatMap(v => v.services || [])

        return (
          <>
            <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: cfg.color, background: `${cfg.color}20`, padding: '0.2rem 0.6rem', borderRadius: 999 }}>
                  {cfg.icon} {cfg.label}
                </span>
                <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(250,248,245,0.5)' }}>
                  {membership.priceFormatted}/mo
                </span>
              </div>
              <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.white, marginBottom: 4 }}>{membership.name}</p>
              {membership.nextChargeDate && membership.status === 'ACTIVE' && (
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>
                  Renews {new Date(membership.nextChargeDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              {membership.status === 'PAUSED' && membership.unpauseOn && (
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: '#f59e0b' }}>
                  Resumes {new Date(membership.unpauseOn + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>

            {/* Membership stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <StatBox label="Term" value={`#${membership.termNumber}`} fonts={fonts} />
              <StatBox label="Member Since" value={new Date(membership.startOn + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} fonts={fonts} />
            </div>

            {/* Included services */}
            {allServices.length > 0 && (
              <div>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 10 }}>Included Services</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {allServices.map((svc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: `${colors.violet}08`, border: `1px solid ${colors.violet}12` }}>
                      <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.white }}>{svc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      })() : !accountCredit && (
        <EmptyState text="No active membership" fonts={fonts} />
      )}
    </div>
  )
}

// ─── Section: Velocity Rewards ───
function VelocitySection({ velocity, fonts, member }) {
  const { openBookingModal } = useMember()

  if (!velocity) return <EmptyState text="No rewards yet" fonts={fonts} />

  const nextExpiry = velocity.nextExpiryAt ? new Date(velocity.nextExpiryAt) : null
  const daysUntilExpiry = nextExpiry ? Math.max(0, Math.ceil((nextExpiry - Date.now()) / 86400000)) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Balance hero */}
      <div style={{ padding: '1.5rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.25)' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.4)', marginBottom: 6 }}>RELUXE Rewards</p>
        <p style={{ fontFamily: fonts.display, fontSize: '2.25rem', fontWeight: 700, color: colors.violet }}>{velocity.formatted}</p>
        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.45)', marginTop: 4 }}>Applied automatically at checkout</p>
      </div>

      {/* Frozen badge */}
      {velocity.isFrozen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <span style={{ fontSize: '0.875rem' }}>&#10003;</span>
          <div>
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#22c55e' }}>Protected</p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.45)' }}>Your rewards won't expire while you have an upcoming visit</p>
          </div>
        </div>
      )}

      {/* Expiry warning */}
      {!velocity.isFrozen && nextExpiry && velocity.nextExpiryFormatted && daysUntilExpiry <= 30 && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#f59e0b' }}>
            {velocity.nextExpiryFormatted} expires {daysUntilExpiry === 0 ? 'today' : `in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`}
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.45)', marginTop: 4 }}>Book a visit to freeze your rewards</p>
          <button
            onClick={() => openBookingModal(member?.preferred_location || 'westfield')}
            style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: 999, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'none', cursor: 'pointer', marginTop: 8 }}
          >
            Book Now to Protect
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatBox label="Lifetime Earned" value={`$${(velocity.totalEarned / 100).toFixed(2)}`} fonts={fonts} />
        <StatBox label="Expired" value={`$${(velocity.totalExpired / 100).toFixed(2)}`} fonts={fonts} />
      </div>

      {/* How it works */}
      <details style={{ borderRadius: '0.75rem', background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)', overflow: 'hidden' }}>
        <summary style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(250,248,245,0.5)', padding: '0.875rem 1rem', cursor: 'pointer', listStyle: 'none' }}>
          How RELUXE Rewards work
        </summary>
        <div style={{ padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.45)', lineHeight: 1.6 }}>
            Earn $1 for every $100 you spend on treatments. Your rewards are added as account credit and applied automatically at your next checkout.
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.45)', lineHeight: 1.6 }}>
            Rewards expire 90 days after they're earned — but as long as you have a visit on the books, the clock is paused.
          </p>
        </div>
      </details>
    </div>
  )
}

// ─── Section: Account ───
function AccountSection({ member, stats, accountCredit, membership, fonts, onNavigate, onSignOut }) {
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
        {stats?.total_visits > 0 && <StatBox label="Total Visits" value={stats.total_visits} fonts={fonts} onClick={() => onNavigate?.('visits')} />}
        {stats?.months_with_us > 0 && <StatBox label="Months With Us" value={stats.months_with_us} fonts={fonts} />}
        {stats?.avg_days_between_visits && <StatBox label="Visit Cadence" value={`${stats.avg_days_between_visits}d`} fonts={fonts} />}
        {stats?.total_treatments > 0 && <StatBox label="Treatments" value={stats.total_treatments} fonts={fonts} onClick={() => onNavigate?.('visits')} />}
        {accountCredit && <StatBox label="RELUXE Credit" value={accountCredit.formatted} fonts={fonts} onClick={() => onNavigate?.('membership')} />}
        {membership && <StatBox label="Membership" value={membership.status === 'ACTIVE' ? 'Active' : membership.status} fonts={fonts} onClick={() => onNavigate?.('membership')} />}
      </div>
      <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 8 }}>Your Info</p>
        {member?.first_name && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.white }}>{member.first_name} {member.last_name || ''}</p>}
        {member?.email && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)' }}>{member.email}</p>}
      </div>
      {onSignOut && (
        <button
          onClick={onSignOut}
          style={{
            fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500,
            color: 'rgba(250,248,245,0.4)', background: 'none', border: '1px solid rgba(250,248,245,0.08)',
            borderRadius: 10, padding: '10px 16px', cursor: 'pointer', width: '100%',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(250,248,245,0.4)'; e.currentTarget.style.borderColor = 'rgba(250,248,245,0.08)' }}
        >
          Sign Out
        </button>
      )}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {categories.map((cat) => (
          <div key={cat.slug} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
            background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.violet, flexShrink: 0 }} />
            <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.white }}>{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Shared ───
function StatBox({ label, value, fonts, onClick }) {
  const [hovered, setHovered] = useState(false)
  const clickable = !!onClick
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
      onMouseEnter={clickable ? () => setHovered(true) : undefined}
      onMouseLeave={clickable ? () => setHovered(false) : undefined}
      style={{
        padding: '0.75rem 1rem', borderRadius: '0.75rem',
        background: clickable && hovered ? 'rgba(250,248,245,0.06)' : 'rgba(250,248,245,0.03)',
        border: `1px solid ${clickable && hovered ? 'rgba(250,248,245,0.12)' : 'rgba(250,248,245,0.06)'}`,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background 0.15s, border-color 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <div>
        <p style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white }}>{value}</p>
        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', fontWeight: 500 }}>{label}</p>
      </div>
      {clickable && (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: hovered ? 0.5 : 0.25, transition: 'opacity 0.15s', flexShrink: 0 }}>
          <path d="M6 4L10 8L6 12" stroke={colors.white} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  )
}

function EmptyState({ text, fonts }) {
  return <div style={{ padding: 32, textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.3)' }}>{text}</p></div>
}

// ─── Section: Overview ───
function OverviewSection({ member, profile, stats, fonts, onNavigate, onSignOut }) {
  const tierLabels = { vip: 'VIP Member', high: 'Preferred Member', medium: 'RELUXE Member', low: 'RELUXE Member' }
  const tier = tierLabels[stats?.ltv_bucket] || 'RELUXE Member'
  const memberSince = stats?.first_visit
    ? new Date(stats.first_visit).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : member?.onboarded_at ? new Date(member.onboarded_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null
  const upcomingCount = profile?.upcomingAppointments?.length || 0
  const nextAppt = profile?.upcomingAppointment
  const visitCount = profile?.visits?.length || 0
  const creditBalance = profile?.accountCredit?.formatted
  const velocity = profile?.velocity
  const membership = profile?.membership
  const primaryProvider = profile?.primaryProvider
  const recsCount = profile?.recommendations?.length || 0
  const locationSplit = profile?.locationSplit

  const cardStyle = {
    padding: '1rem', borderRadius: '0.75rem',
    background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)',
    cursor: 'pointer', transition: 'border-color 0.15s',
  }
  const cardHover = (e) => { e.currentTarget.style.borderColor = 'rgba(250,248,245,0.15)' }
  const cardLeave = (e) => { e.currentTarget.style.borderColor = 'rgba(250,248,245,0.06)' }
  const chevron = <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
  const sectionLabel = (text) => ({ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 6 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* a. Account */}
      <div style={{ ...cardStyle, background: `linear-gradient(135deg, ${colors.violet}12, ${colors.fuchsia}06)`, border: `1px solid ${colors.violet}20` }} onClick={() => onNavigate('account')} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 700, color: colors.white }}>{tier}</p>
            {member?.first_name && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)', marginTop: 2 }}>{member.first_name} {member.last_name || ''}</p>}
            {memberSince && <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.3)', marginTop: 2 }}>Member since {memberSince}</p>}
          </div>
          {chevron}
        </div>
      </div>

      {/* b. Visits */}
      <div style={cardStyle} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
        <p style={sectionLabel('Visits')}>Visits</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, padding: '0.625rem 0.75rem', borderRadius: '0.5rem', background: upcomingCount ? `${colors.violet}08` : 'transparent', border: `1px solid ${upcomingCount ? `${colors.violet}15` : 'rgba(250,248,245,0.06)'}`, cursor: 'pointer' }} onClick={() => onNavigate('upcoming')}>
            <p style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: upcomingCount ? colors.violet : 'rgba(250,248,245,0.25)' }}>{upcomingCount}</p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>Upcoming</p>
            {nextAppt && <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(250,248,245,0.3)', marginTop: 4 }}>{nextAppt.service} · {new Date(nextAppt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>}
          </div>
          <div style={{ flex: 1, padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(250,248,245,0.06)', cursor: 'pointer' }} onClick={() => onNavigate('visits')}>
            <p style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white }}>{stats?.total_visits || visitCount}</p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>Past Visits</p>
            {stats?.days_since_last_visit != null && <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(250,248,245,0.3)', marginTop: 4 }}>{stats.days_since_last_visit}d since last</p>}
          </div>
        </div>
      </div>

      {/* c. Wallet */}
      {(creditBalance || membership || velocity) && (
        <div style={cardStyle} onClick={() => onNavigate('wallet')} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={sectionLabel('Wallet')}>Wallet</p>
            {chevron}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {creditBalance && (
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '0.25rem 0.625rem', borderRadius: 999 }}>
                {creditBalance} Credit
              </span>
            )}
            {membership && (
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: membership.status === 'ACTIVE' ? '#22c55e' : '#f59e0b', background: membership.status === 'ACTIVE' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', padding: '0.25rem 0.625rem', borderRadius: 999 }}>
                {membership.name}
              </span>
            )}
            {velocity && (
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.violet, background: `${colors.violet}12`, padding: '0.25rem 0.625rem', borderRadius: 999 }}>
                {velocity.formatted} Rewards
              </span>
            )}
          </div>
        </div>
      )}

      {/* d. Your RELUXE */}
      <div style={cardStyle} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
        <p style={sectionLabel('Your RELUXE')}>Your RELUXE</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {primaryProvider && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => onNavigate('providers')}>
              {primaryProvider.image
                ? <img src={primaryProvider.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(250,248,245,0.06)' }} />
              }
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white }}>{primaryProvider.name}</p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>{primaryProvider.visit_count} visit{primaryProvider.visit_count !== 1 ? 's' : ''} · Your go-to</p>
              </div>
              {chevron}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            {locationSplit && (
              <div style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(250,248,245,0.06)', cursor: 'pointer' }} onClick={() => onNavigate('locations')}>
                <div style={{ display: 'flex', borderRadius: 999, overflow: 'hidden', height: 4, background: 'rgba(250,248,245,0.06)', marginBottom: 6 }}>
                  {locationSplit.locations?.map((loc) => (
                    <div key={loc.key} style={{ width: `${loc.pct}%`, background: loc.key === 'westfield' ? colors.violet : colors.fuchsia }} />
                  ))}
                </div>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>Locations</p>
              </div>
            )}
            {recsCount > 0 && (
              <div style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(250,248,245,0.06)', cursor: 'pointer' }} onClick={() => onNavigate('recommendations')}>
                <p style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 700, color: colors.violet }}>{recsCount}</p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>For You</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign out */}
      {onSignOut && (
        <button
          onClick={onSignOut}
          style={{
            fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500,
            color: 'rgba(250,248,245,0.4)', background: 'none', border: '1px solid rgba(250,248,245,0.08)',
            borderRadius: 10, padding: '10px 16px', cursor: 'pointer', width: '100%', marginTop: 4,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(250,248,245,0.4)'; e.currentTarget.style.borderColor = 'rgba(250,248,245,0.08)' }}
        >
          Sign Out
        </button>
      )}
    </div>
  )
}

// ─── Section: Wallet (combined credit + membership + rewards) ───
function WalletSection({ membership, accountCredit, velocity, fonts, member }) {
  const { openBookingModal } = useMember()

  const STATUS_CFG = {
    ACTIVE: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: '✓' },
    PAST_DUE: { label: 'Past Due', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '!' },
    PAUSED: { label: 'Paused', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⏸' },
  }

  const hasAnything = accountCredit || membership || velocity

  if (!hasAnything) return <EmptyState text="No wallet items yet" fonts={fonts} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Account credit */}
      {accountCredit && (
        <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))', border: '1px solid rgba(34,197,94,0.2)' }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.4)', marginBottom: 6 }}>RELUXE Credit</p>
          <p style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 700, color: '#22c55e' }}>{accountCredit.formatted}</p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', marginTop: 4 }}>Applied automatically at checkout</p>
        </div>
      )}

      {/* Membership */}
      {membership && (() => {
        const cfg = STATUS_CFG[membership.status] || STATUS_CFG.ACTIVE
        const vouchers = membership.vouchers || []
        const allServices = vouchers.flatMap(v => v.services || [])

        return (
          <>
            <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: cfg.color, background: `${cfg.color}20`, padding: '0.2rem 0.6rem', borderRadius: 999 }}>
                  {cfg.icon} {cfg.label}
                </span>
                <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(250,248,245,0.5)' }}>
                  {membership.priceFormatted}/mo
                </span>
              </div>
              <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.white, marginBottom: 4 }}>{membership.name}</p>
              {membership.nextChargeDate && membership.status === 'ACTIVE' && (
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>
                  Renews {new Date(membership.nextChargeDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              {membership.status === 'PAUSED' && membership.unpauseOn && (
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: '#f59e0b' }}>
                  Resumes {new Date(membership.unpauseOn + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>

            {allServices.length > 0 && (
              <div>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 10 }}>Included Services</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {allServices.map((svc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: `${colors.violet}08`, border: `1px solid ${colors.violet}12` }}>
                      <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.white }}>{svc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      })()}

      {/* Velocity rewards */}
      {velocity && (
        <>
          <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.25)' }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.4)', marginBottom: 6 }}>RELUXE Rewards</p>
            <p style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 700, color: colors.violet }}>{velocity.formatted}</p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.45)', marginTop: 4 }}>Applied automatically at checkout</p>
          </div>
          {velocity.isFrozen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1rem', borderRadius: '0.75rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: '#22c55e' }}>Protected — won&rsquo;t expire while you have a booking</span>
            </div>
          )}
          {velocity.nextExpiryAt && !velocity.isFrozen && (() => {
            const days = Math.max(0, Math.ceil((new Date(velocity.nextExpiryAt) - Date.now()) / 86400000))
            if (days > 30) return null
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1rem', borderRadius: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: '#f59e0b' }}>
                  {velocity.nextExpiryFormatted} expires in {days} day{days !== 1 ? 's' : ''}
                </span>
              </div>
            )
          })()}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <StatBox label="Lifetime Earned" value={`$${((velocity.totalEarned || 0) / 100).toFixed(2)}`} fonts={fonts} />
            <StatBox label="Expired" value={`$${((velocity.totalExpired || 0) / 100).toFixed(2)}`} fonts={fonts} />
          </div>
        </>
      )}
    </div>
  )
}

// ─── Tab list ───
const ALL_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'visits', label: 'Visits' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'tox', label: 'Tox' },
  { key: 'providers', label: 'Providers' },
  { key: 'locations', label: 'Locations' },
  { key: 'recommendations', label: 'For You' },
  { key: 'products', label: 'Products' },
  { key: 'referrals', label: 'Referrals' },
  { key: 'account', label: 'Account' },
]

// ─── Main Drawer ───
export default function MemberDrawer({ isOpen, onClose, initialTab = 'overview', fonts, member, profile }) {
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

  const { openRebookModal, signOut } = useMember()

  const handleRebook = useCallback((data) => {
    openRebookModal(data)
  }, [openRebookModal])

  // Filter tabs to those with data
  const tabs = ALL_TABS.filter((t) => {
    if (t.key === 'wallet' && !profile?.membership && !profile?.accountCredit && !profile?.velocity) return false
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
              {activeTab === 'overview' && <OverviewSection member={member} profile={profile} stats={profile?.stats} fonts={fonts} onNavigate={setActiveTab} onSignOut={signOut} />}
              {activeTab === 'visits' && <VisitsSection visits={profile?.visits} fonts={fonts} onRebook={handleRebook} hasUpcoming={!!profile?.upcomingAppointments?.length} onNavigate={setActiveTab} />}
              {activeTab === 'upcoming' && <UpcomingSection appointments={profile?.upcomingAppointments} fonts={fonts} onNavigate={setActiveTab} member={member} />}
              {activeTab === 'tox' && <ToxSection toxStatus={profile?.toxStatus} fonts={fonts} onRebook={handleRebook} member={member} />}
              {activeTab === 'wallet' && <WalletSection membership={profile?.membership} accountCredit={profile?.accountCredit} velocity={profile?.velocity} fonts={fonts} member={member} />}
              {activeTab === 'providers' && <ProvidersSection providers={profile?.providers} fonts={fonts} />}
              {activeTab === 'products' && <ProductsSection products={profile?.products} fonts={fonts} />}
              {activeTab === 'locations' && <LocationsSection locationSplit={profile?.locationSplit} member={member} fonts={fonts} />}
              {activeTab === 'recommendations' && <RecommendationsSection recommendations={profile?.recommendations} fonts={fonts} onRebook={handleRebook} member={member} />}
              {activeTab === 'referrals' && <ReferralDashboard fonts={fonts} />}
              {activeTab === 'account' && <AccountSection member={member} stats={profile?.stats} accountCredit={profile?.accountCredit} membership={profile?.membership} fonts={fonts} onNavigate={setActiveTab} onSignOut={signOut} />}

              {!['overview', 'account', 'locations', 'products', 'wallet'].includes(activeTab) && profile?.serviceCategories?.length > 0 && (
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
