// pages/skincare/skinbetter-science.js
import Head from 'next/head'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/consult'
const BUY_URL = 'https://REPLACE_WITH_YOUR_SKINBETTER_STORE_URL'

const TOP6 = [
  { name: 'AlphaRet® Overnight Cream', note: 'Retinoid + AHA technology with great tolerability.' },
  { name: 'AlphaRet® Exfoliating Peel Pads', note: 'On-demand glow; great travel refiner.' },
  { name: 'Alto Advanced Defense and Repair', note: 'Broad-spectrum antioxidant powerhouse.' },
  { name: 'InterFuse® Treatment Cream EYE', note: 'Peptides for lines, puffiness, and crepiness.' },
  { name: 'Trio Rebalancing Moisture Treatment', note: 'Lightweight but effective barrier support.' },
  { name: 'Even Tone Correcting Serum', note: 'Targets visible discoloration and dullness.' },
]

const STAFF_PICKS = {
  westfield: [
    { name: 'AlphaRet® Overnight Cream', reason: 'Delivers visible smoothing within weeks.' },
    { name: 'InterFuse® EYE', reason: 'Daily eye staple—plays well with injectables.' },
    { name: 'Trio Rebalancing Moisture', reason: 'Hydrates without heaviness; acne-friendly.' },
  ],
  carmel: [
    { name: 'Alto Advanced', reason: 'AM antioxidant that boosts brightness and defenses.' },
    { name: 'AlphaRet® Peel Pads', reason: 'Fast event-ready glow; easy routine add-on.' },
    { name: 'Even Tone Correcting', reason: 'Melasma-friendly maintenance between treatments.' },
  ],
}

export default function SkinbetterSciencePage() {
  return (
    <>
      <Head>
        <title>skinbetter science® in Carmel & Westfield | Authorized | RELUXE Med Spa</title>
        <meta name="description" content="AlphaRet®, InterFuse®, Alto Advanced. Shop skinbetter science online or in-clinic at RELUXE (Carmel & Westfield, IN). Build a results-driven routine." />
        <link rel="canonical" href="https://reluxemedspa.com/skincare/skinbetter-science" />
        <meta property="og:title" content="skinbetter science® at RELUXE (Carmel & Westfield)" />
        <meta property="og:description" content="Authorized provider. Award-winning formulas with elegant tolerability." />
      </Head>
      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.28),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-[11px] tracking-widest uppercase text-white/60">RELUXE • Skincare</p>
              <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">skinbetter science®</h1>
              <p className="mt-4 text-neutral-300 text-lg">Clinical, elegant formulas that deliver—from <strong>AlphaRet®</strong> to <strong>Alto Advanced</strong>.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={BUY_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black hover:from-violet-500 hover:to-neutral-900 transition">Buy Online</a>
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition">Build My Routine</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img src="/images/brands/skinbetter-hero.png" alt="skinbetter science products" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top 6 */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <section>
          <h2 className="text-2xl font-extrabold tracking-tight">Top 6 skinbetter Products</h2>
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

        {/* Pairing */}
        <section className="mt-14">
          <h3 className="text-xl font-extrabold tracking-tight">Pairing with Treatments</h3>
          <ul className="mt-3 list-disc pl-5 text-neutral-700 space-y-1">
            <li><strong>Morpheus8/Opus:</strong> recovery serums first; retinoids resume per provider guidance.</li>
            <li><strong>Neuromodulators:</strong> antioxidant AM + retinoid PM keeps texture and tone on point.</li>
            <li><strong>Microneedling:</strong> use barrier-supportive hydration post-procedure; re-introduce actives gradually.</li>
          </ul>
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
