// pages/pricing.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '@/components/header/header-2'
import PricingGrid from '@/components/pricing/PricingGrid'
import { servicesData } from '@/data/Pricing'

// ---------- deterministic slug guessing (pure string match)
const NAME_TO_SLUG = [
  ['facial balancing','facialbalancing'],
  ['daxx', 'daxxify'],
  ['botox','botox'], ['dysport','dysport'], ['jeuveau','jeuveau'], ['tox','tox'],
  ['filler','filler'], ['juved','juvederm'], ['rha','rha'], ['restyl','restylane'], ['versa','versa'],
  ['sculp','sculptra'], ['hydra','hydrafacial'], ['glo2','glo2facial'],
  ['chemical','peels'], ['signature facial','facials'], ['facial','facials'],
  ['skinpen','skinpen'], ['morpheus','morpheus8'],
  ['ipl','ipl'], ['laser hair','laserhair'], ['laser','lasers'],
  ['clearlift','clearlift'], ['clearskin','clearskin'], ['opus','opus'], ['prp','prp'],
  ['massage','massage'], ['salt sauna','saltsauna'], ['vascupen','vascupen'], ['dissolv','dissolving'],
]
const guessSlug = (label='') => {
  const s = String(label).toLowerCase().trim()
  for (const [needle, slug] of NAME_TO_SLUG) if (s.includes(needle)) return slug
  return '' // unknown -> send to /services
}

// ---------- normalize once so SSR/CSR output is identical
const isGroup = (x) => x && typeof x === 'object' && Array.isArray(x.items) && x.title
const normalizeGroups = (data) => {
  const arr = Array.isArray(data) ? data : []
  const groups = arr.filter(isGroup)
  if (!groups.length) return null
  return groups.map(g => ({
    title: String(g.title || ''),
    items: (g.items || []).map((it, i) => {
      const name = String(it?.name || it?.title || '')
      const price = it?.price || it?.value || it?.starting || it?.from || ''
      const slug = it?.slug || guessSlug(name)
      return {
        id: `${g.title}:${name}:${i}`, // stable key
        name,
        price: typeof price === 'string' ? price : String(price || ''),
        href: slug ? `/services/${slug}` : '/services',
        hasSlug: Boolean(slug),
      }
    }),
  }))
}

// ---------- icons
function ArrowRight({ className='h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function CheckDot({ className='h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 12.5l2.5 2 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ---------- cards
function CategoryCard({ title, items=[] }) {
  return (
    <section className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <header className="flex items-center justify-between px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </header>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <ul className="p-2">
        {items.map((it) => (
          <li key={it.id} className="relative">
            {/* ALWAYS render a Link to keep SSR/CSR identical */}
            <Link
              href={it.href}
              prefetch={false}
              aria-disabled={!it.hasSlug}
              className={`block ${!it.hasSlug ? 'pointer-events-none' : ''}`}
              aria-label={`View ${it.name}`}
            >
              <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-2 hover:bg-slate-50">
                <span className="text-sm text-slate-900">{it.name}</span>
                <div className="flex items-center gap-2">
                  {it.price ? (
                    <span className="whitespace-nowrap text-sm font-semibold text-slate-900">
                      {it.price}
                    </span>
                  ) : null}
                  <ArrowRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-80" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </section>
  )
}
function CategoryGrid({ groups }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((g, i) => (
        <CategoryCard key={`${g.title}-${i}`} title={g.title} items={g.items} />
      ))}
    </div>
  )
}

// ---------- curated packages
function PackagesShowcase() {
  const pkgs = [
    {
      title: 'Lasers — Even Tone Bundle',
      blurb: 'Fade sun spots & redness with a focused series for noticeably brighter, more even skin.',
      bullets: ['IPL 6-pack for best results', 'Optional VascuPen add-on for tiny vessels', 'Member savings & financing available'],
      href: '/services/ipl',
      tag: 'Most Popular'
    },
    {
      title: 'Microneedling Glow Series',
      blurb: 'Refine texture and boost glow with a no-downtime plan you can stick to.',
      bullets: ['SkinPen 4-pack', 'Optional PRP (VAMP) upgrade', 'Great between lasers or pre-event'],
      href: '/services/skinpen'
    },
    {
      title: 'RF Microneedling Tighten Trio',
      blurb: 'Deeper collagen remodeling to firm and smooth—excellent for laxity and scars.',
      bullets: ['Morpheus8 3-pack', 'Topical numbing + aftercare included', 'Area-based pricing'],
      href: '/services/morpheus8'
    },
    {
      title: 'Body Contouring Program',
      blurb: 'Trim, tighten, and tone with a custom EvolveX plan—hands-free and fully tailored.',
      bullets: ['EvolveX (Tite/Tone/Transform) series', 'By-area customization', 'Save more with bundles'],
      href: '/services/evolvex'
    },
  ]
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Featured Packages</h2>
        <span className="text-xs text-slate-500">Series pricing • Bundle & save</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {pkgs.map((p, i) => (
          <Link
            href={p.href}
            prefetch={false}
            key={i}
            className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {p.tag ? (
              <span className="absolute right-4 top-4 rounded-full bg-black px-2 py-0.5 text-[11px] font-medium text-white">
                {p.tag}
              </span>
            ) : null}
            <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{p.blurb}</p>
            <ul className="mt-3 space-y-2">
              {p.bullets.map((b, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-slate-800">
                  <CheckDot className="mt-0.5 h-4 w-4 text-slate-900" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              See details <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ---------- memberships (2 tiers + link)
function MembershipDuo() {
  const tiers = [
    {
      name: 'Essential Membership',
      price: '$100/mo',
      bullets: [
        'One $125 credit toward any service',
        '10% off à la carte',
        'Priority booking',
        'Member-only specials',
      ],
    },
    {
      name: 'Elite Membership',
      price: '$200/mo',
      bullets: [
        'Two $150 credits toward any service',
        '15% off à la carte',
        'Quarterly complimentary facial',
        'VIP event access',
      ],
    },
  ]
  return (
    <section className="relative">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Memberships</h2>
        <Link
          href="/memberships"
          prefetch={false}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50"
        >
          See all perks →
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {tiers.map((t, i) => (
          <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">{t.name}</h3>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">{t.price}</div>
            <ul className="mt-5 space-y-3">
              {t.bullets.map((b, j) => (
                <li key={j} className="flex items-start gap-3 text-lg text-slate-900">
                  <CheckDot className="mt-1 h-5 w-5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href="/memberships"
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Join now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function PricingPage() {
  const groups = normalizeGroups(servicesData)

  return (
    <>
      <Head>
        <title>Services & Pricing | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Explore RELUXE's full menu of services and pricing including injectables, facials, laser treatments, and membership packages."
        />
      </Head>

      <HeaderTwo />

      <main className="bg-gradient-to-b from-white via-slate-50/60 to-white">
        <div className="container mx-auto max-w-7xl px-6 py-12">
          <header className="mx-auto mb-10 max-w-3xl text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
              Services & Pricing
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Transparent pricing.{' '}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                No pressure.
              </span>{' '}
              Just great results.
            </h1>
            <p className="mt-4 text-slate-600">
              Your favorite categories—Botox, Filler, Lasers, Massage, and more—kept exactly as you
              know them, now in a cleaner layout.
            </p>
          </header>

          {/* Category cards — content preserved */}
          <section className="mb-14">
            {groups ? <CategoryGrid groups={groups} /> : <PricingGrid services={servicesData} />}
          </section>

          {/* Packages */}
          <section className="mb-14">
            <PackagesShowcase />
          </section>

          {/* Memberships */}
          <section>
            <MembershipDuo />
          </section>
        </div>
      </main>
    </>
  )
}
