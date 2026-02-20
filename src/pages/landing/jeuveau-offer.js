// pages/landing/jeuveau-intro.js
// Jeuveau Intro Offer — 50 Units for $360 (Evolus-subsidized trial)
// Mobile-first: stacked CTAs, comfy spacing, sticky bottom CTA

import Head from 'next/head'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/tox' // single booking route

export default function JeuveauIntroPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 280)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Jeuveau® Intro Offer — 50 Units for $360 | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Try Jeuveau® like Botox®: 50 units for $360 with our Evolus-subsidized intro offer. Soft, natural results. Book and select “First-time Jeuveau Intro Offer.”"
        />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta property="og:title" content="Jeuveau® Intro — 50 Units for $360 | RELUXE" />
        <meta
          property="og:description"
          content="Low-risk way to try Jeuveau®—our most natural-looking tox. Education first, one simple step to book."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/landing/jeuveau-intro" />
        <meta property="og:image" content="https://reluxemedspa.com/images/landing/jeuveau-og.jpg" />
      </Head>

      <HeaderTwo />

      {/* Hero (short, image-free, SMS-friendly) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[320px] py-7 md:py-8">
          <div className="text-white max-w-3xl">
            <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">RELUXE • Westfield & Carmel</p>
            <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Try Jeuveau® for $360 — 50 Units
            </h1>
            <p className="mt-3 text-neutral-300 text-base sm:text-lg leading-relaxed">
              Curious how Jeuveau compares to Botox? This <strong>introductory offer</strong> lets you try our most natural-looking tox with <strong>little risk</strong>.
              Same treatment class as Botox®—soft, smooth results while keeping your expressions.
            </p>
            <ul className="mt-3 space-y-2 text-neutral-300">
              <LI>50 units for just <strong>$360</strong> (limited first-time offer)</LI>
              <LI>Targets forehead lines, frown lines (11s), & crow’s feet</LI>
              <LI>Performed by RELUXE’s expert injectors</LI>
            </ul>

            {/* CTAs: stack on mobile, big tap targets */}
            <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-10px sm:gap-3">
              <CTA href={BOOK_URL} primary>
                Book Jeuveau Intro • Select “First-time Offer”
              </CTA>
              <CTA href={BOOK_URL} dataAttr="westfield">
                Book Westfield
              </CTA>
              <CTA href={BOOK_URL} dataAttr="carmel">
                Book Carmel
              </CTA>
            </div>

            <div className="mt-2 text-[11px] text-neutral-400">
              At booking, choose <strong>“First-time Jeuveau Intro Offer”</strong> to receive this pricing.
            </div>
          </div>
        </div>
      </section>

      {/* What It Is vs Botox */}
      <section className="relative bg-neutral-50 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-6">
            <Card title="What is Jeuveau? (Like Botox®)">
              <ul className="space-y-2 text-neutral-700">
                <Bullet>Jeuveau is a neuromodulator—same treatment class as Botox®.</Bullet>
                <Bullet>Relaxes tiny facial muscles that crease the skin, softening lines.</Bullet>
                <Bullet>Designed for a <strong>soft, natural look</strong>—movement with fewer lines.</Bullet>
              </ul>
            </Card>
          </div>
          <div className="lg:col-span-6">
            <Card title="Why Try It with This Intro Offer?">
              <ul className="space-y-2 text-neutral-700">
                <Bullet><strong>Evolus subsidizes</strong> your first visit so you can try Jeuveau with low risk.</Bullet>
                <Bullet>Great for forehead lines, 11s, and crow’s feet—new or returning patients.</Bullet>
                <Bullet>RELUXE injectors use anatomy-aware, light-touch dosing.</Bullet>
              </ul>
            </Card>
          </div>
        </div>
        <div className="mt-8 text-center px-4">
          <CTA href={BOOK_URL} primary>
            Book Jeuveau Intro • Select “First-time Offer”
          </CTA>
          <p className="mt-2 text-xs text-neutral-500">Choose <strong>“First-time Jeuveau Intro Offer”</strong> after you tap Book.</p>
        </div>
      </section>

      {/* Before & After */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">Before & After</h2>
          <p className="mt-3 text-neutral-600">Real RELUXE patients. Soft, smooth foreheads—expression intact.</p>
        </div>
        <div className="mt-7 grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3">
          <BA src="/images/results/tox/injector.hannah - 25.png" />
          <BA src="/images/results/tox/injector.krista - 01.png" />
          <BA src="/images/results/tox/injector.hannah - 27.png" />
        </div>
      </section>

      {/* What to Expect */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">What to Expect</h3>
          <p className="mt-3 text-neutral-600">Simple visit. Natural result.</p>
        </div>
        <div className="mt-7 grid gap-4 sm:gap-6 sm:grid-cols-3">
          <StepCard step="Day 0" title="Quick Visit" copy="Full Consultation + treatment in ~30 minutes. Minimal downtime.!" />
          <StepCard step="Days 2–7" title="Lines Soften" copy="Forehead, 11s, crow’s feet relax while expressions stay you." />
          <StepCard step="Week 2+" title="Full Result" copy="Enjoy a smooth, refreshed look for ~3+ months." />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Book Jeuveau Intro • Select “First-time Offer”
          </CTA>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">Jeuveau Intro FAQ</h4>
        <div className="mt-7 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
          <FaqItem
            q="Is Jeuveau the same as Botox?"
            a="They’re in the same treatment class (neuromodulators). Both relax tiny muscles that create lines. Many patients choose Jeuveau for a soft, natural look without heaviness."
          />
          <FaqItem
            q="Who qualifies for the $360 intro?"
            a="New Jeuveau patients using our Evolus-subsidized offer. At booking, select “First-time Jeuveau Intro Offer” to apply it."
          />
          <FaqItem
            q="How many units do I need?"
            a="Everyone’s anatomy is different. This intro provides 50 units; your injector will map dosing for your goals. Additional units can be discussed if appropriate."
          />
          <FaqItem
            q="How long does it last?"
            a="Most patients enjoy results ~3–4 months. Consistent maintenance helps results look even and last smoothly over time."
          />
          <FaqItem
            q="Will I look frozen?"
            a="No. RELUXE injectors use light-touch, anatomy-aware dosing for movement with fewer lines—natural, not stiff."
          />
          <FaqItem
            q="How do I redeem the offer?"
            a="Tap Book and choose “First-time Jeuveau Intro Offer.” We’ll confirm eligibility at your visit."
          />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Book Jeuveau Intro • Select “First-time Offer”
          </CTA>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 p-[1px]">
            <div className="rounded-3xl bg-neutral-950 px-6 sm:px-8 py-10 sm:py-12 text-center">
              <h5 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">Your Face, Just Smoother</h5>
              <p className="mt-3 text-neutral-300 max-w-2xl mx-auto">
                A low-risk way to try Jeuveau with RELUXE’s expert injectors. One simple step to book.
              </p>
              <div className="mt-6 sm:mt-8">
                <CTA href={BOOK_URL}>Book Jeuveau Intro • Select “First-time Offer”</CTA>
                <p className="mt-2 text-[11px] text-neutral-400">Choose <strong>“First-time Jeuveau Intro Offer”</strong> after you tap Book.</p>
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
              <p className="text-sm font-semibold text-white">Jeuveau Intro • $360</p>
              <p className="text-[11px] text-neutral-400">Select “First-time Jeuveau Intro Offer”</p>
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

/* ---------- Components ---------- */
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
      className={`${base} ${styles}`}
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
        {/* Wider, no-wrap pill for mobile */}
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
        <svg className={`h-5 w-5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/></svg>
      </summary>
      <div className="px-4 sm:px-6 pb-5 text-neutral-700 text-sm sm:text-base">{a}</div>
    </details>
  )
}
function BA({ src }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <img
        src={src}
        alt="Jeuveau before and after"
        className="w-full h-auto object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
function Arrow() {
  return (
    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"/></svg>
  )
}
