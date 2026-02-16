// /pages/flash-sales.js
// Adds ?all=1 mode to preview all upcoming scheduled drops.
// Normal mode = today's live deals only.

import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import HeaderTwo from '../components/header/header-2'
import { flashDeals as rawFlashDeals } from '../data/flashDeals'

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

// used in ?all=1 mode: show anything not finished yet
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

// tiny util to format date headers in ?all=1 mode
function formatDay(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

// get "YYYY-MM-DD" from startTime to group by day
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
          text: 'Limited-time RELUXE deal — act fast.',
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
      className="text-[11px] font-semibold text-violet-700 hover:text-violet-600"
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
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-bold text-neutral-900 leading-tight break-words">
              {deal.name}
            </h3>
            <p className="mt-1 text-[13px] text-neutral-600 leading-snug break-words">
              {deal.blurb}
            </p>
            {deal.limitNote && (
              <p className="mt-1 text-[11px] text-rose-600 font-semibold leading-snug">
                {deal.limitNote}
              </p>
            )}
            {deal.notes && (
              <p className="mt-1 text-[11px] text-neutral-500 leading-snug">
                {deal.notes}
              </p>
            )}
          </div>

          {/* Countdown */}
          <span className="shrink-0 inline-flex items-center rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg">
            {countdown}
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
              Flash Price
            </div>
            <div className="text-xl font-extrabold text-neutral-900 leading-none">
              {flashPriceDisplay}
            </div>
          </div>

          <div className="text-neutral-500 text-[13px] line-through leading-none">
            {regularPriceDisplay}
          </div>
        </div>

        {/* Early Bird */}
        {showEarly && (
          <div className="mt-3 rounded-xl bg-gradient-to-r from-violet-600 to-black p-3 text-white shadow-[0_16px_32px_-8px_rgba(139,92,246,0.5)] ring-1 ring-white/20">
            <div className="flex items-start justify-between">
              <div className="text-[13px] font-semibold leading-tight">
                Early Access Bonus
              </div>
              <div className="text-[10px] font-mono bg-white/10 px-2 py-1 rounded-md ring-1 ring-white/20 leading-none">
                CODE: {early.code}
              </div>
            </div>
            {early.extraDetails && (
              <p className="mt-1 text-[11px] text-white/80 leading-snug">
                {early.extraDetails}
              </p>
            )}
            <p className="mt-2 text-[10px] font-medium text-white/60 uppercase tracking-wide leading-none">
              Ends in{' '}
              {formatCountdown(Math.max(early.expiresAtMs - nowMs, 0))}
            </p>
          </div>
        )}

        {/* CTA Row */}
        <div className="mt-4 flex items-center justify-between">
          <a
            href={deal.linkBook}
            className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-[13px] font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
          >
            Claim Deal →
          </a>

          <ShareButton url={deal.linkShare} />
        </div>

        {/* Timing */}
        <div className="mt-3 text-[10px] text-neutral-500 leading-relaxed">
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
      <summary className="cursor-pointer list-none px-6 py-4 font-semibold flex items-center justify-between">
        <span className="text-neutral-900">{q}</span>
        <svg
          className="h-5 w-5 text-neutral-400 transition-transform group-open:rotate-180"
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
      <div className="px-6 pb-5 text-neutral-700 text-sm leading-relaxed">
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

  // normalize incoming data so we never reference undefined
  const { services, products } = useMemo(
    () => safeDeals(rawFlashDeals),
    []
  )

  // --- CURRENT MODE (default) ---
  // filter only currently active deals for public view
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

  // --- FUTURE / ALL MODE (admin-ish) ---
  // build a map of day -> { services:[], products:[], dayLabel }
  const futureSchedule = useMemo(() => {
    if (!showAll) return []

    const _now = nowMs
    // step 1: filter for "end in future"
    const upcomingServices = services.filter((d) =>
      isUpcomingOrActive(d, _now)
    )
    const upcomingProducts = products.filter((d) =>
      isUpcomingOrActive(d, _now)
    )

    // step 2: group by dayKey derived from startTime
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

    // step 3: turn into sorted array by dayKey ascending
    const sorted = Object.values(bucket).sort((a, b) =>
      a.dayKey.localeCompare(b.dayKey)
    )

    return sorted
  }, [showAll, services, products, nowMs])

  // SEO/jsonLd still describes current live stuff (not schedule view)
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
    <>
      <Head>
        <title>Flash Sale | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Today’s limited-time RELUXE flash deals on massage, injectables, facials, laser, and skincare. When it’s gone, it’s gone."
        />
        <link
          rel="canonical"
          href="https://reluxemedspa.com/flash-sales"
        />
        <meta
          property="og:title"
          content="RELUXE Flash Deal of the Day"
        />
        <meta
          property="og:description"
          content="Act fast. These treatments and products are discounted for hours, not days."
        />
        <meta
          property="og:image"
          content="/images/deals/og-flash-sale.jpg"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </Head>

      <HeaderTwo />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.28),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="max-w-3xl">
            <p className="text-[11px] tracking-widest uppercase text-white/60 font-semibold flex items-center gap-3 flex-wrap">
              <span>RELUXE • Flash Deals</span>

              {/* admin-ish toggle pill */}
              <a
                href={showAll ? '/flash-sales' : '/flash-sales?all=1'}
                className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/20 hover:bg-white/20"
              >
                {showAll ? 'View Today' : 'View Schedule'}
              </a>
            </p>

            <div className="mt-2 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Today Only. Blink and It’s Gone.
                </h1>
              </div>

              {/* live status pill */}
              <div className="flex items-center gap-2 text-[10px] text-white/70 leading-tight">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                </span>
                <span className="font-semibold tracking-wide uppercase text-white/80">
                  {hasAnything ? 'Live Now' : 'No Active Drop'}
                </span>
              </div>
            </div>

            <p className="mt-4 text-neutral-300 text-lg leading-snug">
              Limited-quantity pricing on our most requested services
              and skincare. These offers activate and expire on a
              timer. When the countdown hits zero, it’s over.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px]">
              <a
                href="/book/"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
              >
                Book Ahead
              </a>
              <a
                href="/join-texts"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition"
              >
                Get Text Alerts
              </a>

              <div className="text-[11px] text-white/50 leading-tight">
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
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-center">
              <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">
                Nothing Live (Yet)
              </h2>
              <p className="mt-2 text-[14px] text-neutral-700 max-w-xl mx-auto leading-relaxed">
                Flash Deals drop during Thanksgiving week, Black Friday,
                the weekend, Cyber Monday — plus surprise “Flash
                Tuesdays.” Join texts so you’re first to know.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <a
                  href="/join-texts"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-[13px] font-semibold text-white bg-gradient-to-r from-violet-600 to-black hover:from-violet-500 hover:to-neutral-900 transition"
                >
                  Get Text Alerts
                </a>
                <a
                  href="/book/"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-[13px] font-semibold ring-1 ring-neutral-300 hover:bg-neutral-50"
                >
                  Book a Consult
                </a>
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
                          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-neutral-900">
                            Services
                          </h2>
                          <div className="text-[11px] text-neutral-500">
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
                          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-neutral-900">
                            Skincare & Retail
                          </h2>
                          <div className="text-[11px] text-neutral-500">
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
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-center">
              <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">
                No Upcoming Drops
              </h2>
              <p className="mt-2 text-[14px] text-neutral-700 max-w-xl mx-auto leading-relaxed">
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

                // if both sides each have exactly one, we mirror the side-by-side pair logic
                const pairMode =
                  dayServices.length === 1 && dayProducts.length === 1

                return (
                  <div
                    key={dayBlock.dayKey}
                    className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
                  >
                    <div className="border-b border-neutral-200 bg-neutral-50/60 rounded-t-2xl px-4 py-3 sm:px-6">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                            Scheduled Drop
                          </div>
                          <div className="text-lg font-extrabold text-neutral-900 leading-tight">
                            {dayBlock.dayLabel}
                          </div>
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Runs{' '}
                          {dayServices[0] || dayProducts[0]
                            ? new Date(
                                (dayServices[0] || dayProducts[0])
                                  .startTime
                              ).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            : '—'}{' '}
                          to{' '}
                          {dayServices[0] || dayProducts[0]
                            ? new Date(
                                (dayServices[0] || dayProducts[0])
                                  .endTime
                              ).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            : '—'}
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
                                <h3 className="text-base md:text-lg font-extrabold tracking-tight text-neutral-900">
                                  Services
                                </h3>
                                <div className="text-[11px] text-neutral-500">
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
                                <h3 className="text-base md:text-lg font-extrabold tracking-tight text-neutral-900">
                                  Skincare & Retail
                                </h3>
                                <div className="text-[11px] text-neutral-500">
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
      <section className="relative bg-neutral-50 py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">
              Flash Deal FAQs
            </h3>
          </div>

          <div className="mt-8 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
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
              a="Yes. These make amazing gifts. Ask us to put the service or product under a gift balance and we’ll attach it to their name."
            />
            <FaqItem
              q="Are these stackable with memberships or other promos?"
              a="In most cases no, because these are already deeply discounted. If stacking is allowed, we’ll say so clearly on the deal card."
            />
          </div>

          <p className="mt-6 text-[11px] text-neutral-500 text-center leading-relaxed max-w-2xl mx-auto">
            All offers subject to change or early sell-out. Must be a
            good candidate for treatment. Medical services require
            appropriate consultation and approval. See clinic for full
            details.
          </p>
        </div>
      </section>
    </>
  )
}
