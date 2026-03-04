// /pages/flash-sales.js
// Adds ?all=1 mode to preview all upcoming scheduled drops.
// Normal mode = today's live deals only.

import { useEffect, useMemo, useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import { flashDeals as rawFlashDeals } from '../data/flashDeals'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

// ---------- helpers ----------
function safeDeals(raw) {
  if (!raw || typeof raw !== 'object') {
    return { services: [], products: [] }
  }
  return {
    services: Array.isArray(raw.services) ? raw.services : [],
    products: Array.isArray(raw.products) ? raw.products : [],
  }
}

function isActiveDealForNow(deal, nowMs) {
  const start = new Date(deal.startTime).getTime()
  const end = new Date(deal.endTime).getTime()
  return nowMs >= start && nowMs <= end
}

function isUpcomingOrActive(deal, nowMs) {
  const end = new Date(deal.endTime).getTime()
  return end >= nowMs
}

function msUntilEnd(deal, nowMs) {
  const end = new Date(deal.endTime).getTime()
  return Math.max(end - nowMs, 0)
}

function formatCountdown(msLeft) {
  const totalSeconds = Math.floor(msLeft / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m ${seconds}s left`
}

function getEarlyBirdStatus(deal, nowMs) {
  if (!deal.firstTwoHourCode || !deal.firstTwoHourCode.code) {
    return { active: false }
  }

  const startMs = new Date(deal.startTime).getTime()
  const expiresAtMs =
    startMs +
    deal.firstTwoHourCode.expireAfterHours * 60 * 60 * 1000

  if (nowMs < startMs) return { active: false }
  if (nowMs > expiresAtMs) return { active: false }

  return {
    active: true,
    expiresAtMs,
    code: deal.firstTwoHourCode.code,
    extraDetails: deal.firstTwoHourCode.extraDetails || '',
  }
}

function formatDay(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

function getDayKey(dateStr) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ShareButton({ url }) {
  const [copied, setCopied] = useState(false)

  async function handleShare(e) {
    e.preventDefault()
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RELUXE Flash Deal',
          text: 'Limited-time RELUXE deal \u2014 act fast.',
          url,
        })
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet }}
    >
      {copied ? 'Link Copied!' : 'Share'}
    </button>
  )
}

function DealCard({ deal, nowMs }) {
  const msLeft = msUntilEnd(deal, nowMs)
  const countdown = formatCountdown(msLeft)
  const early = getEarlyBirdStatus(deal, nowMs)
  const showEarly = early.active

  const flashPriceDisplay =
    typeof deal.flashPrice === 'number'
      ? `$${deal.flashPrice}`
      : deal.flashPrice

  const regularPriceDisplay =
    typeof deal.regularPrice === 'number'
      ? `$${deal.regularPrice}`
      : deal.regularPrice

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.4)]" style={{ border: `1px solid ${colors.stone}` }}>
      <div className="flex flex-col p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading, lineHeight: 1.3 }}>
              {deal.name}
            </h3>
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, marginTop: '0.25rem', lineHeight: 1.4 }}>
              {deal.blurb}
            </p>
            {deal.limitNote && (
              <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.rose, marginTop: '0.25rem' }}>
                {deal.limitNote}
              </p>
            )}
            {deal.notes && (
              <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted, marginTop: '0.25rem' }}>
                {deal.notes}
              </p>
            )}
          </div>

          {/* Countdown */}
          <span style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: '9999px',
            background: colors.ink,
            padding: '0.25rem 0.625rem',
            fontFamily: fonts.body,
            fontSize: '0.625rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.white,
          }}>
            {countdown}
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <div>
            <div style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.muted }}>
              Flash Price
            </div>
            <div style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 800, color: colors.heading, lineHeight: 1 }}>
              {flashPriceDisplay}
            </div>
          </div>

          <div style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted, textDecoration: 'line-through', lineHeight: 1 }}>
            {regularPriceDisplay}
          </div>
        </div>

        {/* Early Bird */}
        {showEarly && (
          <div className="mt-3 rounded-xl p-3 text-white" style={{ background: gradients.primary, boxShadow: '0 16px 32px -8px rgba(139,92,246,0.5)', border: '1px solid rgba(250,248,245,0.2)' }}>
            <div className="flex items-start justify-between">
              <div style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.3 }}>
                Early Access Bonus
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.625rem', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '1px solid rgba(255,255,255,0.2)', lineHeight: 1 }}>
                CODE: {early.code}
              </div>
            </div>
            {early.extraDetails && (
              <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                {early.extraDetails}
              </p>
            )}
            <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem', lineHeight: 1 }}>
              Ends in{' '}
              {formatCountdown(Math.max(early.expiresAtMs - nowMs, 0))}
            </p>
          </div>
        )}

        {/* CTA Row */}
        <div className="mt-4 flex items-center justify-between">
          <a
            href={deal.linkBook}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
              padding: '0.5rem 0.75rem',
              fontFamily: fonts.body,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#fff',
              background: gradients.primary,
            }}
          >
            Claim Deal &rarr;
          </a>

          <ShareButton url={deal.linkShare} />
        </div>

        {/* Timing */}
        <div style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: colors.muted, marginTop: '0.75rem', lineHeight: 1.6 }}>
          <div>
            Starts:{' '}
            {new Date(deal.startTime).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
          <div>
            Ends:{' '}
            {new Date(deal.endTime).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </article>
  )
}

function FaqItem({ q, a }) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between" style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading }}>
        <span>{q}</span>
        <svg
          className="h-5 w-5 transition-transform group-open:rotate-180"
          style={{ color: colors.muted }}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <div style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, lineHeight: 1.6 }} className="px-6 pb-5">
        {a}
      </div>
    </details>
  )
}

export default function FlashSalePage() {
  const [nowMs, setNowMs] = useState(Date.now())
  const [showAll, setShowAll] = useState(false)

  // read ?all=1 client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const allParam = params.get('all')
      if (allParam === '1') {
        setShowAll(true)
      }
    }
  }, [])

  // live countdown tick
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // normalize incoming data
  const { services, products } = useMemo(
    () => safeDeals(rawFlashDeals),
    []
  )

  // --- CURRENT MODE (default) ---
  const {
    activeServices,
    activeProducts,
    hasAnything,
    showSideBySidePair,
  } = useMemo(() => {
    const _now = nowMs
    const activeServicesNow = services.filter((d) =>
      isActiveDealForNow(d, _now)
    )
    const activeProductsNow = products.filter((d) =>
      isActiveDealForNow(d, _now)
    )
    const anyNow =
      activeServicesNow.length > 0 || activeProductsNow.length > 0

    return {
      activeServices: activeServicesNow,
      activeProducts: activeProductsNow,
      hasAnything: anyNow,
      showSideBySidePair:
        activeServicesNow.length === 1 &&
        activeProductsNow.length === 1,
    }
  }, [services, products, nowMs])

  // --- FUTURE / ALL MODE ---
  const futureSchedule = useMemo(() => {
    if (!showAll) return []

    const _now = nowMs
    const upcomingServices = services.filter((d) =>
      isUpcomingOrActive(d, _now)
    )
    const upcomingProducts = products.filter((d) =>
      isUpcomingOrActive(d, _now)
    )

    const bucket = {}
    for (const s of upcomingServices) {
      const key = getDayKey(s.startTime)
      if (!bucket[key]) {
        bucket[key] = {
          dayKey: key,
          dayLabel: formatDay(s.startTime),
          services: [],
          products: [],
        }
      }
      bucket[key].services.push(s)
    }
    for (const p of upcomingProducts) {
      const key = getDayKey(p.startTime)
      if (!bucket[key]) {
        bucket[key] = {
          dayKey: key,
          dayLabel: formatDay(p.startTime),
          services: [],
          products: [],
        }
      }
      bucket[key].products.push(p)
    }

    const sorted = Object.values(bucket).sort((a, b) =>
      a.dayKey.localeCompare(b.dayKey)
    )

    return sorted
  }, [showAll, services, products, nowMs])

  // SEO/jsonLd
  const jsonLd = useMemo(() => {
    if (!hasAnything) {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Flash Deals | RELUXE Med Spa',
        description:
          'Limited-time flash pricing on injectables, facials, laser, massage, and medical-grade skincare at RELUXE Med Spa.',
        url: 'https://reluxemedspa.com/flash-sales',
      }
    }

    const items = [...activeServices, ...activeProducts].map(
      (deal, idx) => ({
        '@type': 'Offer',
        position: idx + 1,
        name: deal.name,
        price:
          typeof deal.flashPrice === 'number'
            ? deal.flashPrice
            : undefined,
        priceCurrency: 'USD',
        url: `https://reluxemedspa.com${deal.linkBook}`,
        availability: 'https://schema.org/InStock',
        validFrom: deal.startTime,
        validThrough: deal.endTime,
        description: deal.blurb,
      })
    )

    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Flash Deals | RELUXE Med Spa',
        description:
          'Limited-time flash pricing on injectables, facials, laser, massage, and skincare at RELUXE Med Spa.',
        url: 'https://reluxemedspa.com/flash-sales',
        itemListElement: items,
    }
  }, [hasAnything, activeServices, activeProducts])

  return (
    <BetaLayout
      title="Flash Sale"
      description="Today's limited-time RELUXE flash deals on massage, injectables, facials, laser, and skincare. When it's gone, it's gone."
      canonical="https://reluxemedspa.com/flash-sales"
      structuredData={jsonLd}
    >
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.2), transparent 60%)`,
          color: colors.white,
        }}
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 flex-wrap" style={{ fontFamily: fonts.body, ...typeScale.label, color: 'rgba(250,248,245,0.6)' }}>
              <span>RELUXE &bull; Flash Deals</span>

              {/* admin-ish toggle pill */}
              <a
                href={showAll ? '/flash-sales' : '/flash-sales?all=1'}
                style={{
                  borderRadius: '9999px',
                  background: 'rgba(250,248,245,0.1)',
                  padding: '0.25rem 0.5rem',
                  fontFamily: fonts.body,
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: colors.white,
                  border: '1px solid rgba(250,248,245,0.2)',
                }}
              >
                {showAll ? 'View Today' : 'View Schedule'}
              </a>
            </p>

            <div className="mt-2 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1
                  style={{
                    fontFamily: fonts.display,
                    fontSize: typeScale.hero.size,
                    fontWeight: typeScale.hero.weight,
                    lineHeight: typeScale.hero.lineHeight,
                    color: colors.white,
                  }}
                >
                  Today Only.{' '}
                  <span
                    style={{
                      background: gradients.primary,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Blink and It&apos;s Gone.
                  </span>
                </h1>
              </div>

              {/* live status pill */}
              <div className="flex items-center gap-2" style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(250,248,245,0.7)' }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: colors.violet }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: colors.violet }} />
                </span>
                <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(250,248,245,0.8)' }}>
                  {hasAnything ? 'Live Now' : 'No Active Drop'}
                </span>
              </div>
            </div>

            <p style={{ fontFamily: fonts.body, fontSize: '1.125rem', color: 'rgba(250,248,245,0.7)', marginTop: '1rem', lineHeight: 1.4 }}>
              Limited-quantity pricing on our most requested services
              and skincare. These offers activate and expire on a
              timer. When the countdown hits zero, it&apos;s over.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3" style={{ fontSize: '0.8125rem' }}>
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
              <a
                href="/join-texts"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '9999px',
                  padding: '0.5rem 1rem',
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  color: 'rgba(250,248,245,0.9)',
                  border: '1px solid rgba(250,248,245,0.15)',
                }}
              >
                Get Text Alerts
              </a>

              <div style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.5)', lineHeight: 1.3 }}>
                Pro tip: Some drops include a bonus code for the first
                two hours. After that, pricing goes back up.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      {!showAll ? (
        // -------- NORMAL LIVE VIEW --------
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {!hasAnything && (
            <div className="rounded-2xl bg-white p-6 shadow-sm text-center" style={{ border: `1px solid ${colors.stone}` }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>
                Nothing Live (Yet)
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto', marginTop: '0.5rem', lineHeight: 1.6 }}>
                Flash Deals drop during Thanksgiving week, Black Friday,
                the weekend, Cyber Monday &mdash; plus surprise &ldquo;Flash
                Tuesdays.&rdquo; Join texts so you&apos;re first to know.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <a
                  href="/join-texts"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                    padding: '0.5rem 1rem',
                    fontFamily: fonts.body,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#fff',
                    background: gradients.primary,
                  }}
                >
                  Get Text Alerts
                </a>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
              </div>
            </div>
          )}

          {hasAnything && (
            <>
              {/* CASE 1: exactly 1 service + 1 product -> side-by-side */}
              {showSideBySidePair && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <DealCard deal={activeServices[0]} nowMs={nowMs} />
                  <DealCard deal={activeProducts[0]} nowMs={nowMs} />
                </div>
              )}

              {/* CASE 2: multi layout */}
              {!showSideBySidePair && (
                <div className="grid gap-10 lg:grid-cols-2">
                  {/* Services column */}
                  <div>
                    {activeServices.length > 0 && (
                      <>
                        <div className="flex items-baseline justify-between">
                          <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
                            Services
                          </h2>
                          <div style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>
                            Limited slots / may sell out
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          {activeServices.map((deal) => (
                            <DealCard
                              key={deal.id}
                              deal={deal}
                              nowMs={nowMs}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Products column */}
                  <div>
                    {activeProducts.length > 0 && (
                      <>
                        <div className="flex items-baseline justify-between">
                          <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
                            Skincare &amp; Retail
                          </h2>
                          <div style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>
                            While in stock
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          {activeProducts.map((deal) => (
                            <DealCard
                              key={deal.id}
                              deal={deal}
                              nowMs={nowMs}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      ) : (
        // -------- SCHEDULE VIEW (?all=1) --------
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {futureSchedule.length === 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm text-center" style={{ border: `1px solid ${colors.stone}` }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>
                No Upcoming Drops
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto', marginTop: '0.5rem', lineHeight: 1.6 }}>
                Looks like nothing is queued in the future. Add new
                deals to /data/flashDeals.js to populate this view.
              </p>
            </div>
          )}

          {futureSchedule.length > 0 && (
            <div className="space-y-10">
              {futureSchedule.map((dayBlock) => {
                const dayServices = dayBlock.services
                const dayProducts = dayBlock.products

                const pairMode =
                  dayServices.length === 1 && dayProducts.length === 1

                return (
                  <div
                    key={dayBlock.dayKey}
                    className="rounded-2xl bg-white shadow-sm"
                    style={{ border: `1px solid ${colors.stone}` }}
                  >
                    <div className="rounded-t-2xl px-4 py-3 sm:px-6" style={{ borderBottom: `1px solid ${colors.stone}`, backgroundColor: colors.cream }}>
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                        <div>
                          <div style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.muted }}>
                            Scheduled Drop
                          </div>
                          <div style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading, lineHeight: 1.3 }}>
                            {dayBlock.dayLabel}
                          </div>
                        </div>
                        <div style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>
                          Runs{' '}
                          {dayServices[0] || dayProducts[0]
                            ? new Date(
                                (dayServices[0] || dayProducts[0])
                                  .startTime
                              ).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            : '\u2014'}{' '}
                          to{' '}
                          {dayServices[0] || dayProducts[0]
                            ? new Date(
                                (dayServices[0] || dayProducts[0])
                                  .endTime
                              ).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            : '\u2014'}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      {/* pair mode (1 service + 1 product) */}
                      {pairMode && (
                        <div className="grid gap-6 sm:grid-cols-2">
                          <DealCard
                            deal={dayServices[0]}
                            nowMs={nowMs}
                          />
                          <DealCard
                            deal={dayProducts[0]}
                            nowMs={nowMs}
                          />
                        </div>
                      )}

                      {/* multi mode */}
                      {!pairMode && (
                        <div className="grid gap-10 lg:grid-cols-2">
                          {/* services col */}
                          {dayServices.length > 0 && (
                            <div>
                              <div className="flex items-baseline justify-between">
                                <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>
                                  Services
                                </h3>
                                <div style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>
                                  Limited slots / may sell out
                                </div>
                              </div>

                              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                {dayServices
                                  .map((deal) => (
                                    <DealCard
                                      key={deal.id}
                                      deal={deal}
                                      nowMs={nowMs}
                                    />
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* products col */}
                          {dayProducts.length > 0 && (
                            <div>
                              <div className="flex items-baseline justify-between">
                                <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>
                                  Skincare &amp; Retail
                                </h3>
                                <div style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>
                                  While in stock
                                </div>
                              </div>

                              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                {dayProducts
                                  .map((deal) => (
                                    <DealCard
                                      key={deal.id}
                                      deal={deal}
                                      nowMs={nowMs}
                                    />
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* FAQ / fine print */}
      <section className="relative py-14" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h3 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
              Flash Deal FAQs
            </h3>
          </div>

          <div className="mt-8 divide-y rounded-2xl bg-white" style={{ border: `1px solid ${colors.stone}` }}>
            <FaqItem
              q="Do I have to come in today?"
              a="Not always. Many flash offers just require you to lock in pricing within the countdown window. You can schedule and redeem later, subject to availability and any stated expiration."
            />
            <FaqItem
              q="What if I miss the code window?"
              a="Early-bird codes are sometimes limited to the first 2 hours. After that, the price may still be lower than normal, but the bonus code will no longer apply."
            />
            <FaqItem
              q="Can I buy this as a gift?"
              a="Yes. These make amazing gifts. Ask us to put the service or product under a gift balance and we'll attach it to their name."
            />
            <FaqItem
              q="Are these stackable with memberships or other promos?"
              a="In most cases no, because these are already deeply discounted. If stacking is allowed, we'll say so clearly on the deal card."
            />
          </div>

          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted, textAlign: 'center', lineHeight: 1.6, maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto', marginTop: '1.5rem' }}>
            All offers subject to change or early sell-out. Must be a
            good candidate for treatment. Medical services require
            appropriate consultation and approval. See clinic for full
            details.
          </p>
        </div>
      </section>
    </BetaLayout>
  )
}

FlashSalePage.getLayout = (page) => page
