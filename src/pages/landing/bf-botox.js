// pages/landing/bf-botox.js
// Black Friday Botox Deal — Buy 2 Areas, Get 1 Free (up to 64 units)

import Head from 'next/head'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/tox'
const DEALS_URL = '/book/bf25-botox/'

export default function BotoxBlackFridayPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 280)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Black Friday Botox Deal — Buy 2 Areas, Get 1 Free | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Limited-time Black Friday Botox deal at RELUXE: Buy 2 areas, get 1 free for the look of 3 areas (up to 64 units) for $616. Book in November or buy up to 4 for 2026."
        />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta property="og:title" content="Black Friday Botox — Buy 2 Areas, Get 1 Free | RELUXE" />
        <meta
          property="og:description"
          content="Best Botox price of the year: Buy 2 areas, get 1 free (up to 64 units) when you treat forehead, 11s, and crow’s feet in a single appointment."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/landing/bf-botox" />
        <meta property="og:image" content="https://reluxemedspa.com/images/landing/bf-tox-og.jpg" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[320px] py-7 md:py-8">
          <div className="text-white max-w-3xl">
            <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">
              RELUXE • Carmel & Westfield
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Black Friday Botox: Buy 2 Areas, Get 1 Free
            </h1>
            <p className="mt-3 text-neutral-300 text-base sm:text-lg leading-relaxed">
              Our most popular Botox® deal of the year. Get the <strong>look of 3 areas</strong> for the price of 2 —
              forehead lines, frown lines (11s), and crow’s feet — for just <strong>$616</strong> (up to 64 units).
              Best time to lock in smooth, natural results.
            </p>
            <ul className="mt-3 space-y-2 text-neutral-300">
              <LI>Buy 2 tox areas, get the 3rd area free — up to 64 units of Botox for $616.</LI>
              <LI>Must be used in a <strong>single appointment</strong> so we can dose correctly and see your true result.</LI>
              <LI>Perfect for forehead lines, 11s, and crow’s feet — the classic “Botox look of 3.”</LI>
              <LI>Limited-time Black Friday / Cyber Monday pricing — <strong>best Botox deal of the year.</strong></LI>
            </ul>

            {/* CTAs */}
            <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
              <CTA href={BOOK_URL} primary>
                Book in November • Pay at Your Visit
              </CTA>
              <CTA href={DEALS_URL}>
                Not Due Yet? Buy Now &amp; Use Through 2026
              </CTA>
              <CTA href={BOOK_URL} dataAttr="westfield">
                Book Westfield
              </CTA>
              <CTA href={BOOK_URL} dataAttr="carmel">
                Book Carmel
              </CTA>
            </div>

            <div className="mt-2 text-[11px] text-neutral-400">
              Use by booking in November/early December, or <strong>buy up to 4 packages</strong> now to use at future
              visits through 2026.
            </div>
          </div>
        </div>
      </section>

      {/* How the deal works / Why 1 appointment */}
      <section className="relative bg-neutral-50 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-6">
            <Card title="How This Black Friday Botox Deal Works">
              <ul className="space-y-2 text-neutral-700">
                <Bullet>Buy the look of 3 tox areas (forehead, 11s, crow’s feet) for the price of 2.</Bullet>
                <Bullet>Up to 64 units of Botox are included for $616.</Bullet>
                <Bullet>Book in November and pay at your visit—no pre-payment required if you’re due now.</Bullet>
                <Bullet>Not due yet? Lock in pricing by purchasing up to 4 packages to use through 2026.</Bullet>
              </ul>
            </Card>
          </div>
          <div className="lg:col-span-6">
            <Card title="Why All Units Are Used in One Appointment">
              <ul className="space-y-2 text-neutral-700">
                <Bullet>
                  Using all units in a single visit lets your injector give you the <strong>right dose for your face</strong>,
                  instead of under-treating to stretch units.
                </Bullet>
                <Bullet>
                  You see how your muscles respond at a <strong>full, appropriate dose</strong>, which helps us fine-tune
                  future visits.
                </Bullet>
                <Bullet>
                  Keeps your result <strong>even and smooth</strong> across all three areas instead of patchy or staggered.
                </Bullet>
              </ul>
            </Card>
          </div>
        </div>
        <div className="mt-8 text-center px-4">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Botox • Book or Buy Now
          </CTA>
          <p className="mt-2 text-xs text-neutral-500">
            Good for Botox at either RELUXE location. Limited quantities; once Black Friday pricing is gone, it’s gone.
          </p>
        </div>
      </section>

      {/* What to Expect */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">What to Expect</h2>
          <p className="mt-3 text-neutral-600">
            Simple visit. Full-tox result across your three most expressive areas.
          </p>
        </div>
        <div className="mt-7 grid gap-4 sm:gap-6 sm:grid-cols-3">
          <StepCard
            step="Day 0"
            title="Consult + Treatment"
            copy="We map your forehead, 11s, and crow’s feet and use your Black Friday package in one visit (~30 minutes)."
          />
          <StepCard
            step="Days 2–7"
            title="Lines Soften"
            copy="Muscles relax, lines smooth, and makeup sits more evenly on the skin."
          />
          <StepCard
            step="Week 2+"
            title="Peak Result"
            copy="Enjoy a refreshed, smoothed look for ~3–4 months. Then decide if you want to use another locked-in deal."
          />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Book Your Black Friday Botox Spot
          </CTA>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
          Black Friday Botox Deal — FAQ
        </h3>
        <div className="mt-7 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
          <FaqItem
            q="Do I have to pre-pay to get the deal?"
            a="If you’re due now, you can simply book in November, mention the Black Friday Botox deal, and pay at your visit. If you’re not due yet, you can pre-purchase up to 4 packages now to use through 2026."
          />
          <FaqItem
            q="Why do all units have to be used in one appointment?"
            a="Because Botox dosing is customized to your anatomy, using all units in one visit lets us treat you properly instead of stretching units between visits. You get a more accurate result and we can fine-tune future dosing from there."
          />
          <FaqItem
            q="Which areas are included?"
            a="This special is designed for the classic “look of 3”: forehead lines, frown lines (11s), and crow’s feet. Your injector will confirm that this is appropriate based on your goals and anatomy."
          />
          <FaqItem
            q="Can I share this deal with someone else?"
            a="No — each package is for a single patient. That helps us keep dosing safe, consistent, and tied to your chart."
          />
          <FaqItem
            q="How many can I buy?"
            a="You may purchase up to 4 packages per person at this Black Friday price. They can be used at future visits through 2026."
          />
          <FaqItem
            q="Is this really the best Botox pricing of the year?"
            a="Yes. Our Black Friday / Cyber Monday tox specials are the best pricing we offer all year and are only available for a limited time or while quantities last."
          />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Botox • Book or Buy Now
          </CTA>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 p-[1px]">
            <div className="rounded-3xl bg-neutral-950 px-6 sm:px-8 py-10 sm:py-12 text-center">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Your Three Core Botox Areas, One Black Friday Price
              </h4>
              <p className="mt-3 text-neutral-300 max-w-2xl mx-auto">
                Smooth forehead lines, 11s, and crow’s feet with our best Botox deal of the year. Book in November or
                buy now to use through 2026.
              </p>
              <div className="mt-6 sm:mt-8">
                <CTA href={BOOK_URL} primary>
                  Claim the Buy 2, Get 1 Free Botox Deal
                </CTA>
                <p className="mt-2 text-[11px] text-neutral-400">
                  Limited-time Black Friday / Cyber Monday offer. Pricing and availability will not last.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      {showStickyCta && (
        <div className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-24px)] sm:w-full max-w-md rounded-2xl bg-neutral-900/95 px-3 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Black Friday Botox • Buy 2 Areas, Get 1 Free</p>
              <p className="text-[11px] text-neutral-400">Book now or buy up to 4 for 2026.</p>
            </div>
            <a
              href={BOOK_URL}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-black active:scale-[.99] touch-manipulation"
            >
              Book
            </a>
          </div>
        </div>
      )}
    </>
  )
}

/* ---------- Shared Components (same as Jeuveau intro) ---------- */
function CTA({ href, children, primary, dataAttr }) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] touch-manipulation transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
  const styles = primary
    ? 'text-white w-full sm:w-auto bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900'
    : 'text-white/90 w-full sm:w-auto ring-1 ring-white/20 hover:bg-white/10'
  return (
    <a
      href={href}
      data-book-loc={dataAttr}
      className={`${base} ${styles} group`}
      rel="noopener"
    >
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
