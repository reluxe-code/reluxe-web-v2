// pages/men.js
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeaderTwo from '../components/header/header-2'

// --- Config ---
const BOOK_URL = '/book/'; // Change if you prefer a /book route

export default function MenPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Men’s Services | RELUXE Med Spa</title>
        <meta name="description" content="Men’s injectables, facials, HydraFacial/Glo2Facial, laser hair removal (back, chest, neck), and massage at RELUXE. Discreet, natural results that boost confidence." />
        <meta property="og:title" content="Men’s Services at RELUXE" />
        <meta property="og:description" content="The secret to looking sharp and aging gracefully. Injectables, facials, laser hair removal, and massage—tailored for men." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxe.med/men" />
        <meta property="og:image" content="/images/men/og-men.jpg" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 text-white">
              <p className="text-xs tracking-widest uppercase text-neutral-400">RELUXE • Men’s Services</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Look Sharp. Feel Confident. Age Gracefully.</h1>
              <p className="mt-4 text-neutral-300 text-lg leading-relaxed">
                Taking care of yourself is so 2025. At RELUXE, men get discreet, natural results that keep you looking like you—only refreshed. Your secret weapon? <strong>Healthy skin</strong>.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={BOOK_URL} className="group inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">
                  Book Now
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"/></svg>
                </a>
                <a href="#services" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition">Explore Services</a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-neutral-400">
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Subtle, natural results</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Provider-led plans</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Low-pressure consults</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img src="/images/men/facial2.jpg" alt="Men’s services at RELUXE" className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-xs text-neutral-200">Photos represent service categories available at RELUXE.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Popular for Men at RELUXE</h2>
          <p className="mt-3 text-neutral-600">Our most requested treatments for natural, discreet upgrades—tailored to men’s skin and goals.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Injectables */}
          <ServiceCard
            title="Injectables"
            subtitle="Botox • Dysport • Daxxify • Jeuveau"
            copy="Soften forehead lines and crow’s feet without looking frozen. Fast, subtle, confidence-boosting."
            image="/images/men/tox2.jpg"
            href="/book/tox/"
          />
          {/* Facials */}
          <ServiceCard
            title="Facials"
            subtitle="Glo2Facial • HydraFacial • Signature"
            copy="Deep clean, exfoliate, and rehydrate. The post‑gym, post‑travel reset your skin deserves."
            image="/images/men/facial.jpg"
            href="/book/facials/"
          />
          {/* Laser Hair */}
          <ServiceCard
            title="Laser Hair Removal"
            subtitle="Back • Chest • Neck"
            copy="Ditch razor burn and upkeep. Smooth, long‑term results where you want them most."
            image="/images/men/lhr.jpg"
            href="/book/lhr/"
          />
          {/* Massage */}
          <ServiceCard
            title="Massage Therapy"
            subtitle="Recovery • Stress Relief"
            copy="Therapeutic modalities to loosen tightness, improve mobility, and lower stress."
            image="/images/men/massage.jpg"
            href="/book/massage/"
          />
        </div>

        <div className="mt-10 text-center">
          <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">
            Book Men’s Services
          </a>
        </div>
      </section>

      {/* Transformation / Social Proof */}
      <section className="relative bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-2xl font-extrabold tracking-tight">Discreet, Natural Transformations</h3>
                <p className="mt-3 text-neutral-700">Our best transformations for men look like you—just more rested, sharper, and younger. We plan conservatively, treat precisely, and keep it low‑key.</p>
                <ul className="mt-4 space-y-2 text-neutral-700">
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-violet-600" /> Subtle, never overdone</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-violet-600" /> Tailored to men’s skin & structure</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-violet-600" /> Provider‑led treatment plans</li>
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">Book a Consult</a>
                  <a href="#faq" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-neutral-800 ring-1 ring-neutral-200 hover:bg-neutral-100 transition">Common Questions</a>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative grid grid-cols-2 gap-4">
                <img src="/images/men/tox.jpg" alt="Men’s injectable results" className="rounded-2xl border border-neutral-200 shadow-sm" />
                <img src="/images/men/face.jpg" alt="HydraFacial / Glo2Facial for men" className="rounded-2xl border border-neutral-200 shadow-sm" />
                <img src="/images/men/lhr.jpg" alt="Laser hair removal for men" className="rounded-2xl border border-neutral-200 shadow-sm" />
                <img src="/images/men/massage.jpg" alt="Massage therapy for men" className="rounded-2xl border border-neutral-200 shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Pillars */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-3xl font-extrabold tracking-tight">Why Men Choose RELUXE</h3>
          <p className="mt-3 text-neutral-600">Because confidence looks good on you.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Pillar title="Confidence, Upgraded" copy="Show up sharper in every room—boardroom, gym, and date night—with results that look like you, only better." />
          <Pillar title="Future‑Proof Your Skin" copy="Proactive care slows visible aging. Build a routine that works as hard as you do." />
          <Pillar title="Low‑Pressure, High‑Expertise" copy="We educate first, recommend second, and only treat when it serves your goals." />
        </div>
        <div className="mt-10 text-center">
          <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">Start My Plan</a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative bg-neutral-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">Men’s FAQs</h4>
          <div className="mt-8 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
            <FaqItem q="Will I look ‘done’ after injectables?" a="No. Our approach is conservative and anatomy‑aware. Expect subtle softening that keeps your expressions natural." />
            <FaqItem q="What facial is best for men?" a="HydraFacial or Glo2Facial are great monthly resets—deep cleanse, exfoliation, and hydration tailored to your skin." />
            <FaqItem q="Does laser hair removal hurt?" a="Most describe it as quick snaps with manageable discomfort. Back, chest, and neck are popular for long‑term convenience." />
            <FaqItem q="I’m new—where do I start?" a="Book a low‑pressure consult. We’ll review goals, map a plan, and start with basics that deliver noticeable wins." />
          </div>
          <div className="mt-8 text-center">
            <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">Book a Men’s Consult</a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 p-[1px]">
            <div className="rounded-3xl bg-neutral-950 px-8 py-12 text-center">
              <h5 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Ready to Look Sharp & Feel Your Best?</h5>
              <p className="mt-3 text-neutral-300 max-w-2xl mx-auto">Your personal plan might include Botox/Jeuveau, Glo2/HydraFacial, signature facials, laser hair removal, and massage—tailored to you.</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition">Book Now</a>
                <a href="#services" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-black/60 ring-1 ring-white/10 hover:bg-black/70 transition">See Men’s Services</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      {showStickyCta && (
        <div className="fixed inset-x-0 bottom-3 z-50 mx-auto w-full max-w-md rounded-2xl bg-neutral-900/95 px-3 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Book Men’s Services</p>
              <p className="text-[11px] text-neutral-400">Discreet, natural results</p>
            </div>
            <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-black">Book</a>
          </div>
        </div>
      )}
    </>
  )
}

// --- Components ---
function ServiceCard({ title, subtitle, copy, image, href }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]">
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-6">
        <h4 className="text-xl font-bold tracking-tight">{title}</h4>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        <p className="mt-3 text-neutral-700">{copy}</p>
        <div className="mt-5 flex items-center justify-between">
          <a href={href} className="text-violet-700 hover:text-violet-600 font-semibold">Book Now →</a>
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-500/20 ring-1 ring-violet-200" />
        </div>
      </div>
    </div>
  )
}

function Pillar({ title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-extrabold tracking-tight">{title}</h4>
      <p className="mt-2 text-neutral-700">{copy}</p>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group">
      <summary className="cursor-pointer list-none px-6 py-4 font-semibold flex items-center justify-between">
        <span>{q}</span>
        <svg className={`h-5 w-5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/></svg>
      </summary>
      <div className="px-6 pb-5 text-neutral-700">{a}</div>
    </details>
  )
}
