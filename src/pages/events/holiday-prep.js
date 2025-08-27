import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/'

export default function HolidayPrepPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Holiday Party & NYE Glow | Carmel & Westfield | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Holiday party & NYE prep in Carmel & Westfield. Tox/filler timing, HydraFacial®, dermaplane, peels, body contouring, and stress-relief massage for camera-ready glow."
        />
        <link rel="canonical" href="https://reluxemedspa.com/events/holiday-prep" />
        <meta property="og:title" content="Holiday Party & NYE Glow | RELUXE Med Spa" />
        <meta property="og:description" content="Smart timing + no-downtime glow for holiday photos, office parties, and New Year’s Eve." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/treatments/holiday.jpg" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-white">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-xs tracking-widest uppercase text-neutral-400">RELUXE • Holiday & NYE</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
                Holiday Party &amp; NYE Glow — Carmel &amp; Westfield
              </h1>
              <p className="mt-4 text-neutral-300 text-lg leading-relaxed">
                Office parties, family photos, New Year’s Eve—get a radiant, makeup-ready finish with treatments timed
                to avoid downtime. We’ll map the perfect plan to your calendar.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={BOOK_URL}
                  className="group inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
                >
                  Book Holiday Glow
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"/></svg>
                </a>
                <a
                  href="#timing"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition"
                >
                  See Timing Guide
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-neutral-400">
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Photo-friendly glow</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Downtime-aware</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Makeup-ready finish</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img src="/images/treatments/holiday.jpg" alt="Holiday & NYE glow Carmel Westfield" className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-xs text-neutral-200">Images represent service categories available at RELUXE.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Local SEO */}
          <div className="mt-6 text-sm text-neutral-400">
            Serving <strong>Carmel</strong>, <strong>Westfield</strong>, Zionsville, and North Indianapolis.
          </div>
        </div>
      </section>

      {/* Timing Guide */}
      <section id="timing" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Stress-Free Holiday Timing</h2>
          <p className="mt-3 text-neutral-600">
            We’ll personalize recommendations to your event schedule. Here’s a proven framework that keeps skin calm and luminous.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimingCard
            when="4–6 Weeks Out"
            items={[
              'Plan neurotoxins (Botox®, Dysport®, Jeuveau®, Daxxify®) to settle naturally',
              'Consider filler balance (lips/cheeks/chin/jawline) ahead of photo season',
              'Begin/continue series: SkinPen® or laser if runway allows',
            ]}
          />
          <TimingCard
            when="2–3 Weeks Out"
            items={[
              'HydraFacial® or Glo2Facial® for clarity & hydration',
              'Light peel (case-by-case) for bright tone',
              'EvolveX body contouring session (tone/tighten)',
            ]}
          />
          <TimingCard
            when="3–5 Days Out"
            items={[
              'Dermaplane + Signature facial for a smooth, makeup-ready canvas',
              'Hydrinity hydration boost for lit-from-within glow',
              'Tidy brows / optional lash lift-tint',
            ]}
          />
          <TimingCard
            when="Day Of / Night Of"
            items={[
              'Keep skincare simple—cleanse, moisturize, SPF (day) / balm (night)',
              'Avoid new actives or harsh exfoliation',
              'Pack touch-ups: mineral SPF, blot papers, lip balm',
            ]}
          />
        </div>

        <div className="mt-10 text-center">
          <a
            href={BOOK_URL}
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
          >
            Start My Holiday Plan
          </a>
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" className="relative bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">High-Impact Holiday Services</h2>
            <p className="mt-3 text-neutral-600">Glowy skin, smooth texture, and stress-relief—all timed to your events.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="HydraFacial® / Glo2Facial®"
              subtitle="No-downtime glow"
              copy="Fast clarity and hydration that makeup loves—ideal 1–2 weeks before your party."
              image="/images/treatments/facials.jpg"
              href="/book/facials/"
            />
            <ServiceCard
              title="Injectables"
              subtitle="Botox • Dysport • Daxxify • Jeuveau"
              copy="Refine lines while keeping expressions natural—plan 3–4+ weeks out."
              image="/images/treatments/injectables.jpg"
              href="/book/tox/"
            />
            <ServiceCard
              title="Dermaplane + Light Peel"
              subtitle="Makeup-ready finish"
              copy="Sweep away dullness and peach fuzz for a smooth, even canvas—time ~3–5 days out."
              image="/images/treatments/dermaplane.jpg"
              href="/book/facials/"
            />
            <ServiceCard
              title="SkinPen® Microneedling"
              subtitle="Texture & pores"
              copy="If you’ve got runway, refine texture and scars—consider a series 4–6+ weeks before."
              image="/images/treatments/skinpen.jpg"
              href="/book/microneedling/"
            />
            <ServiceCard
              title="Laser & RF"
              subtitle="Opus • ClearLift • IPL"
              copy="Tone, tighten, and refine with appropriate healing windows around events."
              image="/images/treatments/laser.jpg"
              href="/book/laser/"
            />
            <ServiceCard
              title="Massage Therapy"
              subtitle="Stress relief"
              copy="Loosen tightness and reset your nervous system so you glow from the inside out."
              image="/images/treatments/massage.jpg"
              href="/book/massage/"
            />
          </div>

          <div className="mt-10 text-center">
            <a
              href={BOOK_URL}
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
            >
              Book Holiday Services
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">Holiday & NYE FAQs</h4>
        <div className="mt-8 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
          <FaqItem
            q="How soon before a holiday party should I book injectables?"
            a="Plan neurotoxins ~3–4 weeks before so results are settled and natural. Filler timing depends on the area—book a consult early for a smart schedule."
          />
          <FaqItem
            q="What’s safe last-minute?"
            a="Dermaplane + signature facial + hydration boost is our go-to within 3–5 days. Avoid aggressive peels or new active skincare."
          />
          <FaqItem
            q="Do you offer gift cards or group options?"
            a="Yes—digital gift cards and small-group glow sessions are popular for teams, families, and friends."
          />
          <FaqItem
            q="I’m prone to redness—how do we avoid irritation?"
            a="We’ll tailor gentle, non-sensitizing treatments and recommend redness-calming skincare with a simple week-of routine."
          />
        </div>

        <div className="mt-8 text-center">
          <a
            href={BOOK_URL}
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
          >
            Book a Carmel/Westfield Consult
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 p-[1px]">
            <div className="rounded-3xl bg-neutral-950 px-8 py-12 text-center">
              <h5 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Ready for Holiday Photos & NYE?
              </h5>
              <p className="mt-3 text-neutral-300 max-w-2xl mx-auto">
                Carmel & Westfield’s trusted med spa for festive, photo-ready glow with smart, stress-free timing.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition">Book Now</a>
                <a href="#services" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-black/60 ring-1 ring-white/10 hover:bg-black/70 transition">Explore Services</a>
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
              <p className="text-sm font-semibold text-white">Book Holiday Glow</p>
              <p className="text-[11px] text-neutral-400">Carmel & Westfield</p>
            </div>
            <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-black">
              Book
            </a>
          </div>
        </div>
      )}
    </>
  )
}

// --- Components ---
function TimingCard({ when, items }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]">
      <div className="p-6">
        <h3 className="text-xl font-bold tracking-tight">{when}</h3>
        <ul className="mt-3 list-disc pl-6 space-y-1 text-neutral-700">
          {items.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
    </div>
  )
}

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
