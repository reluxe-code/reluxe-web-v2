// pages/landing/bf-dysport-b2g1.js
// Black Friday Dysport Deal — 150 Units for $450 (Buy 2 Areas, Get 1 Free)

import Head from 'next/head'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/tox'
const DEALS_URL = '/book/bf25-dysport/'

export default function DysportBlackFridayPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 280)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Black Friday Dysport — 150 Units for $450 | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Limited-time Black Friday Dysport deal: 150 units for $450 for the recommended dose across forehead, 11s, and crow’s feet. Book in November or buy up to 4 for 2026."
        />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta property="og:title" content="Black Friday Dysport — 150 Units for $450 | RELUXE" />
        <meta
          property="og:description"
          content="Best Dysport price of the year at RELUXE. 150 units designed for forehead, 11s, and crow’s feet in one appointment."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/landing/bf-dysport-b2g1" />
        <meta property="og:image" content="https://reluxemedspa.com/images/landing/bf-tox-og.jpg" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(34,197,94,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[320px] py-7 md:py-8">
          <div className="text-white max-w-3xl">
            <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">
              RELUXE • Carmel &amp; Westfield
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Black Friday Dysport: 150 Units for $450
            </h1>
            <p className="mt-3 text-neutral-300 text-base sm:text-lg leading-relaxed">
              Our biggest Dysport® special of the year. Get <strong>150 units for $450</strong> — the recommended
              dosing to treat forehead lines, frown lines (11s), and crow’s feet together in one appointment.
            </p>
            <ul className="mt-3 space-y-2 text-neutral-300">
              <LI>150 units of Dysport for $450 — up to a <strong>$675 value</strong>.</LI>
              <LI>
                Designed to cover the classic 3 tox areas: forehead, frown lines (11s), and crow’s feet in a single,
                balanced treatment.
              </LI>
              <LI>
                All units must be used in <strong>one appointment</strong> so our injectors can dose you correctly and
                you can see how Dysport truly works for your face.
              </LI>
              <LI>
                Book in November and pay at your visit, or <strong>buy up to 4 Dysport packages now</strong> and use
                them throughout 2026.
              </LI>
              <LI>Best Dysport pricing we offer all year. Once Black Friday/Cyber Monday ends, this deal disappears.</LI>
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
              Mention the <strong>“Black Friday Dysport 150 Units for $450”</strong> deal in your notes when you book.
              Limited quantities; may sell out.
            </div>
          </div>
        </div>
      </section>

      {/* How it works / Why one visit */}
      <section className="relative bg-neutral-50 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-6">
            <Card title="How Your Dysport Deal Works">
              <ul className="space-y-2 text-neutral-700">
                <Bullet>150 units of Dysport for $450 (up to $675 value).</Bullet>
                <Bullet>Customized to treat forehead, 11s, and crow’s feet together in one balanced plan.</Bullet>
                <Bullet>
                  Book in November and simply pay at your visit, or pre-purchase up to 4 packages to use at visits
                  through 2026.
                </Bullet>
                <Bullet>Use at either RELUXE location with our Dysport-experienced injectors.</Bullet>
              </ul>
            </Card>
          </div>
          <div className="lg:col-span-6">
            <Card title="Why We Use All 150 Units in One Appointment">
              <ul className="space-y-2 text-neutral-700">
                <Bullet>
                  Splitting units between visits usually leads to under-treating and doesn’t show the true Dysport
                  effect.
                </Bullet>
                <Bullet>
                  Using the full 150-unit package at once lets us deliver a <strong>proper, proportional dose</strong>{' '}
                  across all 3 areas.
                </Bullet>
                <Bullet>
                  You and your injector can clearly see how your muscles respond, which helps dial in future
                  maintenance.
                </Bullet>
              </ul>
            </Card>
          </div>
        </div>
        <div className="mt-8 text-center px-4">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Dysport • Book or Buy Now
          </CTA>
          <p className="mt-2 text-xs text-neutral-500">
            This is our best Dysport pricing of the year and is only available for a short Black Friday / Cyber Monday
            window.
          </p>
        </div>
      </section>

      {/* What to Expect */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">What to Expect</h2>
          <p className="mt-3 text-neutral-600">Smooth, natural Dysport result across your 3 most expressive areas.</p>
        </div>
        <div className="mt-7 grid gap-4 sm:gap-6 sm:grid-cols-3">
          <StepCard
            step="Day 0"
            title="Consult + Map"
            copy="We review your goals, map forehead, 11s, and crow’s feet, and use your Dysport package in one visit."
          />
          <StepCard
            step="Days 2–5"
            title="Dysport Kicks In"
            copy="Muscles start to soften and lines appear smoother, especially when you animate."
          />
          <StepCard
            step="Week 2+"
            title="Full Result"
            copy="Enjoy a refreshed, smoothed look for ~3–4 months, then decide if you want to use another locked-in deal."
          />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Book Your Black Friday Dysport Spot
          </CTA>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
          Black Friday Dysport Deal — FAQ
        </h3>
        <div className="mt-7 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
          <FaqItem
            q="Is 150 units a lot?"
            a="Dysport units are measured differently than Botox or Jeuveau units. 150 units is a common, recommended dose to treat forehead lines, frown lines (11s), and crow’s feet together in one appointment."
          />
          <FaqItem
            q="Do I have to pay up front?"
            a="No. If you’re ready for tox now, you can simply book in November and pay at your visit. If you want to lock in pricing for later, you can pre-purchase up to 4 Dysport packages now and use them through 2026."
          />
          <FaqItem
            q="Why can’t I split my units between visits?"
            a="Because we want you to see what the right Dysport dose looks like for you. Splitting units often means under-treating each area and makes it harder to fine-tune future dosing."
          />
          <FaqItem
            q="Which areas can I use this on?"
            a="This package is designed for forehead, frown lines (11s), and crow’s feet. Your injector will confirm what’s medically appropriate at your consult."
          />
          <FaqItem
            q="How many Dysport Black Friday packages can I buy?"
            a="You may purchase up to 4 packages per person to use through 2026, while supplies last."
          />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Dysport • Book or Buy Now
          </CTA>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500 via-violet-600 to-neutral-900 p-[1px]">
            <div className="rounded-3xl bg-neutral-950 px-6 sm:px-8 py-10 sm:py-12 text-center">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Best Dysport Price You’ll See All Year
              </h4>
              <p className="mt-3 text-neutral-300 max-w-2xl mx-auto">
                150 units for $450, mapped to your most expressive areas. Book now for November or lock in up to 4
                packages for 2026.
              </p>
              <div className="mt-6 sm:mt-8">
                <CTA href={BOOK_URL} primary>
                  Claim the Dysport 150 Units for $450 Deal
                </CTA>
                <p className="mt-2 text-[11px] text-neutral-400">
                  Black Friday / Cyber Monday only. Once it’s gone, Dysport returns to standard pricing.
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
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Black Friday Dysport • 150 Units for $450</p>
              <p className="text-[11px] text-neutral-400">Book now or buy up to 4 for 2026.</p>
            </div>
            <a
              href={BOOK_URL}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-black active:scale-[.99] touch-manipulation"
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
