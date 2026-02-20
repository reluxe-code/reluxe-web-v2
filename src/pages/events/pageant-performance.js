import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/'

export default function PageantPerformancePage() {
  const [showStickyCta, setShowStickyCta] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Pageant & Performance Prep | Carmel & Westfield | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Stage-ready glow for pageants, dance, cheer, theater, and bodybuilding in Carmel & Westfield. Smart timing for injectables, facials, lasers, and body treatments."
        />
        <link rel="canonical" href="https://reluxemedspa.com/events/pageant-performance" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-white">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-xs tracking-widest uppercase text-neutral-400">RELUXE • Pageant & Performance</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Stage-Ready Skin & Confidence</h1>
              <p className="mt-4 text-neutral-300 text-lg leading-relaxed">
                From pageant stage to theater lights and competition day, we’ll build a plan for a smooth, vibrant, camera- and stage-ready look—without derailing training or rehearsals.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black">Book Stage Prep</a>
                <a href="#timing" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15">Timing Guide</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img src="/images/treatments/pageant.jpg" alt="Pageant & performance prep Carmel Westfield" className="h-full w-full object-cover" />
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
      <section id="timing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Stage-Ready Timing Guide</h2>
          <p className="mt-3 text-neutral-600">Planned around rehearsal, practice, and show day—no surprises, just polish.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimingCard
            when="6–8 Weeks Out"
            items={[
              'Neurotoxins to refine expressions (Botox®, Dysport®, Jeuveau®, Daxxify®)',
              'Filler (if needed) for symmetry and balance',
              'Start SkinPen® or laser series (if runway allows)',
            ]}
          />
          <TimingCard
            when="3–4 Weeks Out"
            items={[
              'HydraFacial® / Glo2Facial® for clarity & hydration',
              'EvolveX body contouring session for tone',
              'Refine product routine (no big changes later)',
            ]}
          />
          <TimingCard
            when="7–10 Days Out"
            items={[
              'Dermaplane + light peel (camera-friendly)',
              'LED light therapy for calm, even skin',
              'Hydrinity hydration boost for lit-from-within look',
            ]}
          />
          <TimingCard
            when="48–72 Hours Out"
            items={[
              'Keep skincare simple; avoid sensitizers',
              'Hydration, rest, and a calm routine',
              'Pack stage kit: blot papers, mineral powder, balm',
            ]}
          />
        </div>

        <div className="mt-10 text-center">
          <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black">
            Start My Stage Plan
          </a>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Performance-Perfect Services</h2>
            <p className="mt-3 text-neutral-600">Photogenic, stage-smart, and scheduled around your program.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard title="Injectables" subtitle="Neurotoxins" copy="Refine lines and keep expressions natural under bright lights." image="/images/treatments/injectables.jpg" href="/book/tox/" />
            <ServiceCard title="HydraFacial® / Glo2Facial®" subtitle="Radiant clarity" copy="Reliable, no-downtime glow that reads beautifully on camera." image="/images/treatments/facials.jpg" href="/book/facials/" />
            <ServiceCard title="Dermaplane + Light Peel" subtitle="Makeup grip" copy="Smoother canvas for stage makeup and close-up photos." image="/images/treatments/dermaplane.jpg" href="/book/facials/" />
            <ServiceCard title="SkinPen® Microneedling" subtitle="Texture & pores" copy="For longer timelines—build collagen for refined texture." image="/images/treatments/skinpen.jpg" href="/book/microneedling/" />
            <ServiceCard title="Laser & RF" subtitle="Opus • ClearLift • IPL" copy="Even tone and light resurfacing—timed to your program." image="/images/treatments/laser.jpg" href="/book/laser/" />
            <ServiceCard title="EvolveX Body Contouring" subtitle="Tone & tighten" copy="Target midsection or limbs to complement stagewear." image="/images/treatments/body.jpg" href="/book/body/" />
          </div>

          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black">
              Book Performance Services
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">Pageant & Performance FAQs</h4>
        <div className="mt-8 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
          <FaqItem q="I have a show in two weeks—what’s safest?" a="Stick with no-downtime facials, dermaplane, and hydration boosts. Avoid aggressive resurfacing or new actives." />
          <FaqItem q="Can you work around rehearsals and practices?" a="Yes, we’ll schedule treatments on off-days and build buffers before stage time." />
          <FaqItem q="Do you help bodybuilding competitors?" a="Absolutely—EvolveX for tone, laser hair removal planning, and skin-finishing tips for stage day." />
        </div>

        <div className="mt-8 text-center">
          <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black">
            Book a Carmel/Westfield Consult
          </a>
        </div>
      </section>

      {/* Sticky CTA */}
      {showStickyCta && (
        <div className="fixed inset-x-0 bottom-3 z-50 mx-auto w-full max-w-md rounded-2xl bg-neutral-900/95 px-3 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Book Stage Prep</p>
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
    <div className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
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
    <div className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
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
