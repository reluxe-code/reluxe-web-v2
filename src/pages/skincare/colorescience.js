// pages/skincare/colorescience.js
import Head from 'next/head'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/consult'
const BUY_URL = 'https://REPLACE_WITH_YOUR_COLORESCIENCE_STORE_URL'

const TOP6 = [
  { name: 'Total Protection™ Face Shield Flex SPF 50', note: 'Flexible tint that evens tone with mineral defense.' },
  { name: 'Total Protection™ Face Shield Glow SPF 50', note: 'Luminous finish; gorgeous under makeup or alone.' },
  { name: 'Sunforgettable® Brush-On Shield SPF 50', note: 'Reapply mineral SPF on the go—no mess.' },
  { name: 'Even Up® Clinical Pigment Perfector SPF 50', note: 'Correct + protect for discoloration and melasma.' },
  { name: 'All Calm® Clinical Redness Corrector SPF 50', note: 'Neutralizes redness while protecting sensitive skin.' },
  { name: 'Total Eye® 3-in-1 Renewal Therapy SPF 35', note: 'Brightens, color-corrects, and shields the eye area.' },
]

const STAFF_PICKS = {
  westfield: [
    { name: 'Face Shield Flex', reason: 'Adaptive tint replaces light foundation for many patients.' },
    { name: 'Brush-On Shield', reason: 'Makes SPF reapplication realistic every 2–3 hours.' },
    { name: 'Even Up®', reason: 'Beloved by melasma patients for daily maintenance.' },
  ],
  carmel: [
    { name: 'Face Shield Glow', reason: 'Editorial sheen without looking greasy.' },
    { name: 'All Calm®', reason: 'Instant redness neutralization for reactive skin.' },
    { name: 'Total Eye®', reason: 'AM brightening + mineral protection for peri-orbital skin.' },
  ],
}

export default function ColoresciencePage() {
  return (
    <>
      <Head>
        <title>Colorescience® in Carmel & Westfield | Mineral Suncare | RELUXE Med Spa</title>
        <meta name="description" content="Total Protection™ mineral SPF, correctors, and post-procedure essentials. Shop Colorescience online or in-clinic at RELUXE." />
        <link rel="canonical" href="https://reluxemedspa.com/skincare/colorescience" />
        <meta property="og:title" content="Colorescience® at RELUXE (Carmel & Westfield)" />
        <meta property="og:description" content="Mineral SPF that looks natural and protects your results." />
      </Head>
      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.28),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-[11px] tracking-widest uppercase text-white/60">RELUXE • Skincare</p>
              <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">Colorescience®</h1>
              <p className="mt-4 text-neutral-300 text-lg">Mineral SPF and corrective color that patients love to wear daily.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={BUY_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black hover:from-violet-500 hover:to-neutral-900 transition">Buy Online</a>
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition">Build My Routine</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img src="/images/brands/colorescience-hero.png" alt="Colorescience products" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top 6 */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <section>
          <h2 className="text-2xl font-extrabold tracking-tight">Top 6 Colorescience Products</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOP6.map((p) => (
              <div key={p.name} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h5 className="font-bold">{p.name}</h5>
                <p className="mt-2 text-neutral-700">{p.note}</p>
                <div className="mt-4">
                  <a href={BUY_URL} className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-black hover:from-violet-500 hover:to-neutral-900 transition">Buy Online</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Staff Picks */}
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
