// pages/wedding.js
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeaderTwo from '../components/header/header-2'

// --- Config ---
const BOOK_URL = '/book/' // Update if you have a different booking route

export default function WeddingPrepPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Wedding Prep in Carmel & Westfield | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Plan your bridal & groom wedding prep in Carmel and Westfield with RELUXE Med Spa. Timeline, injectables, facials, laser hair removal, microneedling, body contouring—everything for camera-ready skin."
        />
        <meta property="og:title" content="Wedding Prep in Carmel & Westfield | RELUXE Med Spa" />
        <meta
          property="og:description"
          content="From 'Yes' to 'I Do'—your step-by-step glow plan. Injectables, facials, lasers, and more for brides, grooms, and the whole wedding party."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/wedding" />
        <meta property="og:image" content="https://reluxemedspa.com/images/wedding/og-wedding.jpg" />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <link rel="canonical" href="https://reluxemedspa.com/wedding" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Wedding Prep in Carmel & Westfield | RELUXE Med Spa" />
        <meta name="twitter:description" content="Your step-by-step glow plan for brides, grooms, and the whole wedding party." />
        <meta name="twitter:image" content="https://reluxemedspa.com/images/wedding/og-wedding.jpg" />
      </Head>

      <HeaderTwo />

      {/* Hero (mirrors Men’s page look/feel) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 text-white">
              <p className="text-xs tracking-widest uppercase text-neutral-400">RELUXE • Wedding Prep</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
                Carmel &amp; Westfield Wedding Prep—Glow for the Big Day
              </h1>
              <p className="mt-4 text-neutral-300 text-lg leading-relaxed">
                From proposal to portraits, RELUXE crafts a personalized timeline so you look luminous and camera-ready.
                Designed for <strong>brides</strong>, <strong>grooms</strong>, and the <strong>wedding party</strong>.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={BOOK_URL}
                  className="group inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
                >
                  Book Wedding Consult
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"/></svg>
                </a>
                <a
                  href="#timeline"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition"
                >
                  See the Timeline
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-neutral-400">
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Provider-led plans</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Natural, photo-ready results</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Bridal & groom packages</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img src="/images/events/wedding.jpg" alt="RELUXE Wedding Prep—bridal glow" className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-xs text-neutral-200">Images represent service categories available at RELUXE.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local SEO kicker */}
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-neutral-600">
          Serving <strong>Carmel</strong>, <strong>Westfield</strong>, Zionsville, Fishers, Indy, and North Indianapolis couples.
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Your Wedding Prep Timeline</h2>
          <p className="mt-3 text-neutral-600">
            We personalize every step to your date, goals, and skin. Here’s a proven structure to stay stress-free.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimelineCard
            when="6+ Months"
            items={[
              'Consultation & custom plan',
              'Laser hair removal series (face, underarms, bikini, legs)',
              'SkinPen® microneedling for texture/acne scars',
              'Begin medical-grade skincare (Skinbetter, SkinCeuticals, Universkin)',
            ]}
          />
          <TimelineCard
            when="3–4 Months"
            items={[
              'Neurotoxins: Botox®, Dysport®, Jeuveau®, Daxxify®',
              'Filler for lips/cheeks/chin/jawline (as needed)',
              'EvolveX body contouring (tone, tighten)',
              'Glow-building facials: Glo2Facial®, HydraFacial®',
            ]}
          />
          <TimelineCard
            when="1–2 Months"
            items={[
              'Opus Plasma®, ClearLift, or IPL for refinement',
              'Final filler tweaks (if needed)',
              'Spruce up brows & lashes; maintain skincare',
              'Massage therapy for stress relief',
            ]}
          />
          <TimelineCard
            when="Final 2–3 Weeks"
            items={[
              'Signature facial + dermaplane',
              'Hydrinity hydration boost',
              'Subtle tox touch-ups (timed for photos)',
              'Recovery buffers before events',
            ]}
          />
        </div>

        <div className="mt-10 text-center">
          <a
            href={BOOK_URL}
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
          >
            Start My Wedding Plan
          </a>
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" className="relative bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Popular Wedding Prep Services</h2>
            <p className="mt-3 text-neutral-600">Everything you need for radiant, confident, photo-ready skin.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="Injectables"
              subtitle="Botox • Dysport • Daxxify • Jeuveau"
              copy="Soften lines and refine contours while keeping expression natural. Perfectly timed for portraits."
              image="/images/treatments/tox.jpg"
              href="/book/tox/"
            />
            <ServiceCard
              title="Dermal Filler"
              subtitle="Lips • Cheeks • Chin • Jawline"
              copy="Balance features and add subtle definition for close-ups and video."
              image="/images/treatments/filler.jpg"
              href="/book/filler/"
            />
            <ServiceCard
              title="Facials & Peels"
              subtitle="HydraFacial • Glo2Facial • Signature"
              copy="Consistent glow care for clarity and radiance without downtime."
              image="/images/treatments/glo2facial.jpg"
              href="/book/facials/"
            />
            <ServiceCard
              title="Microneedling"
              subtitle="SkinPen®"
              copy="Refine texture, minimize pores, and boost collagen over time."
              image="/images/treatments/skinpen.jpg"
              href="/book/microneedling/"
            />
            <ServiceCard
              title="Laser & RF"
              subtitle="Opus • ClearLift • IPL • Morpheus8"
              copy="Tighten, resurface, and even tone for makeup-ready skin."
              image="/images/treatments/ipl.jpg"
              href="/book/laser/"
            />
            <ServiceCard
              title="Body Contouring"
              subtitle="EvolveX"
              copy="Tone and tighten targeted areas with a short, strategic series."
              image="/images/treatments/evolvex.jpg"
              href="/book/body/"
            />
          </div>

          <div className="mt-10 text-center">
            <a
              href={BOOK_URL}
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
            >
              Book a Wedding Consult
            </a>
          </div>
        </div>
      </section>

      {/* Packages / Parties */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Wedding Party Packages</h3>
              <p className="mt-3 text-neutral-700">
                Make it a glow-up together. Bridal parties, groomsmen, moms—enjoy curated packages and private event options in
                our Carmel & Westfield locations.
              </p>
              <ul className="mt-4 space-y-2 text-neutral-700">
                <li>✨ Group facials & dermaplane bundles</li>
                <li>✨ Tox parties (minimums apply)</li>
                <li>✨ Pre-event “Red Carpet” glow sessions</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">
                  Plan a Party
                </a>
                <Link href="/contact" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-neutral-800 ring-1 ring-neutral-200 hover:bg-neutral-100 transition">
                  Ask About Packages
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-neutral-200">
                <img src="/images/events/bridal-party.jpg" alt="Bridal party skincare packages" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="relative bg-neutral-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">Wedding Prep FAQs</h4>
          <div className="mt-8 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
            <FaqItem q="When should I start wedding prep?" a="We recommend starting 6+ months out for best results, with a focused push 3–4 months before. We can still help on tighter timelines—book a consult and we’ll prioritize high-impact treatments." />
            <FaqItem q="How close to the wedding can I get injectables?" a="Most brides and grooms plan tox 3–4 weeks prior so results settle before photos. Filler timing depends on the area; we’ll advise based on your goals and date." />
            <FaqItem q="Can we book treatments for the whole wedding party?" a="Yes—ask about bridal party bundles, tox parties, and same-day glow facials. We can host private events at Carmel or Westfield." />
            <FaqItem q="What if I have sensitive skin?" a="We’ll tailor a gentle regimen, leverage Skinbetter/Colorescience/Hydrinity, and plan test-drives so there are no surprises close to the big day." />
          </div>
          <div className="mt-8 text-center">
            <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">
              Book a Carmel/Westfield Consult
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA banner */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 p-[1px]">
            <div className="rounded-3xl bg-neutral-950 px-8 py-12 text-center">
              <h5 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Ready for Your Wedding Glow?
              </h5>
              <p className="mt-3 text-neutral-300 max-w-2xl mx-auto">
                Carmel & Westfield’s trusted med spa for natural, photo-ready results—planned around your date.
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
              <p className="text-sm font-semibold text-white">Book Wedding Prep</p>
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
function TimelineCard({ when, items }) {
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
