// src/pages/team/index.js
import { gql } from '@apollo/client'
import client from '@/lib/apollo'
import Head from 'next/head'
import HeaderTwo from '@/components/header/header-2'
import Link from 'next/link'
import Image from 'next/image'
import { GET_STAFF_LIST } from '@/lib/queries/getStaffList'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import dynamic from 'next/dynamic'
const StaffCard = dynamic(() => import('@/components/team/StaffCard'), { ssr: false })

// -------------------------------------------------------------
// Turn this off after confirming categories look right in UI
const DEBUG_CATS = false;
// -------------------------------------------------------------

const lower = (v) => (v ?? '').toString().toLowerCase().trim()

/**
 * Try to extract the *same* subtitle your StaffCard shows under the name.
 * We probe a bunch of common fields/ACF keys and return the first non-empty.
 */
function deriveSubtitle(staff) {
  const candidates = [
    staff?.staff_title,
    staff?.staffTitle,
    staff?.jobTitle,
    staff?.titleLine,
    staff?.position,
    staff?.role,
    staff?.subtitle,
    staff?.acf?.staff_title,
    staff?.acf?.title,
    staff?.acf?.job_title,
    staff?.acf?.jobTitle,
    staff?.acf?.position,
    staff?.acf?.role,
    staff?.acf?.subtitle,
    staff?.excerpt,
    staff?.meta?.subtitle,
  ]
  for (const v of candidates) {
    if (v && String(v).trim()) return String(v).trim()
  }
  return ''
}

/**
 * Bucket logic using the *derived* subtitle first, then fallbacks.
 * Uses word boundaries so "spa" doesn't match "pa", etc.
 */
function pickCategory(staff) {
  const title = lower(deriveSubtitle(staff))
  const has = (re) => re.test(title)

  if (has(/\b(aesthetician|esthetician|medical aesthetician|lead aesthetician|lead medical aesthetician|licensed aesthetician|master aesthetician)\b/)) {
    return 'Aestheticians'
  }
  if (has(/\binjector\b/) || has(/\bnurse\s+injector\b/) || has(/\bnurse\s+practitioner\b/) || has(/\bphysician\s+assistant\b/) || has(/\bmd\b/) || has(/\bdo\b/) || has(/\brn\b/) || has(/\bnp\b/) || has(/\bpa\b/)) {
    return 'Injectors'
  }
  if (has(/\b(front\s*desk|reception|coordinator|support|manager|director|admin|assistant|executive|patient|concierge|operations|ops|lead|team\s*lead)\b/)) {
    return 'Support Staff'
  }

  // broad haystack fallback
  const hay = lower(JSON.stringify(staff || {}))
  const hit = (re) => re.test(hay)
  if (hit(/\b(aesthetician|esthetician)\b/)) return 'Aestheticians'
  if (hit(/\binjector\b|\bnurse\s+injector\b|\brn\b|\bnp\b|\bpa\b|\bnurse\s+practitioner\b/)) return 'Injectors'
  if (hit(/\b(front\s*desk|reception|coordinator|support|manager|director|admin|assistant|executive|concierge|operations|ops)\b/)) {
    return 'Support Staff'
  }
  return 'Massage Therapists'
}

function groupStaff(staffList = []) {
  const groups = {
    Injectors: [],
    Aestheticians: [],
    'Support Staff': [],
    'Massage Therapists': [],
  }

  staffList.forEach((s) => {
    const cat = pickCategory(s)
    groups[cat].push(s)
  })

  const byName = (a, b) =>
    (a?.name || a?.title || a?.slug || '').localeCompare(
      b?.name || b?.title || b?.slug || ''
    )

  Object.keys(groups).forEach((k) => groups[k].sort(byName))
  return groups
}

export async function getStaticProps() {
  const { data } = await client.query({ query: GET_STAFF_LIST })
  return {
    props: {
      staffList: data?.staffs?.nodes || [],
    },
    revalidate: 60,
  }
}

export default function TeamPage({ staffList }) {
  const groups = groupStaff(staffList)
  const order = ['Injectors', 'Aestheticians', 'Massage Therapists', 'Support Staff']
  const nonEmpty = order.filter((k) => (groups[k] || []).length > 0)
  const totalCount = staffList?.length || 0

  // ---------- JSON-LD: ItemList of Person (lightweight) ----------
  const peopleForSchema = (staffList || []).map((s, i) => {
    const job = deriveSubtitle(s) || undefined
    // Try common WP featured image shapes
    const img =
      s?.featuredImage?.node?.sourceUrl ||
      s?.featuredImage?.sourceUrl ||
      s?.image?.sourceUrl ||
      undefined
    return {
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Person",
        "name": s?.name || s?.title || s?.slug || "RELUXE Provider",
        ...(job ? { "jobTitle": job } : {}),
        "url": `https://reluxemedspa.com/team/${s?.slug}`,
        "affiliation": { "@type": "Organization", "name": "RELUXE Med Spa" },
        ...(img ? { "image": img } : {})
      }
    }
  })

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "RELUXE Med Spa Team",
    "itemListElement": peopleForSchema
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://reluxemedspa.com/" },
      { "@type": "ListItem", "position": 2, "name": "Our Team", "item": "https://reluxemedspa.com/team" }
    ]
  }
  // ---------------------------------------------------------------

  return (
    <>
      <Head>
        {/* Title & Meta */}
        <title>Our Team | Expert Injectors & Aestheticians | RELUXE Med Spa Westfield & Carmel</title>
        <meta
          name="description"
          content="Meet the RELUXE Med Spa team in Westfield & Carmel: expert injectors, licensed aestheticians, and concierge support delivering natural, confidence-building results."
        />
        <link rel="canonical" href="https://reluxemedspa.com/team" />

        {/* Open Graph / Twitter */}
        <meta property="og:title" content="RELUXE Med Spa — Meet Our Team" />
        <meta property="og:description" content="Expert injectors & licensed aestheticians in Westfield & Carmel. Get to know the people behind RELUXE." />
        <meta property="og:url" content="https://reluxemedspa.com/team" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta property="og:image" content="https://reluxemedspa.com/images/team/team-header-og.jpg" />
        <meta property="og:image:alt" content="RELUXE Med Spa Team — Westfield & Carmel" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="index,follow,max-image-preview:large" />

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      </Head>

      <HeaderTwo />

      {/* HERO */}
      <section className="relative">
        <div className="relative h-[360px] md:h-[420px]">
          <Image
            src="/images/team/team-header.png"
            alt="RELUXE Med Spa team"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          {/* 70% black overlay for legibility */}
          <div className="absolute inset-0 bg-black/70" aria-hidden="true" />
          <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Meet the Experts Behind RELUXE
            </h1>
            <p className="mt-3 text-white/90 max-w-2xl">
              Expert injectors • Licensed aestheticians • Concierge-level care in Westfield & Carmel
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link href="/services" className="rounded-xl bg-white text-black px-4 py-2 font-semibold hover:bg-neutral-100">
                Explore Services
              </Link>
              <Link href="/locations" className="rounded-xl bg-black text-white px-4 py-2 font-semibold ring-1 ring-white/20 hover:bg-neutral-900">
                See Locations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT THE TEAM (new, stylish, E-E-A-T forward) */}
      <section className="px-4 py-12 md:py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">Patient-first. Results-obsessed.</h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              At RELUXE Med Spa, every plan begins with listening. Our injectors and licensed aestheticians
              pair medical-grade techniques with a modern, artistic approach—so your results look natural, fresh,
              and authentically you. With locations in <strong>Westfield</strong> and <strong>Carmel</strong>, we make it easy
              to see the right expert for Botox &amp; Jeuveau, SkinPen microneedling, facials, IPL, laser hair removal,
              and skin tightening.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-neutral-800">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 mt-[2px]" />
                <span><strong>Licensed & experienced</strong> injectors and aestheticians</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 mt-[2px]" />
                <span><strong>Personalized treatment plans</strong> built around your goals</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 mt-[2px]" />
                <span><strong>Advanced devices</strong>: IPL, ClearLift, SkinPen, Morpheus8, Opus</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 mt-[2px]" />
                <span><strong>Two convenient locations</strong> serving Westfield, Carmel & nearby</span>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/book/consult" className="rounded-xl bg-neutral-900 text-white px-5 py-3 font-semibold hover:bg-neutral-800">Book a Consult</Link>
              <Link href="/services" className="rounded-xl bg-white text-black px-5 py-3 font-semibold ring-1 ring-black/10 hover:bg-neutral-50">View Services</Link>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5">
              <Image
                src="/images/team/team-slide.png"
                alt="RELUXE providers during a patient consultation"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Heading + chips */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-3xl font-bold mb-2">Our Team</h2>
            <p className="text-lg text-gray-600">Every treatment starts with the right provider.</p>
          </div>
          <div className="text-sm text-gray-500">{totalCount} total</div>
        </div>

        {nonEmpty.length > 0 && (
          <nav className="mt-6 mb-2 flex flex-wrap gap-2" aria-label="Jump to team category">
            {nonEmpty.map((k) => (
              <a
                key={k}
                href={`#${k.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 rounded-full border text-sm bg-white hover:bg-gray-50"
              >
                {k} ({groups[k].length})
              </a>
            ))}
          </nav>
        )}
      </section>

      {/* Groups */}
      {order.map((k) => {
        const people = groups[k] || []
        if (!people.length) return null
        return (
          <section
            key={k}
            id={k.toLowerCase().replace(/\s+/g, '-')}
            className="py-8 px-4 max-w-7xl mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">{k}</h3>
              <span className="text-sm text-gray-500">{people.length} total</span>
            </div>
            <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
              {people.map((staff) => {
                const subtitle = deriveSubtitle(staff)
                const cat = pickCategory(staff)
                return (
                  <Link
                    key={staff.slug}
                    href={`/team/${staff.slug}`}
                    className="block group h-full relative"
                    aria-label={`View profile for ${staff?.name || staff?.title || 'RELUXE Provider'}`}
                  >
                    {DEBUG_CATS && (
                      <div className="absolute top-2 left-2 z-10 rounded-full bg-black/70 text-white text-[10px] px-2 py-0.5">
                        {cat} · {subtitle || '—'}
                      </div>
                    )}
                    
                    <StaffCard staff={staff} />
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Final CTA */}
      <section className="py-12 px-4 max-w-7xl mx-auto text-center">
        <h3 className="text-2xl font-semibold text-neutral-900">Ready to meet your provider?</h3>
        <p className="mt-2 text-neutral-700">Book a consultation at Westfield or Carmel and we’ll tailor a plan to you.</p>
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/book" className="inline-flex items-center justify-center rounded-xl bg-black text-white px-5 py-3 font-semibold hover:bg-neutral-800">
            Book Now
          </Link>
          <Link href="/locations" className="inline-flex items-center justify-center rounded-xl bg-white text-black px-5 py-3 font-semibold ring-1 ring-black/10 hover:bg-neutral-50">
            Locations
          </Link>
        </div>
      </section>
    </>
  )
}
