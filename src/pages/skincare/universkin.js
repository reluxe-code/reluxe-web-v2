// pages/skincare/universkin.js
import Head from 'next/head'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/consult'

const TOP6 = [
  { name: 'P Serum + Niacinamide (NIA)', note: 'Balances oil and supports barrier.' },
  { name: 'P Serum + Azelaic Acid (AZA)', note: 'Targets redness, congestion, and pigment.' },
  { name: 'P Serum + Retinol (RET)', note: 'Refines texture and fine lines overnight.' },
  { name: 'P Serum + Tranexamic Acid (TA)', note: 'Supports melasma maintenance.' },
  { name: 'P Serum + Kojic Acid (KOJ)', note: 'Helps with stubborn dark spots.' },
  { name: 'P Serum + Madecassoside (MAD)', note: 'Soothes and calms reactive skin.' },
]

const STAFF_PICKS = {
  westfield: [
    { name: 'P + AZA + NIA', reason: 'Redness-prone, breakout-prone skin that needs clarity.' },
    { name: 'P + TA + KOJ', reason: 'Targeted pigment protocol with daily sunscreen.' },
    { name: 'P + RET (low%)', reason: 'Gentle anti-aging start that can scale up.' },
  ],
  carmel: [
    { name: 'P + NIA + MAD', reason: 'Barrier-friendly blend for sensitivity.' },
    { name: 'P + RET + NIA', reason: 'Texture + fine line focus with support actives.' },
    { name: 'P + TA + AZA', reason: 'Melasma maintenance with clarity benefits.' },
  ],
}

export default function UniverskinPage() {
  return (
    <>
      <Head>
        <title>Universkin® in Carmel & Westfield | Personalized Formulas | RELUXE Med Spa</title>
        <meta name="description" content="Universkin blends actives to your skin profile—custom P Serum designed by your RELUXE provider in Carmel & Westfield." />
        <link rel="canonical" href="https://reluxemedspa.com/skincare/universkin" />
        <meta property="og:title" content="Universkin® at RELUXE (Carmel & Westfield)" />
        <meta property="og:description" content="Truly personalized skincare guided by providers." />
      </Head>
      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.28),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-[11px] tracking-widest uppercase text-white/60">RELUXE • Skincare</p>
              <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">Universkin®</h1>
              <p className="mt-4 text-neutral-300 text-lg">Your actives, your goals—customized into a simple, potent serum.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black hover:from-violet-500 hover:to-neutral-900 transition">Start My Blend</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img src="/images/brands/universkin-hero.jpg" alt="Universkin personalized skincare" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top 6 + Staff Picks */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <section>
          <h2 className="text-2xl font-extrabold tracking-tight">Top 6 Universkin Customizations</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOP6.map((p) => (
              <div key={p.name} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h5 className="font-bold">{p.name}</h5>
                <p className="mt-2 text-neutral-700">{p.note}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold bg-neutral-100 text-neutral-700">
                    In-Clinic Custom Only
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="grid gap-8 md:grid-cols-2">
            <StaffColumn title="Staff Picks — Westfield" items={STAFF_PICKS.westfield} />
            <StaffColumn title="Staff Picks — Carmel" items={STAFF_PICKS.carmel} />
          </div>
        </section>

        <div className="mt-14 flex flex-wrap gap-3">
          <a href="/skincare" className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold ring-1 ring-neutral-300 hover:bg-neutral-50">← Skincare Hub</a>
          <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold text-white bg-neutral-900 hover:bg-black">Book Skincare Consult</a>
        </div>
      </main>
    </>
  )
}

function StaffColumn({ title, items }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-extrabold tracking-tight">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.name}>
            <p className="font-semibold">{it.name}</p>
            <p className="text-neutral-700 text-sm">{it.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
