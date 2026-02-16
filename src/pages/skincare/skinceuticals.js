// pages/skincare/skinceuticals.js
import Head from 'next/head'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/consult'

const TOP6 = [
  { name: 'CE Ferulic®', note: 'Iconic vitamin C antioxidant for glow and firmness.' },
  { name: 'Phloretin CF®', note: 'Brightening antioxidant for discoloration & uneven tone.' },
  { name: 'Silymarin CF', note: 'Oil-friendly vitamin C for blemish-prone skin.' },
  { name: 'Discoloration Defense', note: 'Targets stubborn spots and post-inflammatory marks.' },
  { name: 'Triple Lipid Restore 2:4:2', note: 'Ceramide-rich barrier repair cream.' },
  { name: 'Glycolic 10 Renew Overnight', note: 'Refining AHA for smoother texture.' },
]

const STAFF_PICKS = {
  westfield: [
    { name: 'CE Ferulic®', reason: 'Daily gold standard for photoaging in Indiana’s seasons.' },
    { name: 'Triple Lipid Restore', reason: 'Barrier support during retinoid or laser protocols.' },
    { name: 'Discoloration Defense', reason: 'Adds measurable progress between in-clinic treatments.' },
  ],
  carmel: [
    { name: 'Phloretin CF®', reason: 'Preferred for pigment-prone, combination skin.' },
    { name: 'Silymarin CF', reason: 'Vitamin C love for oily/acne-prone complexions.' },
    { name: 'Glycolic 10 Renew', reason: 'Simple night refiner for dullness and texture.' },
  ],
}

export default function SkinCeuticalsPage() {
  return (
    <>
      <Head>
        <title>SkinCeuticals® in Carmel & Westfield | Antioxidant Authority | RELUXE Med Spa</title>
        <meta name="description" content="CE Ferulic®, Phloretin CF®, Silymarin CF, Triple Lipid Restore. Learn how SkinCeuticals pairs with your RELUXE plan." />
        <link rel="canonical" href="https://reluxemedspa.com/skincare/skinceuticals" />
        <meta property="og:title" content="SkinCeuticals® at RELUXE (Carmel & Westfield)" />
        <meta property="og:description" content="Antioxidant pioneers & dermatologist-trusted correctives." />
      </Head>
      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.28),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-[11px] tracking-widest uppercase text-white/60">RELUXE • Skincare</p>
              <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">SkinCeuticals®</h1>
              <p className="mt-4 text-neutral-300 text-lg">Gold-standard antioxidants and targeted correctives.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black hover:from-violet-500 hover:to-neutral-900 transition">Build My Routine</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img src="/images/brands/skinceuticals-hero.jpg" alt="SkinCeuticals products" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top 6 + Staff Picks */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <section>
          <h2 className="text-2xl font-extrabold tracking-tight">Top 6 SkinCeuticals Products</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOP6.map((p) => (
              <div key={p.name} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h5 className="font-bold">{p.name}</h5>
                <p className="mt-2 text-neutral-700">{p.note}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold bg-neutral-100 text-neutral-700">
                    In-Clinic Only
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
