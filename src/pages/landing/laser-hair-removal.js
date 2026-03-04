// pages/landing/laser-hair-removal.js
// RELUXE • Laser Hair Removal Packages (Carmel & Westfield)
// Drop-in page with client-only "Find My Area" + safe SSR/SSG rendering

/* eslint-disable @next/next/no-img-element */

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

// Client-only selector (prevents prerender / window access issues)
const FindMyAreaSelector = dynamic(() => import('../../components/laser/FindMyAreaSelector'), {
  ssr: false,
})

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const PAGE_PATH = '/landing/laser-hair-removal'
const BRAND = 'RELUXE Med Spa'
const LOCATION_TAGLINE = 'Carmel & Westfield, IN'

// Booking links (swap to your real Boulevard routes)
const BOOK_CONSULT_WESTFIELD = '/book/laser-consult?loc=westfield'
const BOOK_CONSULT_CARMEL = '/book/laser-consult?loc=carmel'
const BOOK_FIRST_SERVICE = '/book/laser-hair-removal'

// Contact
const MARKETING_SMS = '3173609000'
const PHONE_CALL = '3177631142'
const DISPLAY_PHONE = '317-763-1142'
const IG_URL = 'https://instagram.com/reluxemedspa'

// Reel
const REEL_URL = 'https://www.instagram.com/reel/DUn02FGDoSu/'
const REEL_EMBED_URL = 'https://www.instagram.com/reel/DUn02FGDoSu/embed'

// Pricing table data
const PRICING = [
  {
    size: 'Small Area',
    single: '$100',
    package: '$500',
    packageNote: 'Buy 5, get 3 free (8 total)',
    areas: 'Upper Lip \u2022 Chin \u2022 Hands \u2022 Feet',
  },
  {
    size: 'Standard Area',
    single: '$250',
    package: '$1,250',
    packageNote: 'Buy 5, get 3 free (8 total)',
    areas: 'Underarms \u2022 Bikini Line \u2022 Face \u2022 Half Arms \u2022 Half Back \u2022 Stomach \u2022 Shoulder',
  },
  {
    size: 'Large Area',
    single: '$450',
    package: '$2,250',
    packageNote: 'Buy 5, get 3 free (8 total)',
    areas: 'Brazilian (female only) \u2022 Lower Legs \u2022 Full Back \u2022 Full Chest',
  },
  {
    size: 'X-Large Area',
    single: '$750',
    package: '$3,750',
    packageNote: 'Buy 5, get 3 free (8 total)',
    areas: 'Full Legs',
  },
]

const UNLIMITED = {
  name: 'Truly Unlimited',
  price: '$5,000',
  note: 'Unlimited sessions \u2022 Unlimited areas \u2022 18 months',
}

const FAQS = [
  {
    q: 'Do I need a consult first?',
    a: 'If you\u2019re new to laser, a consult is the fastest way to confirm candidacy and map your areas + plan. If you already know what you want, you can book your first session directly.',
  },
  {
    q: 'How many sessions do most people need?',
    a: 'Most people need multiple sessions because hair grows in cycles. Your provider will recommend a plan based on area, hair density, and your goals.',
  },
  {
    q: 'Does it hurt?',
    a: 'Most clients describe it as quick snaps + warmth. It\u2019s fast, and we\u2019ll keep you comfortable the whole time.',
  },
  {
    q: 'How do I prep for my appointment?',
    a: 'Shave the area 24 hours before. Avoid tanning/sunburn. Skip waxing/epilating (we need the follicle). We\u2019ll review the full prep at consult or before your first session.',
  },
  {
    q: 'Can I do multiple areas in one visit?',
    a: 'Yes \u2014 and additional areas are 50% off the same visit. Additional packages are also 50% off (lowest price).',
  },
]

/** Tracking helper */
function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  const payload = {
    ...params,
    page_path: window.location?.pathname || '',
    page_url: window.location?.href || '',
  }

  if (typeof window.fbq === 'function') {
    try { window.fbq('trackCustom', eventName, payload) } catch {}
  }
  if (typeof window.gtag === 'function') {
    try { window.gtag('event', eventName, payload) } catch {}
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...payload })
  }
}

export default function LaserHairRemovalLanding() {
  const [videoOpen, setVideoOpen] = useState(false)

  useEffect(() => {
    if (!videoOpen) return
    const onKey = (e) => e.key === 'Escape' && setVideoOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [videoOpen])

  const smsBody = encodeURIComponent(
    `Hi RELUXE! I'm interested in Laser Hair Removal packages. Can you help me book a consult?`
  )
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  const ogDesc =
    'Smooth skin, less upkeep. Clear packages, flexible plans, and a consult that makes it easy to start. Book Carmel or Westfield.'

  return (
    <BetaLayout
      title="Laser Hair Removal Packages | Carmel & Westfield"
      description={ogDesc}
      canonical={`https://reluxemedspa.com${PAGE_PATH}`}
    >
      {/* HERO */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.18), transparent 60%)`,
        }}
      >
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem 2.5rem' }}>
          <div className="grid lg:grid-cols-12 gap-7 lg:gap-10 items-stretch">
            {/* LEFT */}
            <div className="lg:col-span-7" style={{ color: colors.white, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.letterSpacing, textTransform: 'uppercase', color: colors.muted }}>
                {BRAND} &bull; {LOCATION_TAGLINE}
              </p>

              <h1 style={{ marginTop: '0.5rem', fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white }}>
                Laser Hair Removal that feels{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>simple</span>.
              </h1>

              <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, fontSize: typeScale.subhead.size, lineHeight: typeScale.subhead.lineHeight, color: colors.white }}>
                Packages that match real treatment plans (and actually save you money). Start with a consult&mdash;or book
                your first session today.
              </p>

              <ul style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: fonts.body, color: colors.white }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', backgroundColor: colors.violet, flexShrink: 0 }} />
                  <span>Clear pricing by area size (Small &rarr; X-Large)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', backgroundColor: colors.violet, flexShrink: 0 }} />
                  <span><strong>Buy 5, get 3 free</strong> packages (8 total sessions)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', backgroundColor: colors.violet, flexShrink: 0 }} />
                  <span>Additional areas <strong>50% off</strong> the same visit</span>
                </li>
              </ul>

              <div style={{ marginTop: '1.5rem' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
              </div>

              <div style={{ marginTop: '1rem', borderRadius: '9999px', backgroundColor: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)', padding: '1rem' }}>
                <div className="grid gap-3 sm:grid-cols-12 sm:items-center">
                  <div className="sm:col-span-4">
                    <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>Questions before you book?</p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>We&apos;ll help you choose areas + plan.</p>
                  </div>
                  <div className="sm:col-span-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <TrackedLink href={smsHref} primary onClick={() => trackEvent('sms_click', { service: 'lhr', placement: 'hero_help', phone: MARKETING_SMS })}>
                        Text Us
                      </TrackedLink>
                      <TrackedLink href={callHref} onClick={() => trackEvent('call_click', { service: 'lhr', placement: 'hero_help', phone: PHONE_CALL })}>
                        Call {DISPLAY_PHONE}
                      </TrackedLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5 flex flex-col">
              <div style={{ borderRadius: '1.5rem', border: '1px solid rgba(250,248,245,0.1)', backgroundColor: 'rgba(250,248,245,0.05)', padding: '1rem 1.25rem', flex: 1 }}>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.letterSpacing, textTransform: 'uppercase', color: colors.muted }}>Watch</p>
                <h3 style={{ marginTop: '0.25rem', fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.white }}>
                  What laser is really like (and why packages win)
                </h3>
                <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>
                  Mobile plays inline. Desktop: tap to watch fullscreen.
                </p>

                {/* Mobile: inline embed */}
                <div className="mt-4 md:hidden" style={{ aspectRatio: '9/16', width: '100%', overflow: 'hidden', borderRadius: '1rem', border: '1px solid rgba(250,248,245,0.1)', backgroundColor: '#000' }}>
                  <iframe
                    src={REEL_EMBED_URL}
                    title="RELUXE Laser Hair Removal video"
                    className="h-full w-full"
                    style={{ border: 0 }}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>

                {/* Desktop: preview -> modal */}
                <div className="mt-4 hidden md:block">
                  <div style={{ margin: '0 auto', maxWidth: 320 }}>
                    <button
                      type="button"
                      onClick={() => {
                        trackEvent('video_fullscreen_open', { service: 'lhr', placement: 'hero_preview' })
                        setVideoOpen(true)
                      }}
                      className="group w-full text-left"
                      aria-label="Open video fullscreen"
                    >
                      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '1rem', border: '1px solid rgba(250,248,245,0.1)', backgroundColor: '#000' }}>
                        <div style={{ aspectRatio: '9/16', maxHeight: 380 }}>
                          <iframe
                            src={REEL_EMBED_URL}
                            title="RELUXE Laser Hair Removal preview"
                            className="h-full w-full"
                            style={{ border: 0 }}
                            scrolling="no"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                          />
                        </div>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.1), transparent)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', right: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(250,248,245,0.1)', padding: '0.375rem 0.75rem', fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.white, border: '1px solid rgba(250,248,245,0.1)' }}>
                            <span style={{ height: '0.5rem', width: '0.5rem', borderRadius: '9999px', backgroundColor: colors.violet }} />
                            Watch fullscreen
                          </span>
                          <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.8)' }}>&nearr;</span>
                        </div>
                      </div>
                    </button>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <TrackedLink href={REEL_URL} primary onClick={() => trackEvent('ig_reel_click', { service: 'lhr', placement: 'video_card' })}>
                        Watch on IG
                      </TrackedLink>
                      <TrackedLink href={IG_URL} onClick={() => trackEvent('instagram_click', { service: 'lhr', placement: 'video_card_profile' })}>
                        See more
                      </TrackedLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {videoOpen && <VideoModal title="RELUXE Laser Hair Removal" src={REEL_EMBED_URL} onClose={() => setVideoOpen(false)} />}

      {/* FIND MY AREA (client-only) */}
      <FindMyAreaSelector
        onTrack={(name, params) => trackEvent(name, params)}
        bookCarmel={BOOK_CONSULT_CARMEL}
        bookWestfield={BOOK_CONSULT_WESTFIELD}
        bookFirst={BOOK_FIRST_SERVICE}
      />

      {/* PRICING */}
      <section style={{ backgroundColor: '#fff', padding: '3rem 0 3.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div className="md:flex md:items-end md:justify-between gap-6">
            <div>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.letterSpacing, textTransform: 'uppercase', color: colors.muted }}>Pricing</p>
              <h2 style={{ marginTop: '0.5rem', fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, color: colors.heading }}>
                Simple by-area pricing
              </h2>
              <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, color: colors.body, maxWidth: '42rem' }}>
                Packages are built for real treatment plans&mdash;not &ldquo;one and done.&rdquo;
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>
          </div>

          <div style={{ marginTop: '1.75rem', border: `1px solid ${colors.stone}`, borderRadius: '1.5rem', overflow: 'hidden' }}>
            <div className="hidden sm:grid grid-cols-12" style={{ backgroundColor: colors.cream, padding: '0.75rem 1.25rem', fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.body }}>
              <div className="col-span-6">Option</div>
              <div className="col-span-3 text-right">Single</div>
              <div className="col-span-3 text-right">Package</div>
            </div>

            <div className="divide-y" style={{ backgroundColor: '#fff', borderColor: colors.stone }}>
              {PRICING.map((row) => (
                <div key={row.size} className="grid grid-cols-1 sm:grid-cols-12 gap-2" style={{ padding: '1.25rem' }}>
                  <div className="sm:col-span-6">
                    <p style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>{row.size}</p>
                    <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>{row.areas}</p>

                    <div className="mt-3 sm:hidden grid grid-cols-2 gap-3">
                      <div style={{ borderRadius: '1rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, padding: '0.75rem' }}>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.body }}>Single</p>
                        <p style={{ marginTop: '0.25rem', fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>{row.single}</p>
                      </div>
                      <div style={{ borderRadius: '1rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, padding: '0.75rem' }}>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.body }}>Package</p>
                        <p style={{ marginTop: '0.25rem', fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>{row.package}</p>
                        <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.body }}>{row.packageNote}</p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block sm:col-span-3 text-right">
                    <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>{row.single}</p>
                  </div>
                  <div className="hidden sm:block sm:col-span-3 text-right">
                    <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>{row.package}</p>
                    <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.body }}>{row.packageNote}</p>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2" style={{ padding: '1.5rem 1.25rem', backgroundColor: colors.cream }}>
                <div className="sm:col-span-7">
                  <p style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>{UNLIMITED.name}</p>
                  <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>{UNLIMITED.note}</p>
                </div>
                <div className="sm:col-span-5 text-left sm:text-right">
                  <p style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>{UNLIMITED.price}</p>
                  <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.body }}>Best for multi-area goals.</p>
                </div>
              </div>
            </div>
          </div>

          <p style={{ marginTop: '1rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>
            <strong>Bonus:</strong> Additional areas 50% off (same visit). Additional packages 50% off (lowest price).
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ backgroundColor: colors.cream, padding: '3rem 0 3.5rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1rem' }}>
          <h3 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, textAlign: 'center', color: colors.heading }}>
            Laser Hair Removal FAQ
          </h3>

          <div style={{ marginTop: '1.75rem', border: `1px solid ${colors.stone}`, borderRadius: '1.5rem', backgroundColor: '#fff', overflow: 'hidden' }} className="divide-y divide-neutral-200">
            {FAQS.map((x) => (
              <FaqItem key={x.q} q={x.q} a={x.a} />
            ))}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

LaserHairRemovalLanding.getLayout = (page) => page

/* -----------------------------
   UI Components
------------------------------ */

function TrackedLink({ href, children, primary, onClick }) {
  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', padding: '0.75rem 1.5rem', fontFamily: fonts.body, fontWeight: 600, minHeight: '3rem', touchAction: 'manipulation', transition: 'all 150ms ease', textDecoration: 'none', width: '100%' }
  const styles = primary
    ? { ...base, color: '#fff', background: gradients.primary }
    : { ...base, color: colors.white, border: '1px solid rgba(250,248,245,0.2)', backgroundColor: 'rgba(250,248,245,0.05)' }

  return (
    <a href={href} style={styles} rel="noopener" onClick={onClick}>
      {children}
    </a>
  )
}

function VideoModal({ title, src, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="w-full max-w-md sm:max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(250,248,245,0.1)', backgroundColor: '#000' }}>
          <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>{title}</p>
            <button type="button" style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.8)', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}>
              Close
            </button>
          </div>

          <div style={{ aspectRatio: '9/16', width: '100%' }}>
            <iframe
              src={src}
              title={title}
              className="h-full w-full"
              style={{ border: 0 }}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <details className="group">
      <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1rem 1.5rem', fontFamily: fonts.body, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.9375rem', color: colors.heading }}>{q}</span>
        <svg className="h-5 w-5 transition-transform group-open:rotate-180" style={{ color: colors.muted }} viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <div style={{ padding: '0 1.5rem 1.25rem', fontFamily: fonts.body, color: colors.body, fontSize: '0.9375rem' }}>{a}</div>
    </details>
  )
}
