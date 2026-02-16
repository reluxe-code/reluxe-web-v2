// pages/skincare/index.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/'
const BUY_URLS = {
  skinbetter: 'https://skinbetter.pro/reluxemedspa',
  colorescience: 'https://www.colorescience.com/reluxe-med-spa',
}

const TOP6 = [
  { name: 'AlphaRet® Overnight Cream', brand: 'skinbetter science', href: BUY_URLS.skinbetter, note: 'Retinoid + AHA technology for smoother texture.' },
  { name: 'CE Ferulic®', brand: 'SkinCeuticals', href: null, note: 'Gold-standard antioxidant protection and glow.' },
  { name: 'Total Protection™ Face Shield Flex', brand: 'Colorescience', href: BUY_URLS.colorescience, note: 'Mineral SPF with flexible tint shades.' },
  { name: 'InterFuse® Treatment Cream EYE', brand: 'skinbetter science', href: BUY_URLS.skinbetter, note: 'Peptide eye treatment for crepiness & lines.' },
  { name: 'Triple Lipid Restore 2:4:2', brand: 'SkinCeuticals', href: null, note: 'Barrier-loving ceramides, cholesterol, fatty acids.' },
  { name: 'Sunforgettable® Brush-On Shield SPF 50', brand: 'Colorescience', href: BUY_URLS.colorescience, note: 'Reapply-friendly powder SPF for on-the-go.' },
]

const STAFF_PICKS = {
  westfield: [
    { name: 'AlphaRet® Overnight Cream', brand: 'skinbetter science', reason: 'Fast texture improvement with great tolerability.' },
    { name: 'Total Eye® 3-in-1 Renewal Therapy', brand: 'Colorescience', reason: 'Brighten + protect the peri-orbital area.' },
    { name: 'Discoloration Defense', brand: 'SkinCeuticals', reason: 'Targets stubborn spots and melasma maintenance.' },
  ],
  carmel: [
    { name: 'Trio Rebalancing Moisture Treatment', brand: 'skinbetter science', reason: 'Lightweight hydration that layers with actives.' },
    { name: 'Face Shield Glow SPF', brand: 'Colorescience', reason: 'Daily SPF with a luminous finish.' },
    { name: 'Glycolic 10 Renew Overnight', brand: 'SkinCeuticals', reason: 'Refines texture and dullness overnight.' },
  ],
}

export default function SkincareHub() {
  return (
    <>
      <Head>
        <title>Medical-Grade Skincare in Carmel & Westfield, IN | RELUXE Med Spa</title>
        <meta
          name="description"
          content="RELUXE Med Spa offers medical-grade skincare in Carmel & Westfield: personalized routines for acne, melasma, rosacea, anti-aging, and texture. Shop skinbetter science & Colorescience online."
        />
        <link rel="canonical" href="https://reluxemedspa.com/skincare" />
        <meta property="og:title" content="Medical-Grade Skincare | RELUXE Med Spa (Carmel & Westfield)" />
        <meta property="og:description" content="Personalized routines with skinbetter science, Colorescience, SkinCeuticals, Hydrinity, and Universkin." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/brands/og-skincare.jpg" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.28),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-[11px] tracking-widest uppercase text-white/60">RELUXE • Skincare</p>
              <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">Medical-Grade Skincare, Personalized</h1>
              <p className="mt-4 text-neutral-300 text-lg leading-relaxed">
                Great skin is a strategy. Our providers pair your goals with proven lines—<strong>skinbetter science</strong>,{' '}
                <strong>Colorescience</strong>, <strong>SkinCeuticals</strong>, <strong>Hydrinity</strong>, and <strong>Universkin</strong>—to reinforce in-clinic results.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">
                  Book Skin Consult
                </a>
                <Link href="#brands" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition">
                  Explore Brands
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img src="/images/brands/hero.jpg" alt="Medical-grade skincare at RELUXE" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we treat */}
      <section id="treat" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">What We Treat with Skincare</h2>
          <p className="mt-3 text-neutral-600">Daily routines that protect your investment and amplify results.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TreatCard title="Acne & Breakouts" copy="Reduce congestion, balance oil, and calm inflammation with evidence-based actives." />
          <TreatCard title="Pigmentation & Melasma" copy="Brighten and even tone with pigment modulators and daily mineral UV defense." />
          <TreatCard title="Redness & Rosacea" copy="Calm reactivity and reinforce the barrier for everyday comfort." />
          <TreatCard title="Aging & Fine Lines" copy="Retinoids, antioxidants, peptides, and growth factors—layered intelligently." />
          <TreatCard title="Texture & Pores" copy="Strategic exfoliation + barrier support to smooth and refine." />
          <TreatCard title="Post-Procedure Recovery" copy="Recovery-focused hydration that speeds healing after lasers or microneedling." />
        </div>
      </section>

      {/* Top 6 (sitewide) */}
      <section className="relative bg-neutral-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Top 6 Skincare Bestsellers</h3>
            <p className="mt-3 text-neutral-700">Updated by our Carmel & Westfield teams based on outcomes and re-purchases.</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOP6.map((p) => (
              <ProductCard key={p.name} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* Our lines */}
      <section id="brands" className="relative py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Professional Skincare Lines</h3>
            <p className="mt-3 text-neutral-700">Curated for results, compatibility, and elegance.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <BrandCard
              logo="/images/brands/skinbetter-logo.jpg"
              title="skinbetter science®"
              copy="AlphaRet®, InterFuse®, Alto Advanced."
              href="/skincare/skinbetter-science"
              ctas={[
                { label: 'Buy Online', href: BUY_URLS.skinbetter, primary: true },
                { label: 'Learn More', href: '/skincare/skinbetter-science' },
              ]}
            />
            <BrandCard
              logo="/images/brands/colorescience-logo.jpg"
              title="Colorescience®"
              copy="Total Protection™ mineral suncare & color-correctors."
              href="/skincare/colorescience"
              ctas={[
                { label: 'Buy Online', href: BUY_URLS.colorescience, primary: true },
                { label: 'Learn More', href: '/skincare/colorescience' },
              ]}
            />
            <BrandCard
              logo="/images/brands/skinceuticals-logo.jpg"
              title="SkinCeuticals®"
              copy="Antioxidant pioneers (CE Ferulic®, Silymarin CF)."
              href="/skincare/skinceuticals"
              ctas={[{ label: 'Learn More', href: '/skincare/skinceuticals', primary: true }]}
            />
            <BrandCard
              logo="/images/brands/hydrinity.svg"
              title="Hydrinity®"
              copy="Accelerated recovery & deep hydration."
              href="/skincare/hydrinity"
              ctas={[{ label: 'Learn More', href: '/skincare/hydrinity', primary: true }]}
            />
            <BrandCard
              logo="/images/brands/universkin.svg"
              title="Universkin®"
              copy="Truly personalized formulas."
              href="/skincare/universkin"
              ctas={[{ label: 'Learn More', href: '/skincare/universkin', primary: true }]}
            />
          </div>
        </div>
      </section>

      {/* Staff Picks */}
      <section className="relative bg-neutral-50 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <StaffColumn title="Staff Picks — Westfield" items={STAFF_PICKS.westfield} />
            <StaffColumn title="Staff Picks — Carmel" items={STAFF_PICKS.carmel} />
          </div>
          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">
              Build My Routine
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

// --- Components ---
function TreatCard({ title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-extrabold tracking-tight">{title}</h4>
      <p className="mt-2 text-neutral-700">{copy}</p>
    </div>
  )
}

function ProductCard({ name, brand, href, note }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h4 className="font-bold">{name}</h4>
      <p className="text-sm text-neutral-500">{brand}</p>
      {note && <p className="mt-2 text-neutral-700">{note}</p>}
      <div className="mt-4">
        {href ? (
          <a href={href} className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-black hover:from-violet-500 hover:to-neutral-900 transition">
            Buy Online
          </a>
        ) : (
          <span className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold bg-neutral-100 text-neutral-700">
            In-Clinic Only
          </span>
        )}
      </div>
    </div>
  )
}

function BrandCard({ logo, title, copy, ctas = [] }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]">
      <div className="aspect-[4/2] w-full overflow-hidden bg-neutral-50 flex items-center justify-center">
        <img src={logo} alt={title} className="h-10 object-contain" />
      </div>
      <div className="p-6">
        <h4 className="text-xl font-bold tracking-tight">{title}</h4>
        <p className="mt-3 text-neutral-700">{copy}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {ctas.map((c, i) =>
            c.href ? (
              <a key={i} href={c.href} className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ${c.primary ? 'text-white bg-gradient-to-r from-violet-600 to-black hover:from-violet-500 hover:to-neutral-900' : 'ring-1 ring-neutral-300 hover:bg-neutral-50'}`}>
                {c.label}
              </a>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}

function StaffColumn({ title, items }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-extrabold tracking-tight">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.name}>
            <p className="font-semibold">{it.name} <span className="text-neutral-500 font-normal">• {it.brand}</span></p>
            <p className="text-neutral-700 text-sm">{it.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
