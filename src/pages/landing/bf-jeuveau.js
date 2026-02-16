// pages/landing/bf-jeuveau-b2g1.js
// Black Friday Jeuveau Deal — Buy 2 Areas, Get 1 Free (up to 64 units)

import Head from 'next/head'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/tox'
const DEALS_URL = '/book/bf25-jeuveau'

export default function JeuveauBlackFridayPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  // Sticky CTA
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 260)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    <>
      <Head>
        <title>Black Friday Jeuveau — Buy 2 Areas, Get 1 Free | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Limited-time Black Friday Jeuveau deal at RELUXE: Buy 2 areas, get 1 free (up to 64 units) for $488. Book in November or buy up to 4 packages to use through 2026."
        />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta property="og:title" content="Black Friday Jeuveau — Buy 2 Areas, Get 1 Free | RELUXE" />
        <meta
          property="og:description"
          content="Soft, natural Jeuveau results across forehead, 11s, and crow’s feet. Limited-time Black Friday pricing."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/landing/bf-jeuveau-b2g1" />
        <meta property="og:image" content="/images/landing/bf-tox-og.jpg" />
      </Head>

      <HeaderTwo />

      {/* -------------------------------------- */}
      {/* HERO */}
      {/* -------------------------------------- */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-7 md:py-8">
          <div className="text-white">

            {/* Location + Countdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">
                RELUXE • Carmel &amp; Westfield
              </p>

              {timeLeft && (
                <div className="inline-flex items-center gap-2 rounded-full bg-neutral-800/80 px-3 py-1 text-[11px] sm:text-xs text-neutral-200 ring-1 ring-violet-500/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-semibold uppercase tracking-wide">Deal Ends In</span>
                  <span className="font-mono font-semibold text-violet-200">{timeLeft}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Black Friday Jeuveau: Buy 2 Areas, Get 1 Free
            </h1>

            {/* Subcopy */}
            <p className="mt-3 text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl">
              Love the natural Jeuveau look? Get the <strong>look of all 3 upper-face areas</strong> — forehead lines,
              frown lines (11s), and crow’s feet — for just <strong>$488</strong> (up to 64 units).
            </p>

            {/* Bullets */}
            <ul className="mt-3 space-y-1.5 text-neutral-300 text-sm sm:text-[15px]">
              <LI>Buy 2 Jeuveau areas, get the 3rd free — up to 64 units for $488.</LI>
              <LI>Covers forehead, 11s, and crow’s feet — the full upper face.</LI>
              <LI>All units used in ONE appointment to find your correct dose.</LI>
              <LI>Book in November & pay at your visit — or buy up to 4 packages for 2026.</LI>
              <LI>Best Jeuveau pricing all year. Ends after Cyber Monday.</LI>
            </ul>

            {/* CTAs */}
            <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
              <CTA href={BOOK_URL} primary>
                Book in November • Pay at Your Visit
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

            <div className="mt-2 text-[11px] text-neutral-400 max-w-xl">
              Mention the <strong>“Black Friday Jeuveau Buy 2, Get 1 Free”</strong> deal at booking. Limited quantities may sell out.
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------- */}
      {/* HOW IT WORKS + WHY 1 APPOINTMENT */}
      {/* -------------------------------------- */}
      <section className="relative bg-neutral-50 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 sm:gap-7 items-stretch">

          <div className="lg:col-span-6">
            <Card title="How Your Jeuveau Deal Works">
              <ul className="space-y-2 text-neutral-700 text-sm sm:text-[15px]">
                <Bullet>Look of all 3 Jeuveau areas for the price of 2.</Bullet>
                <Bullet>Up to 64 units included for $488.</Bullet>
                <Bullet>Book in November or buy up to 4 to use through 2026.</Bullet>
                <Bullet>Use at either RELUXE location.</Bullet>
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card title="Why We Use All Units in One Visit">
              <ul className="space-y-2 text-neutral-700 text-sm sm:text-[15px]">
                <Bullet>
                  Shows us how YOUR facial muscles respond so we find your correct dose.
                </Bullet>
                <Bullet>Prevents under-treating or stretched-out results.</Bullet>
                <Bullet>Ensures forehead, 11s, and crow’s feet stay balanced.</Bullet>
              </ul>
            </Card>
          </div>

        </div>

        <div className="mt-7 text-center px-4">
          <CTA href={DEALS_URL} primary>
            Claim Black Friday Jeuveau • Book or Buy Now
          </CTA>
          <p className="mt-2 text-xs text-neutral-500">Once Black Friday ends, this pricing disappears.</p>
        </div>
      </section>

      {/* -------------------------------------- */}
      {/* EXPECTATION STEPS */}
      {/* -------------------------------------- */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">What to Expect</h2>
          <p className="mt-3 text-neutral-600">Same RELUXE visit — just a better price.</p>
        </div>

        <div className="mt-7 grid gap-4 sm:gap-6 sm:grid-cols-3">
          <StepCard
            step="Day 0"
            title="Consult + Treatment"
            copy="We map your forehead, 11s, and crow’s feet and use your Jeuveau package in one visit (~30 min)."
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

      {/* -------------------------------------- */}
      {/* FAQs */}
      {/* -------------------------------------- */}
      <section id="faq" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
          Black Friday Jeuveau — FAQ
        </h3>

        <div className="mt-7 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
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
          <FaqItem q="Which areas are included?" a="Forehead, 11s, and crow’s feet." />
          <FaqItem q="How many packages can I buy?" a="Up to 4 per person to use through 2026." />
        </div>

        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Jeuveau
          </CTA>
        </div>
      </section>

      {/* -------------------------------------- */}
      {/* FINAL CTA */}
      {/* -------------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 p-[1px]">
            <div className="rounded-3xl bg-neutral-950 px-6 sm:px-8 py-10 sm:py-12 text-center">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Your Softest Jeuveau Result — Best Price of the Year
              </h4>
              <p className="mt-3 text-neutral-300 max-w-2xl mx-auto">
                Treat all 3 upper-face areas now — or lock in savings to use throughout 2026.
              </p>

              <div className="mt-6 sm:mt-8">
                <CTA href={BOOK_URL} primary>
                  Claim the Jeuveau Buy 2, Get 1 Free Deal
                </CTA>
                <p className="mt-2 text-[11px] text-neutral-400">Limited-time Black Friday pricing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------- */}
      {/* STICKY CTA MOBILE */}
      {/* -------------------------------------- */}
      {showStickyCta && (
        <div className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-24px)] sm:w-full max-w-md rounded-2xl bg-neutral-900/95 px-3 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Jeuveau • Buy 2 Get 1 Free</p>
              <p className="text-[11px] text-neutral-400">Book now or buy up to 4 for 2026.</p>
            </div>
            <a
              href={BOOK_URL}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-black active:scale-[.99]"
            >
              Book
            </a>
          </div>
        </div>
      )}
    </>
  )
}

/* ---------- Shared Components ---------- */

function CTA({ href, children, primary, dataAttr }) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] transition touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
  const styles = primary
    ? 'text-white w-full sm:w-auto bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900'
    : 'text-white/90 w-full sm:w-auto ring-1 ring-white/20 hover:bg-white/10'
  return (
    <a href={href} data-book-loc={dataAttr} className={`${base} ${styles} group`} rel="noopener">
      {children}
      {primary && <Arrow />}
    </a>
  )
}

function Card({ title, children }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h3>
      <div className="mt-3 sm:mt-4">{children}</div>
    </div>
  )
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-2 h-2 w-2 rounded-full bg-violet-600" />
      <span>{children}</span>
    </li>
  )
}

function LI({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-2 h-2 w-2 rounded-full bg-violet-400" />
      <span>{children}</span>
    </li>
  )
}

function StepCard({ step, title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 min-w-[86px] px-3 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-bold text-[11px] sm:text-xs tracking-tight flex items-center justify-center whitespace-nowrap">
          {step}
        </div>
        <h6 className="text-sm sm:text-base font-extrabold tracking-tight">{title}</h6>
      </div>
      <p className="mt-3 text-neutral-700 text-sm sm:text-base">{copy}</p>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group">
      <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 font-semibold flex items-center justify-between">
        <span className="text-sm sm:text-base">{q}</span>
        <svg
          className={`h-5 w-5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
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
      <div className="px-4 sm:px-6 pb-5 text-neutral-700 text-sm sm:text-base">{a}</div>
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
