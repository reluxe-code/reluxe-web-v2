// pages/landing/bf-jeuveau.js
// Black Friday Jeuveau Deal — Buy 2 Areas, Get 1 Free (up to 64 units)

import { useEffect, useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const BOOK_URL = '/book/tox'
const DEALS_URL = '/book/bf25-jeuveau'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function JeuveauBlackFridayPage() {
  const [timeLeft, setTimeLeft] = useState('')

  // Countdown Timer
  useEffect(() => {
    const dealEnd = new Date('2025-12-02T23:59:59-05:00').getTime()

    const updateTimer = () => {
      const now = Date.now()
      const diff = dealEnd - now

      if (diff <= 0) {
        setTimeLeft('Ends soon')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)

      if (days > 0) setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      else setTimeLeft(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const id = setInterval(updateTimer, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <BetaLayout
      title="Black Friday Jeuveau — Buy 2 Areas, Get 1 Free"
      description="Limited-time Black Friday Jeuveau deal at RELUXE: Buy 2 areas, get 1 free (up to 64 units) for $488. Book in November or buy up to 4 packages to use through 2026."
      canonical="https://reluxemedspa.com/landing/bf-jeuveau"
    >
      {/* Hero */}
      <section className="relative w-full overflow-hidden" style={{ backgroundColor: colors.ink }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-7 md:py-8">
          <div style={{ color: colors.white }}>

            {/* Location + Countdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-[11px] sm:text-xs tracking-widest uppercase" style={{ color: colors.muted, fontFamily: fonts.body }}>
                RELUXE &bull; Carmel &amp; Westfield
              </p>

              {timeLeft && (
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] sm:text-xs ring-1 ring-violet-500/50" style={{ backgroundColor: 'rgba(42,42,42,0.8)', color: '#E5E5E5', fontFamily: fonts.body }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-semibold uppercase tracking-wide">Deal Ends In</span>
                  <span className="font-mono font-semibold" style={{ color: '#DDD6FE' }}>{timeLeft}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1
              className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
              style={{ fontFamily: fonts.display }}
            >
              Black Friday Jeuveau: Buy 2 Areas, Get 1 Free
            </h1>

            {/* Subcopy */}
            <p className="mt-3 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl" style={{ fontFamily: fonts.body, color: '#D4D4D4' }}>
              Love the natural Jeuveau look? Get the <strong>look of all 3 upper-face areas</strong> — forehead lines,
              frown lines (11s), and crow&rsquo;s feet — for just <strong>$488</strong> (up to 64 units).
            </p>

            {/* Bullets */}
            <ul className="mt-3 space-y-1.5 text-sm sm:text-[15px]" style={{ color: '#D4D4D4' }}>
              <LI>Buy 2 Jeuveau areas, get the 3rd free — up to 64 units for $488.</LI>
              <LI>Covers forehead, 11s, and crow&rsquo;s feet — the full upper face.</LI>
              <LI>All units used in ONE appointment to find your correct dose.</LI>
              <LI>Book in November &amp; pay at your visit — or buy up to 4 packages for 2026.</LI>
              <LI>Best Jeuveau pricing all year. Ends after Cyber Monday.</LI>
            </ul>

            {/* CTAs */}
            <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
              <CTA href={BOOK_URL} primary>
                Book in November &bull; Pay at Your Visit
              </CTA>

              <CTA href={DEALS_URL}>
                Not Due Yet? Buy Up to 4 for 2026
              </CTA>

              <CTA href={BOOK_URL} dataAttr="westfield">
                Book Westfield
              </CTA>
              <CTA href={BOOK_URL} dataAttr="carmel">
                Book Carmel
              </CTA>
            </div>

            <div className="mt-2 text-[11px] max-w-xl" style={{ color: colors.muted, fontFamily: fonts.body }}>
              Mention the <strong>&ldquo;Black Friday Jeuveau Buy 2, Get 1 Free&rdquo;</strong> deal at booking. Limited quantities may sell out.
            </div>
          </div>
        </div>
      </section>

      {/* How it works + Why 1 appointment */}
      <section className="relative py-10 sm:py-12" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 sm:gap-7 items-stretch">

          <div className="lg:col-span-6">
            <Card title="How Your Jeuveau Deal Works">
              <ul className="space-y-2 text-sm sm:text-[15px]" style={{ color: colors.body }}>
                <Bullet>Look of all 3 Jeuveau areas for the price of 2.</Bullet>
                <Bullet>Up to 64 units included for $488.</Bullet>
                <Bullet>Book in November or buy up to 4 to use through 2026.</Bullet>
                <Bullet>Use at either RELUXE location.</Bullet>
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card title="Why We Use All Units in One Visit">
              <ul className="space-y-2 text-sm sm:text-[15px]" style={{ color: colors.body }}>
                <Bullet>
                  Shows us how YOUR facial muscles respond so we find your correct dose.
                </Bullet>
                <Bullet>Prevents under-treating or stretched-out results.</Bullet>
                <Bullet>Ensures forehead, 11s, and crow&rsquo;s feet stay balanced.</Bullet>
              </ul>
            </Card>
          </div>

        </div>

        <div className="mt-7 text-center px-4">
          <CTA href={DEALS_URL} primary>
            Claim Black Friday Jeuveau &bull; Book or Buy Now
          </CTA>
          <p className="mt-2 text-xs" style={{ color: colors.muted, fontFamily: fonts.body }}>Once Black Friday ends, this pricing disappears.</p>
        </div>
      </section>

      {/* Expectation Steps */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: colors.heading, fontFamily: fonts.display }}
          >
            What to Expect
          </h2>
          <p className="mt-3" style={{ color: colors.body, fontFamily: fonts.body }}>Same RELUXE visit — just a better price.</p>
        </div>

        <div className="mt-7 grid gap-4 sm:gap-6 sm:grid-cols-3">
          <StepCard
            step="Day 0"
            title="Consult + Treatment"
            copy="We map your forehead, 11s, and crow's feet and use your Jeuveau package in one visit (~30 min)."
          />
          <StepCard
            step="Days 2–7"
            title="Lines Soften"
            copy="Expression lines relax while keeping natural movement."
          />
          <StepCard
            step="Week 2+"
            title="Full Result"
            copy="Smooth, refreshed skin for ~3–4 months. Perfect time to redeem your next package."
          />
        </div>

        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Book Your Jeuveau Black Friday Spot
          </CTA>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        <h3
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center"
          style={{ color: colors.heading, fontFamily: fonts.display }}
        >
          Black Friday Jeuveau — FAQ
        </h3>

        <div className="mt-7 divide-y rounded-3xl bg-white" style={{ border: `1px solid ${colors.stone}` }}>
          <FaqItem
            q="Can this be used by returning Jeuveau patients?"
            a="Yes — new and returning patients can use this Black Friday offer as long as you're medically a candidate."
          />
          <FaqItem
            q="Do I have to pre-pay?"
            a="If you're due in November, just book and pay at your visit. Otherwise, buy up to 4 to use through 2026."
          />
          <FaqItem
            q="Why can't I split the units?"
            a="We want you to see your TRUE Jeuveau dose. Splitting usually leads to under-treatment and patchy results."
          />
          <FaqItem q="Which areas are included?" a="Forehead, 11s, and crow's feet." />
          <FaqItem q="How many packages can I buy?" a="Up to 4 per person to use through 2026." />
        </div>

        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Jeuveau
          </CTA>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="relative rounded-3xl p-[1px]" style={{ background: gradients.primary }}>
            <div className="rounded-3xl px-6 sm:px-8 py-10 sm:py-12 text-center" style={{ backgroundColor: colors.ink }}>
              <h4
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
                style={{ color: colors.white, fontFamily: fonts.display }}
              >
                Your Softest Jeuveau Result — Best Price of the Year
              </h4>
              <p className="mt-3 max-w-2xl mx-auto" style={{ color: '#D4D4D4', fontFamily: fonts.body }}>
                Treat all 3 upper-face areas now — or lock in savings to use throughout 2026.
              </p>

              <div className="mt-6 sm:mt-8">
                <CTA href={BOOK_URL} primary>
                  Claim the Jeuveau Buy 2, Get 1 Free Deal
                </CTA>
                <p className="mt-2 text-[11px]" style={{ color: colors.muted, fontFamily: fonts.body }}>Limited-time Black Friday pricing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

JeuveauBlackFridayPage.getLayout = (page) => page

/* ---------- Shared Components ---------- */

function CTA({ href, children, primary, dataAttr }) {
  const base =
    'inline-flex items-center justify-center px-6 py-3 font-semibold min-h-[48px] transition touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
  const cls = primary
    ? `${base} text-white w-full sm:w-auto shadow-lg group`
    : `${base} text-white/90 w-full sm:w-auto ring-1 ring-white/20 hover:bg-white/10 group`
  const style = primary
    ? { background: gradients.primary, borderRadius: '9999px', fontFamily: fonts.body }
    : { borderRadius: '9999px', fontFamily: fonts.body }
  return (
    <a href={href} data-book-loc={dataAttr} className={cls} style={style} rel="noopener">
      {children}
      {primary && <Arrow />}
    </a>
  )
}

function Card({ title, children }) {
  return (
    <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm" style={{ border: `1px solid ${colors.stone}` }}>
      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: colors.heading, fontFamily: fonts.display }}>{title}</h3>
      <div className="mt-3 sm:mt-4" style={{ fontFamily: fonts.body }}>{children}</div>
    </div>
  )
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2" style={{ fontFamily: fonts.body }}>
      <span className="mt-2 h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.violet }} />
      <span>{children}</span>
    </li>
  )
}

function LI({ children }) {
  return (
    <li className="flex items-start gap-2" style={{ fontFamily: fonts.body }}>
      <span className="mt-2 h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.violet, opacity: 0.6 }} />
      <span>{children}</span>
    </li>
  )
}

function StepCard({ step, title, copy }) {
  return (
    <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm" style={{ border: `1px solid ${colors.stone}` }}>
      <div className="flex items-center gap-3">
        <div
          className="h-10 min-w-[86px] px-3 rounded-xl text-white font-bold text-[11px] sm:text-xs tracking-tight flex items-center justify-center whitespace-nowrap"
          style={{ background: gradients.primary, fontFamily: fonts.body }}
        >
          {step}
        </div>
        <h6 className="text-sm sm:text-base font-extrabold tracking-tight" style={{ color: colors.heading, fontFamily: fonts.display }}>{title}</h6>
      </div>
      <p className="mt-3 text-sm sm:text-base" style={{ color: colors.body, fontFamily: fonts.body }}>{copy}</p>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group">
      <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 font-semibold flex items-center justify-between" style={{ fontFamily: fonts.body }}>
        <span className="text-sm sm:text-base" style={{ color: colors.heading }}>{q}</span>
        <svg
          className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: colors.muted }}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <div className="px-4 sm:px-6 pb-5 text-sm sm:text-base" style={{ color: colors.body, fontFamily: fonts.body }}>{a}</div>
    </details>
  )
}

function Arrow() {
  return (
    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
    </svg>
  )
}
