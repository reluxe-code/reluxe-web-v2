// pages/landing/bf-daxxify-b2g1.js
// Black Friday Daxxify Deal — Buy 2 Areas, Get 1 Free (up to 120 units)

import Head from 'next/head'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/tox'
const DEALS_URL = '/book/bf25-daxxify/'

export default function DaxxifyBlackFridayPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 280)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Black Friday Daxxify — Buy 2 Areas, Get 1 Free | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Black Friday Daxxify deal at RELUXE: Buy 2 areas, get 1 free (up to 120 units) for $560. Book in November or buy up to 4 to use through 2026."
        />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta property="og:title" content="Black Friday Daxxify — Buy 2 Areas, Get 1 Free | RELUXE" />
        <meta
          property="og:description"
          content="Try Daxxify with our best pricing of the year. Treat forehead, 11s, and crow’s feet in a single, full-dose visit."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/landing/bf-daxxify-b2g1" />
        <meta property="og:image" content="/images/landing/bf-tox-og.jpg" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(56,189,248,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[320px] py-7 md:py-8">
          <div className="text-white max-w-3xl">
            <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">
              RELUXE • Carmel &amp; Westfield
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Black Friday Daxxify: Buy 2 Areas, Get 1 Free
            </h1>
            <p className="mt-3 text-neutral-300 text-base sm:text-lg leading-relaxed">
              Curious about Daxxify™ and its longer-lasting potential? This limited Black Friday offer gives you the{' '}
              <strong>look of 3 areas for the price of 2</strong> — forehead, 11s, and crow’s feet — for just{' '}
              <strong>$560</strong> (up to 120 units).
            </p>
            <ul className="mt-3 space-y-2 text-neutral-300">
              <LI>Buy 2 Daxxify areas, get the 3rd free — up to 120 units for $560.</LI>
              <LI>Ideal for forehead lines, frown lines (11s), and crow’s feet in one full-dose visit.</LI>
              <LI>
                All units are used in <strong>one appointment</strong> so you can see how Daxxify performs at the right
                dose for your muscles.
              </LI>
              <LI>
                Book in November and pay at your visit, or <strong>buy up to 4 packages now</strong> to use through
                2026.
              </LI>
              <LI>Our best Daxxify pricing of the year. Once the Black Friday window closes, this deal is gone.</LI>
            </ul>

            {/* CTAs */}
            <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
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

            <div className="mt-2 text-[11px] text-neutral-400">
              Mention the <strong>“Black Friday Daxxify Buy 2, Get 1 Free”</strong> deal in your booking notes. Limited
              supply and appointment spots.
            </div>
          </div>
        </div>
      </section>

      {/* How it works / Why 1 appointment */}
      <section className="relative bg-neutral-50 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-6">
            <Card title="Your Daxxify Black Friday Deal">
              <ul className="space-y-2 text-neutral-700">
                <Bullet>Look of 3 areas with Daxxify (forehead, 11s, crow’s feet) for the price of 2.</Bullet>
                <Bullet>Up to 120 units for $560.</Bullet>
                <Bullet>
                  Book in November for treatment now or pre-purchase up to 4 packages to use later through 2026.
                </Bullet>
                <Bullet>Available at both RELUXE locations with Daxxify-trained injectors.</Bullet>
              </ul>
            </Card>
          </div>
          <div className="lg:col-span-6">
            <Card title="Why All Units Are Used in One Visit">
              <ul className="space-y-2 text-neutral-700">
                <Bullet>
                  Daxxify dosing is tailored to your anatomy. A full, single-visit treatment tells us how your muscles
                  actually respond.
                </Bullet>
                <Bullet>
                  Splitting units between visits makes it hard to judge effect and can lead to under-treating key areas.
                </Bullet>
                <Bullet>
                  Treating all 3 areas at once creates a <strong>harmonized, refreshed look</strong> instead of chasing
                  lines one spot at a time.
                </Bullet>
              </ul>
            </Card>
          </div>
        </div>
        <div className="mt-8 text-center px-4">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Daxxify • Book or Buy Now
          </CTA>
          <p className="mt-2 text-xs text-neutral-500">
            Limited-time pricing only for Black Friday / Cyber Monday. Once it’s gone, Daxxify returns to standard
            rates.
          </p>
        </div>
      </section>

      {/* What to Expect */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">What to Expect</h2>
          <p className="mt-3 text-neutral-600">
            A Daxxify visit that feels like RELUXE — with extra-good Black Friday pricing.
          </p>
        </div>
        <div className="mt-7 grid gap-4 sm:gap-6 sm:grid-cols-3">
          <StepCard
            step="Day 0"
            title="Consult &amp; Daxxify Treatment"
            copy="We review your history, map forehead, 11s, and crow’s feet, and treat with your Black Friday Daxxify package."
          />
          <StepCard
            step="Days 2–7"
            title="Lines Begin to Soften"
            copy="You’ll notice expression lines softening and makeup sitting more smoothly as Daxxify takes effect."
          />
          <StepCard
            step="Weeks Ahead"
            title="Enjoy Your Result"
            copy="Daxxify can offer longer-lasting results for many patients compared to traditional tox. You and your injector can decide when to schedule your next visit."
          />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Book Your Daxxify Black Friday Spot
          </CTA>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
          Black Friday Daxxify Deal — FAQ
        </h3>
        <div className="mt-7 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
          <FaqItem
            q="What is Daxxify?"
            a="Daxxify is a neuromodulator in the same treatment family as Botox, Jeuveau, Dysport, and others. Many patients choose it for its potential to last longer than traditional tox options. Your injector will review if it’s a good fit for you."
          />
          <FaqItem
            q="Do I have to pay now to get the deal?"
            a="If you’re ready now, you can simply book in November and pay at your visit. If you want to lock in Black Friday pricing for future visits, you can pre-purchase up to 4 Daxxify packages now to use through 2026."
          />
          <FaqItem
            q="Why do I need to use all units at once?"
            a="We want you to see how Daxxify performs at the right dose for your muscles. Splitting units between visits usually means under-treating each area and doesn’t give us a clear picture for future planning."
          />
          <FaqItem
            q="Which areas are best for this deal?"
            a="This Black Friday package is designed for forehead lines, frown lines (11s), and crow’s feet treated in the same appointment. Your injector will confirm the plan for your face."
          />
          <FaqItem
            q="How many Daxxify packages can I buy?"
            a="You may buy up to 4 Black Friday Daxxify packages per person to use through 2026, while supplies last."
          />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Daxxify • Book or Buy Now
          </CTA>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="relative rounded-3xl bg-gradient-to-br from-sky-500 via-violet-600 to-neutral-900 p-[1px]">
            <div className="rounded-3xl bg-neutral-950 px-6 sm:px-8 py-10 sm:py-12 text-center">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Your Daxxify Moment, Black Friday Pricing
              </h4>
              <p className="mt-3 text-neutral-300 max-w-2xl mx-auto">
                Experience Daxxify across your 3 key tox areas with our best pricing of the year. Book in November or
                lock in packages for 2026.
              </p>
              <div className="mt-6 sm:mt-8">
                <CTA href={BOOK_URL} primary>
                  Claim the Daxxify Buy 2, Get 1 Free Deal
                </CTA>
                <p className="mt-2 text-[11px] text-neutral-400">
                  Limited Black Friday / Cyber Monday offer. Once it’s over, Daxxify returns to regular pricing.
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
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Black Friday Daxxify • Buy 2 Areas, Get 1 Free</p>
              <p className="text-[11px] text-neutral-400">Book now or buy up to 4 for 2026.</p>
            </div>
            <a
              href={BOOK_URL}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-black active:scale-[.99] touch-manipulation"
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
    'inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] touch-manipulation transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
  const styles = primary
    ? 'text-white w-full sm:w-auto bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900'
    : 'text-white/90 w-full sm:w-auto ring-1 ring-white/20 hover:bg_white/10'.replace(
        '_',
        ''
      )
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
