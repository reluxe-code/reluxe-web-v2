// pages/landing/refine-carmel.js
import Head from 'next/head'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

// --- Config ---
const BOOK_URL = '/book/refine'

export default function RefineCarmelPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>REFINE Carmel | Complimentary, Personalized Consultation | RELUXE Med Spa</title>
        <meta
          name="description"
          content="REFINE is RELUXE Carmel’s signature complimentary consultation with our highly skilled nurse injectors. Get a tailored plan and the option for same‑day treatment."
        />
        <meta property="og:title" content="REFINE Carmel | RELUXE Med Spa" />
        <meta
          property="og:description"
          content="Complimentary, no‑pressure consultation with expert nurse injectors. Honest guidance, personalized plans, and the option for same‑day service."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/landing/refine-carmel" />
        <meta property="og:image" content="https://reluxemedspa.com/images/refine/og-refine.jpg" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 text-white">
              <p className="text-xs tracking-widest uppercase text-neutral-400">RELUXE • Carmel</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">✨ REFINE: Your Personalized Consultation</h1>
              <p className="mt-4 text-neutral-300 text-lg leading-relaxed">
                With our highly skilled nurse injectors. REFINE is our signature <strong>complimentary</strong> consultation designed to help you feel confident,
                supported, and empowered to make the right choices for your skin and appearance.
              </p>
              <p className="mt-3 text-neutral-300">
                Whether you’re new to treatments or ready for a refresh, we take the time to understand your goals, facial anatomy, and lifestyle—then create a
                custom plan just for you.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a data-book-loc="carmel" href={BOOK_URL} className="group inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">
                  Book REFINE Consultation
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"/></svg>
                </a>
                <TrustBadges />
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-neutral-400">
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">No pressure. No gimmicks.</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Honest education</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Nearly 200 ★★★★★ reviews</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <a data-book-loc="carmel" href={BOOK_URL}><img src="/images/landing/refine-carmel-hero.png" alt="REFINE consultation at RELUXE Carmel" className="h-full w-full object-cover" /></a>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-xs text-neutral-200">Complimentary, personalized consults led by nurse injectors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What’s Included */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">What’s Included</h2>
          <p className="mt-3 text-neutral-600">Everything you need to feel informed and confident—without pressure.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <IncludedCard title="Expert Consultation" copy="Meet 1:1 with an experienced nurse injector for a thorough assessment and goal‑setting." icon="💬" />
          <IncludedCard title="Personalized Treatment Plan" copy="A strategy tailored to your priorities, timeline, and budget—no one‑size‑fits‑all." icon="🧭" />
          <IncludedCard title="Option for Same‑Day Service" copy="If it makes sense for your plan, you can refine your look right away." icon="⚡" />
        </div>

        <div className="mt-10 text-center">
          <a  data-book-loc="carmel" href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">
            Book My REFINE Consult
          </a>
        </div>
      </section>

      {/* Treatment Areas */}
      <section className="relative bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Common Concerns We Address</h3>
            <p className="mt-3 text-neutral-700">Your plan may include injectables, skin treatments, or lasers—always customized to you.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AreaCard title="Undereyes & Dark Circles" items={["Filler","PRP","SkinPen Microneedling"]} />
            <AreaCard title="Wrinkles & Fine Lines" items={["Jeuveau®","Botox®","Dysport®","Daxxify®"]} />
            <AreaCard title="Sagging / Loose Skin" items={["Morpheus8","Sculptra","CO₂ Laser"]} />
            <AreaCard title="Volume Loss & Balancing" items={["Dermal Filler","Sculptra"]} />
            <AreaCard title="Skin Texture & Resurfacing" items={["CO₂ Laser","Morpheus8","SkinPen"]} />
            <AreaCard title="Personalized Skincare" items={["Medical‑grade routines","Maintenance plan"]} />
          </div>

          <div className="mt-10 text-center">
            <a data-book-loc="carmel"  href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">
              Start My Personalized Plan
            </a>
          </div>
        </div>
      </section>

      {/* Why RELUXE */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-extrabold tracking-tight">Why RELUXE?</h3>
              <p className="mt-3 text-neutral-700">At RELUXE, your journey isn’t about chasing trends or counting units—it’s about natural, confident results that match who you are.</p>
              <ul className="mt-4 space-y-2 text-neutral-700">
                <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-violet-600" /> No pressure. No gimmicks.</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-violet-600" /> Honest education and recommendations.</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-violet-600" /> Nearly 200 5‑star reviews from women just like you.</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <a data-book-loc="carmel"  href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">Book REFINE</a>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative grid grid-cols-2 gap-4">
              <img src="/images/landing/balancing.png" alt="Consult with nurse injector" className="rounded-2xl border border-neutral-200 shadow-sm" />
              <img src="/images/landing/filler.png" alt="Personalized treatment planning" className="rounded-2xl border border-neutral-200 shadow-sm" />
              <img src="/images/landing/m8 copy.png" alt="Morpheus8 treatment" className="rounded-2xl border border-neutral-200 shadow-sm" />
              <img src="/images/landing/tox.png" alt="SkinPen microneedling" className="rounded-2xl border border-neutral-200 shadow-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">How REFINE Works</h3>
            <p className="mt-3 text-neutral-700">Simple, supportive, and tailored to you.</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <StepCard step="1" title="Book" copy="Choose a time that works for you at our Carmel location." />
            <StepCard step="2" title="Consult" copy="Meet with a nurse injector for an anatomy‑aware assessment and plan." />
            <StepCard step="3" title="Refine" copy="Begin your plan—same‑day service available when appropriate." />
          </div>
          <div className="mt-10 text-center">
            <a data-book-loc="carmel"  href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">
              Book My Spot
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">REFINE FAQs</h4>
        <div className="mt-8 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
          <FaqItem q="Is REFINE really complimentary?" a="Yes. Your consultation is free and low‑pressure—our goal is to educate and guide, not sell." />
          <FaqItem q="Can I get treated the same day?" a="Often, yes. If your plan and schedule allow, we can begin treatment during your visit." />
          <FaqItem q="Do I have to decide everything at once?" a="Not at all. We’ll prioritize what matters most and map steps across a timeline and budget that work for you." />
          <FaqItem q="Who will I meet with?" a="A highly trained nurse injector who will assess your goals and anatomy and build a plan with you." />
          <FaqItem q="Is this only at Carmel?" a="REFINE for this page is specific to our Carmel location. Bookings here route to Carmel providers." />
        </div>
        <div className="mt-8 text-center">
          <a data-book-loc="carmel"  href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">Book REFINE Consultation</a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 p-[1px]">
            <div className="rounded-3xl bg-neutral-950 px-8 py-12 text-center">
              <h5 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">REFINE: Education First. Results Always.</h5>
              <p className="mt-3 text-neutral-300 max-w-2xl mx-auto">Get the care, strategy, and results you deserve—crafted around your goals, timeline, and lifestyle.</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a data-book-loc="carmel"  href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition">Book REFINE at Carmel</a>
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
              <p className="text-sm font-semibold text-white">Book REFINE Consultation</p>
              <p className="text-[11px] text-neutral-400">Complimentary • Carmel</p>
            </div>
            <a data-book-loc="carmel"  href={BOOK_URL} className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-black">Book</a>
          </div>
        </div>
      )}
    </>
  )
}

/* ---------- Components ---------- */
function IncludedCard({ title, copy, icon }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600/15 to-fuchsia-500/15 ring-1 ring-violet-200 flex items-center justify-center text-lg">{icon}</div>
        <h4 className="text-lg font-extrabold tracking-tight">{title}</h4>
      </div>
      <p className="mt-3 text-neutral-700">{copy}</p>
      <div className="mt-5">
        <a data-book-loc="carmel"  href={BOOK_URL} className="text-violet-700 hover:text-violet-600 font-semibold">Book REFINE →</a>
      </div>
    </div>
  )
}

function AreaCard({ title, items = [] }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h5 className="text-lg font-extrabold tracking-tight">{title}</h5>
      <ul className="mt-3 space-y-1 text-neutral-700">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-violet-600" /> {it}</li>
        ))}
      </ul>
      <div className="mt-5"><a data-book-loc="carmel"  href={BOOK_URL} className="text-violet-700 hover:text-violet-600 font-semibold">Start Here →</a></div>
    </div>
  )
}

function StepCard({ step, title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-bold flex items-center justify-center">{step}</div>
        <h6 className="text-base font-extrabold tracking-tight">{title}</h6>
      </div>
      <p className="mt-3 text-neutral-700">{copy}</p>
      <div className="mt-5"><a data-book-loc="carmel" href={BOOK_URL} className="text-violet-700 hover:text-violet-600 font-semibold">Book REFINE →</a></div>
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

function TrustBadges() {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-white/5 ring-1 ring-white/15 px-3 py-2">
      <div className="flex -space-x-2">
        <img src="/images/avatars/a1.jpg" className="h-6 w-6 rounded-full ring-2 ring-black/30" alt="reviewer" />
        <img src="/images/avatars/a2.jpg" className="h-6 w-6 rounded-full ring-2 ring-black/30" alt="reviewer" />
        <img src="/images/avatars/a3.jpg" className="h-6 w-6 rounded-full ring-2 ring-black/30" alt="reviewer" />
      </div>
      <span className="text-xs text-white/90"><strong>~200</strong> 5‑star reviews</span>
    </div>
  )
}
