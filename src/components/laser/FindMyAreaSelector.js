// components/laser/FindMyAreaSelector.js
// Compact "Find My Area" selector + recommendation logic (package vs unlimited)

import { useMemo, useState } from 'react'

const AREA_CATALOG = {
  small: [
    { key: 'upper_lip', label: 'Upper Lip' },
    { key: 'chin', label: 'Chin' },
    { key: 'hands', label: 'Hands' },
    { key: 'feet', label: 'Feet' },
  ],
  standard: [
    { key: 'underarms', label: 'Underarms' },
    { key: 'bikini_line', label: 'Bikini Line' },
    { key: 'face', label: 'Face' },
    { key: 'half_arms', label: 'Half Arms' },
    { key: 'half_back', label: 'Half Back' },
    { key: 'stomach', label: 'Stomach' },
    { key: 'shoulder', label: 'Shoulder' },
  ],
  large: [
    { key: 'brazilian_female', label: 'Brazilian (female only)' },
    { key: 'lower_legs', label: 'Lower Legs' },
    { key: 'full_back', label: 'Full Back' },
    { key: 'full_chest', label: 'Full Chest' },
  ],
  xlarge: [{ key: 'full_legs', label: 'Full Legs' }],
}

const PRICE = {
  small: { single: 100, pkg: 500, pkgNote: 'Buy 5, get 3 free (8 total)' },
  standard: { single: 250, pkg: 1250, pkgNote: 'Buy 5, get 3 free (8 total)' },
  large: { single: 450, pkg: 2250, pkgNote: 'Buy 5, get 3 free (8 total)' },
  xlarge: { single: 750, pkg: 3750, pkgNote: 'Buy 5, get 3 free (8 total)' },
}

const TIERS = ['small', 'standard', 'large', 'xlarge']
const UNLIMITED_PRICE = 5000

function formatUSD(n) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `$${Math.round(n)}`
  }
}

// Largest full price, everything else 50% (same visit)
function computeBundleTotal(prices) {
  if (!prices.length) return 0
  const sorted = [...prices].sort((a, b) => b - a)
  const [largest, ...rest] = sorted
  return largest + rest.reduce((sum, p) => sum + p * 0.5, 0)
}

function computeSavings(fullTotal, discountedTotal) {
  const s = fullTotal - discountedTotal
  return s > 0 ? s : 0
}

function labelTier(t) {
  if (t === 'small') return 'Small'
  if (t === 'standard') return 'Standard'
  if (t === 'large') return 'Large'
  return 'X-Large'
}

export default function FindMyAreaSelector({ onTrack, bookCarmel, bookWestfield, bookFirst }) {
  const [selectedKeys, setSelectedKeys] = useState([])
  const [activeTier, setActiveTier] = useState('standard') // default: most common

  const allAreas = useMemo(() => {
    const flatten = []
    for (const tier of TIERS) {
      for (const a of AREA_CATALOG[tier]) flatten.push({ ...a, tier })
    }
    return flatten
  }, [])

  const selected = useMemo(() => {
    const map = new Map(allAreas.map((a) => [a.key, a]))
    return selectedKeys.map((k) => map.get(k)).filter(Boolean)
  }, [selectedKeys, allAreas])

  const breakdown = useMemo(() => {
    const byTier = { small: [], standard: [], large: [], xlarge: [] }
    selected.forEach((a) => byTier[a.tier].push(a))

    const singlePrices = selected.map((a) => PRICE[a.tier].single)
    const pkgPrices = selected.map((a) => PRICE[a.tier].pkg)

    const singleFull = singlePrices.reduce((s, p) => s + p, 0)
    const pkgFull = pkgPrices.reduce((s, p) => s + p, 0)

    const singleDiscounted = computeBundleTotal(singlePrices)
    const pkgDiscounted = computeBundleTotal(pkgPrices)

    const singleSavings = computeSavings(singleFull, singleDiscounted)
    const pkgSavings = computeSavings(pkgFull, pkgDiscounted)

    return {
      byTier,
      count: selected.length,
      single: { full: singleFull, discounted: singleDiscounted, savings: singleSavings },
      pkg: { full: pkgFull, discounted: pkgDiscounted, savings: pkgSavings },
    }
  }, [selected])

  // Recommendation logic (your rules)
  const recommendation = useMemo(() => {
    const count = breakdown.count
    const pkgTotal = breakdown.pkg.discounted

    if (count >= 2) {
      // Multi-area logic
      if (pkgTotal >= UNLIMITED_PRICE) {
        return {
          type: 'unlimited_only',
          title: `Unlimited is your best move`,
          primary: `${formatUSD(UNLIMITED_PRICE)} Unlimited`,
          secondary: null,
          note: `Your selected package estimate is ${formatUSD(pkgTotal)} — once you’re at/over ${formatUSD(
            UNLIMITED_PRICE
          )}, Unlimited is the smartest value.`,
        }
      }

      return {
        type: 'package_or_unlimited',
        title: `Recommended: Package plan (or go Unlimited)`,
        primary: `${formatUSD(pkgTotal)} Packages (8 sessions)`,
        secondary: `${formatUSD(UNLIMITED_PRICE)} Unlimited`,
        note: `Because you picked multiple areas. Packages match real treatment plans — Unlimited is the “done with hair” option.`,
      }
    }

    if (count === 1) {
      return {
        type: 'single_area',
        title: `Recommended: Package for best results`,
        primary: `${formatUSD(breakdown.pkg.discounted)} Package (8 sessions)`,
        secondary: `${formatUSD(breakdown.single.discounted)} Single visit`,
        note: `One area still typically needs multiple sessions — package is the best value.`,
      }
    }

    return null
  }, [breakdown])

  function toggle(key) {
    setSelectedKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      onTrack?.('lhr_area_toggle', { key, selectedCount: next.length })
      return next
    })
  }

  function clearAll() {
    setSelectedKeys([])
    onTrack?.('lhr_area_clear', {})
  }

  const tierOptions = [
    { value: 'small', label: 'Small' },
    { value: 'standard', label: 'Standard' },
    { value: 'large', label: 'Large' },
    { value: 'xlarge', label: 'X-Large' },
  ]

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* QUIZ (top) */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-widest uppercase text-neutral-500">Find my area</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Pick your areas → we’ll show your “same visit” total
              </h2>
              <p className="mt-2 text-sm sm:text-base text-neutral-600">
                Simple rule: <strong>largest area is full price</strong>, every additional area is{' '}
                <strong>50% off</strong> in the same visit.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800">
                Selected: {breakdown.count}
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-900 underline"
              >
                Clear
              </button>
            </div>
          </div>

          {/* All tiers (no dropdown) */}
          <div className="mt-6 grid gap-5">
            <TierBlock tier="small" title="Small" subtitle="Quick areas" selectedCount={breakdown.byTier.small.length}>
              {AREA_CATALOG.small.map((a) => (
                <Chip
                  key={a.key}
                  label={a.label}
                  tier="small"
                  active={selectedKeys.includes(a.key)}
                  onClick={() => toggle(a.key)}
                />
              ))}
            </TierBlock>

            <TierBlock tier="standard" title="Standard" subtitle="Most popular" selectedCount={breakdown.byTier.standard.length}>
              {AREA_CATALOG.standard.map((a) => (
                <Chip
                  key={a.key}
                  label={a.label}
                  tier="standard"
                  active={selectedKeys.includes(a.key)}
                  onClick={() => toggle(a.key)}
                />
              ))}
            </TierBlock>

            <TierBlock tier="large" title="Large" subtitle="Bigger zones" selectedCount={breakdown.byTier.large.length}>
              {AREA_CATALOG.large.map((a) => (
                <Chip
                  key={a.key}
                  label={a.label}
                  tier="large"
                  active={selectedKeys.includes(a.key)}
                  onClick={() => toggle(a.key)}
                />
              ))}
            </TierBlock>

            <TierBlock tier="xlarge" title="X-Large" subtitle="Full coverage" selectedCount={breakdown.byTier.xlarge.length}>
              {AREA_CATALOG.xlarge.map((a) => (
                <Chip
                  key={a.key}
                  label={a.label}
                  tier="xlarge"
                  active={selectedKeys.includes(a.key)}
                  onClick={() => toggle(a.key)}
                />
              ))}
            </TierBlock>
          </div>

        </div>

        {/* RESULTS (below) */}
        <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">Your results</h3>
              <p className="mt-1 text-sm text-neutral-600">We’ll confirm sizing at consult/visit.</p>
            </div>

            {breakdown.count > 1 && (
              <div className="hidden sm:block rounded-2xl bg-white ring-1 ring-neutral-200 px-3 py-2 text-xs text-neutral-700">
                <strong>Multi-area discount</strong>
                <br />
                Largest full price
                <br />
                Others 50% off
              </div>
            )}
          </div>

          {breakdown.count === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Totals */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <TotalCard
                  title="Single visit total"
                  big={formatUSD(breakdown.single.discounted)}
                  sub={
                    breakdown.single.savings
                      ? `Save ~${formatUSD(breakdown.single.savings)} vs booking separately`
                      : 'Largest full price + others 50% off'
                  }
                />
                <TotalCard
                  title="Package total (8 sessions)"
                  big={formatUSD(breakdown.pkg.discounted)}
                  sub={
                    breakdown.pkg.savings
                      ? `Save ~${formatUSD(breakdown.pkg.savings)} vs separate packages`
                      : 'Same-visit rule applied to packages'
                  }
                />
              </div>

              {/* Recommendation */}
              <div className="mt-4 rounded-2xl bg-white ring-1 ring-neutral-200 p-4">
                <p className="text-sm font-semibold text-neutral-900">Recommended plan</p>

                {recommendation ? (
                  <>
                    <p className="mt-1 text-sm text-neutral-700">{recommendation.title}</p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl bg-neutral-50 ring-1 ring-neutral-200 p-4">
                        <p className="text-xs font-semibold text-neutral-600">Top pick</p>
                        <p className="mt-1 text-lg font-extrabold tracking-tight text-neutral-900">
                          {recommendation.primary}
                        </p>
                      </div>

                      {recommendation.secondary ? (
                        <div className="rounded-2xl bg-neutral-50 ring-1 ring-neutral-200 p-4">
                          <p className="text-xs font-semibold text-neutral-600">Also great</p>
                          <p className="mt-1 text-lg font-extrabold tracking-tight text-neutral-900">
                            {recommendation.secondary}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <p className="mt-3 text-xs text-neutral-600">{recommendation.note}</p>
                  </>
                ) : null}

                {/* Next step */}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <PrimaryCTA
                    href={bookCarmel}
                    onClick={() =>
                      onTrack?.('book_consult_click', {
                        service: 'lhr',
                        location: 'carmel',
                        selectedCount: breakdown.count,
                        recommended: recommendation?.type || null,
                      })
                    }
                  >
                    Book Consult (Carmel)
                  </PrimaryCTA>
                  <PrimaryCTA
                    href={bookWestfield}
                    onClick={() =>
                      onTrack?.('book_consult_click', {
                        service: 'lhr',
                        location: 'westfield',
                        selectedCount: breakdown.count,
                        recommended: recommendation?.type || null,
                      })
                    }
                  >
                    Book Consult (Westfield)
                  </PrimaryCTA>
                </div>

                {bookFirst ? (
                  <div className="mt-2">
                    <SecondaryCTA
                      href={bookFirst}
                      onClick={() =>
                        onTrack?.('book_first_click', {
                          service: 'lhr',
                          selectedCount: breakdown.count,
                          recommended: recommendation?.type || null,
                        })
                      }
                    >
                      Or book your first session
                    </SecondaryCTA>
                  </div>
                ) : null}
              </div>

              <p className="mt-4 text-[11px] text-neutral-500">
                Estimates assume standard area sizing per pricing guide. Final plan may vary by hair density, medical
                history, and candidacy.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function Chip({ label, active, onClick, tier }) {
  const tierStyles = {
    small: {
      base: 'bg-emerald-50 text-emerald-900 ring-emerald-200 hover:ring-emerald-300',
      active: 'bg-emerald-600 text-white ring-emerald-600 shadow-sm',
    },
    standard: {
      base: 'bg-sky-50 text-sky-900 ring-sky-200 hover:ring-sky-300',
      active: 'bg-gray-200 text-black ring-emerald-600 shadow-sm',
    },
    large: {
      base: 'bg-violet-50 text-violet-900 ring-violet-200 hover:ring-violet-300',
      active: 'bg-violet-600 text-white ring-violet-600 shadow-sm',
    },
    xlarge: {
      base: 'bg-amber-50 text-amber-900 ring-amber-200 hover:ring-amber-300',
      active: 'bg-amber-600 text-white ring-amber-600 shadow-sm',
    },
  }

  const styles = tierStyles[tier]

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1.5 text-sm font-semibold transition ring-1',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        active ? styles.active : styles.base,
      ].join(' ')}
    >
      {label}
    </button>
  )
}


function TierBlock({ title, children, tier, selectedCount }) {
  const badgeStyles = {
    small: 'bg-emerald-100 text-emerald-900',
    standard: 'bg-sky-100 text-sky-900',
    large: 'bg-violet-100 text-violet-900',
    xlarge: 'bg-amber-100 text-amber-900',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span
          className={[
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold',
            badgeStyles[tier],
          ].join(' ')}
        >
          {title}
        </span>

        {selectedCount > 0 && (
          <span className="text-xs text-neutral-500">
            {selectedCount}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
}


function TotalCard({ title, big, sub }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-neutral-200 p-4">
      <p className="text-xs font-semibold text-neutral-600">{title}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-900">{big}</p>
      <p className="mt-1 text-xs text-neutral-600">{sub}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-4 rounded-2xl bg-white ring-1 ring-neutral-200 p-6 text-center">
      <p className="text-sm font-semibold text-neutral-900">Pick at least one area</p>
      <p className="mt-1 text-sm text-neutral-600">We’ll show your same-visit total + the best plan.</p>
      <p className="mt-3 text-[11px] text-neutral-500">Tip: add multiple areas to see the discount + recommendations.</p>
    </div>
  )
}

function PrimaryCTA({ href, children, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] w-full text-white bg-gradient-to-r from-emerald-500 to-black shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-neutral-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      rel="noopener"
    >
      {children}
      <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
      </svg>
    </a>
  )
}

function SecondaryCTA({ href, children, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] w-full text-neutral-900 bg-white ring-1 ring-neutral-200 hover:ring-neutral-300 transition"
      rel="noopener"
    >
      {children}
    </a>
  )
}
