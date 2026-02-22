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

// ─── Tab list ───
const ALL_TABS = [
  { key: 'visits', label: 'Visits' },
  { key: 'tox', label: 'Tox' },
  { key: 'membership', label: 'Membership' },
  { key: 'providers', label: 'Providers' },
  { key: 'products', label: 'Products' },
  { key: 'locations', label: 'Locations' },
  { key: 'recommendations', label: 'For You' },
  { key: 'referrals', label: 'Referrals' },
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

  const { openRebookModal, signOut } = useMember()

  const handleRebook = useCallback((data) => {
    openRebookModal(data)
  }, [openRebookModal])

  // Filter tabs to those with data
  const tabs = ALL_TABS.filter((t) => {
    if (t.key === 'tox' && !profile?.toxStatus) return false
    if (t.key === 'membership' && !profile?.membership && !profile?.accountCredit) return false
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
              {activeTab === 'membership' && <MembershipSection membership={profile?.membership} accountCredit={profile?.accountCredit} fonts={fonts} />}
              {activeTab === 'providers' && <ProvidersSection providers={profile?.providers} fonts={fonts} />}
              {activeTab === 'products' && <ProductsSection products={profile?.products} fonts={fonts} />}
              {activeTab === 'locations' && <LocationsSection locationSplit={profile?.locationSplit} member={member} fonts={fonts} />}
              {activeTab === 'recommendations' && <RecommendationsSection recommendations={profile?.recommendations} fonts={fonts} onRebook={handleRebook} member={member} />}
              {activeTab === 'referrals' && <ReferralDashboard fonts={fonts} />}
              {activeTab === 'account' && <AccountSection member={member} stats={profile?.stats} accountCredit={profile?.accountCredit} membership={profile?.membership} fonts={fonts} onNavigate={setActiveTab} onSignOut={signOut} />}

              {!['account', 'locations', 'products', 'membership'].includes(activeTab) && profile?.serviceCategories?.length > 0 && (
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
