// src/pages/team/[slug].js

import Head from 'next/head'
import HeaderTwo from '@/components/header/header-2'
import dynamic from 'next/dynamic'
import HeroSplitSection from '@/components/team/HeroSplitSection'
import MoreAboutMeSliderSection from '@/components/team/MoreAboutMeSliderSection'
import { getServiceClient } from '@/lib/supabase'
import { toWPStaffShape } from '@/lib/staff-helpers'
import { getTestimonialsSSR } from '@/lib/testimonials'
import TestimonialWidget from '@/components/testimonials/TestimonialWidget'

// 🚫 SSR can mismatch on browser-only code inside sliders/galleries.
// ✅ Load ResultsSection only on the client to avoid hydration errors.
const ResultsSection = dynamic(() => import('@/components/gallery/ResultsSection'), {
  ssr: false,
  loading: () => null,
})

// —————————————————————————————————————————————
// Data fetching
// —————————————————————————————————————————————
export async function getStaticPaths() {
  const sb = getServiceClient()
  const { data } = await sb
    .from('staff')
    .select('slug')
    .eq('status', 'published')

  const paths = (data || [])
    .filter((s) => s?.slug)
    .map((s) => ({ params: { slug: s.slug } }))

  return { paths, fallback: 'blocking' }
}

// Generate a stable, server-only rotation key to avoid SSR/CSR mismatch
function buildRotationKey(d = new Date()) {
  const startOfYearUTC = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const ms = d - startOfYearUTC
  const dayMs = 86400000
  const week = Math.ceil(((ms / dayMs) + startOfYearUTC.getUTCDay() + 1) / 7)
  return `${d.getUTCFullYear()}-W${week}`
}

export async function getStaticProps({ params }) {
  const sb = getServiceClient()
  const { data } = await sb
    .from('staff')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .limit(1)

  const row = data?.[0]
  if (!row) return { notFound: true }

  // Transform to WP shape so all downstream components work unchanged
  const person = toWPStaffShape(row)

  // ✅ compute on server, serialize to client
  const rotationKey = buildRotationKey()

  // Fetch testimonials for this provider by first name
  const firstName = (row.name || '').split(/\s/)[0]
  const testimonials = firstName ? await getTestimonialsSSR({ provider: firstName, limit: 15 }) : []

  return {
    props: { person, rotationKey, testimonials },
    revalidate: 300,
  }
}

// —————————————————————————————————————————————
// Helpers
// —————————————————————————————————————————————
const SPECIALTY_ASSETS = [
  { key: /tox|botox|jeuveau|xeomin|dysport/i, title: 'Tox',       img: '/images/service/210x70/jeuveau.png', href: '/services/tox', slug: 'tox' },
  { key: /filler|lip/i,                         title: 'Filler',    img: '/images/service/210x70/filler.png',  href: '/services/filler', slug: 'filler' },
  { key: /sculptra/i,                           title: 'Sculptra',  img: '/images/service/210x70/sculptra.png',href: '/services/sculptra', slug: 'sculptra' },
  { key: /morpheus/i,                           title: 'Morpheus8', img: '/images/service/210x70/m8.png',      href: '/services/morpheus8', slug: 'morpheus8' },
  { key: /skinpen|microneed/i,                  title: 'SkinPen',   img: '/images/service/210x70/skinpen.png', href: '/services/skinpen', slug: 'skinpen' },
  { key: /ipl|photofacial/i,                    title: 'IPL',       img: '/images/service/210x70/ipl.png',     href: '/services/ipl', slug: 'ipl' },
  { key: /laser hair/i,                         title: 'Hair Removal', img: '/images/service/210x70/lhr.png',  href: '/services/laser-hair-removal', slug: 'laser-hair-removal' },
  { key: /hydrafacial/i,                        title: 'HydraFacial', img: '/images/service/210x70/hydrafacial.png', href: '/services/hydrafacial', slug: 'hydrafacial' },
  { key: /glo2/i,                               title: 'Glo2Facial', img: '/images/service/210x70/glo2.png',   href: '/services/glo2facial', slug: 'glo2facial' },
]

const BOOK_WESTFIELD_DEFAULT = '/book/westfield'
const BOOK_CARMEL_DEFAULT    = '/book/carmel'

function brandItemsFromSpecialties(specialties = []) {
  const items = []
  const seen = new Set()
  specialties.forEach((sObj) => {
    const name = (sObj?.specialty || '').trim()
    if (!name) return
    const match = SPECIALTY_ASSETS.find(a => a.key.test(name))
    if (match && !seen.has(match.title)) {
      seen.add(match.title)
      items.push({
        id: items.length + 1,
        title: match.title,
        href: match.href,
        slug: match.slug,
      })
    }
  })
  return items
}

function formatCredentialsHTML(credentials = []) {
  const list = credentials.map(c => c?.credentialItem).filter(Boolean)
  return list.length ? list.join('<br/>') : ''
}
function formatAvailabilityHTML(avail = []) {
  const list = avail
    .filter(a => a?.day && a?.hours)
    .map(a => `${a.day}: ${a.hours}`)
  return list.length ? list.join('<br/>') : ''
}
function formatSpecialtiesHTML(specialties = []) {
  const list = specialties.map(s => s?.specialty).filter(Boolean)
  return list.length ? list.join('<br/>') : ''
}

function buildBookingHref({ location, serviceSlug }) {
  const base = location === 'carmel' ? BOOK_CARMEL_DEFAULT : BOOK_WESTFIELD_DEFAULT
  return serviceSlug ? `${base}?service=${encodeURIComponent(serviceSlug)}` : base
}

function getLocationFlagsFromAcfLocation(acfLocation) {
  const locs = Array.isArray(acfLocation) ? acfLocation : (acfLocation ? [acfLocation] : [])
  let carmel = false
  let westfield = false
  for (const l of locs) {
    const s = String(l?.slug || l?.title || '').toLowerCase()
    if (s.includes('carmel')) carmel = true
    if (s.includes('westfield')) westfield = true
  }
  return { carmel, westfield }
}

// —————————————————————————————————————————————
// Page
// —————————————————————————————————————————————
export default function StaffProfile({ person, rotationKey, testimonials = [] }) {
  const f = person?.staffFields || {}

  const specialties = f?.specialties || []
  const credentials = f?.credentials || []
  const availability = f?.availability || []
  const socials = f?.socialProfiles || []

  const transparentBgUrl = f?.transparentbg?.sourceUrl || f?.transparentbg?.mediaItemUrl || null
  const featuredUrl = person?.featuredImage?.node?.sourceUrl || null
  const heroImageUrl = transparentBgUrl || featuredUrl

  const brandItems = brandItemsFromSpecialties(specialties)
  const { carmel, westfield } = getLocationFlagsFromAcfLocation(f?.location)

  const credentialsHTML  = formatCredentialsHTML(credentials)
  const availabilityHTML = formatAvailabilityHTML(availability)
  const specialtiesHTML  = formatSpecialtiesHTML(specialties)

  const seoTitle = `${person.title}${f?.stafftitle ? `, ${f.stafftitle}` : ''} | RELUXE Med Spa Team`;
  const seoDesc = `Meet ${person.title}${f?.stafftitle ? `, ${f.stafftitle}` : ''} at RELUXE Med Spa in Carmel & Westfield, IN.${specialties.length ? ` Specializing in ${specialties.slice(0,3).map(s=>s.specialty).join(', ')}.` : ''} Book your appointment today.`;
  const pageUrl = `https://reluxemedspa.com/team/${person.slug}`;
  const seoImage = heroImageUrl || 'https://reluxemedspa.com/images/team/team-hero.jpg';

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.title,
    jobTitle: f?.stafftitle || undefined,
    image: seoImage,
    url: pageUrl,
    worksFor: {
      '@type': 'MedicalBusiness',
      name: 'RELUXE Med Spa',
      url: 'https://reluxemedspa.com',
    },
    ...(specialties.length && {
      knowsAbout: specialties.map(s => s.specialty).filter(Boolean),
    }),
  };

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={seoImage} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      </Head>

      <HeaderTwo />

      <section className="w-full bg-azure">
        <div className="max-w-5xl mx-auto px-6">
          <HeroSplitSection
            name={person.title}
            subtitle={f?.stafftitle || ''}
            bio={(f?.staffBio || '').replace(/<[^>]*>/g, '')}
            imageUrl={heroImageUrl}
            locations={f?.location}
            socials={socials}
          />
        </div>
      </section>

      <section name="XXXX" className="w-full bg-white">
        {/* ✅ ResultsSection loads only on the client; rotationKey is server-stable */}
        <ResultsSection providerSlug={person.title} rotationKey={rotationKey} />
      </section>

      <section className="w-full bg-white">
        <MoreAboutMeSliderSection
          title={`About ${person.title}`}
          bio={f?.staffBio || ''}
          backgroundImage={heroImageUrl || '/images/staff/default-blur.png'}
          items={[]}
        />

        <div className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {credentialsHTML && (
            <div className="rounded-2xl border shadow-sm p-5">
              <div className="text-sm uppercase tracking-wide text-gray-500 mb-2">Credentials</div>
              <div className="prose text-sm" dangerouslySetInnerHTML={{ __html: credentialsHTML }} />
              <div className="mt-3 text-xs text-gray-400">Verified</div>
            </div>
          )}
          {availabilityHTML && (
            <div className="rounded-2xl border shadow-sm p-5">
              <div className="text-sm uppercase tracking-wide text-gray-500 mb-2">Availability</div>
              <div className="prose text-sm" dangerouslySetInnerHTML={{ __html: availabilityHTML }} />
              <div className="mt-3 text-xs text-gray-400">Current Hours</div>
            </div>
          )}
          {specialtiesHTML && (
            <div className="rounded-2xl border shadow-sm p-5">
              <div className="text-sm uppercase tracking-wide text-gray-500 mb-2">My Specialties</div>
              <div className="prose text-sm" dangerouslySetInnerHTML={{ __html: specialtiesHTML }} />
              <div className="mt-3 text-xs text-gray-400">Most Popular</div>
            </div>
          )}
        </div>

        {brandItems?.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 mt-10 mb-6">
            <h2 className="text-xl font-semibold mb-4">Book by Specialty</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {brandItems.map(item => {
                const carmelHref    = buildBookingHref({ location: 'carmel', serviceSlug: item.slug })
                const westfieldHref = buildBookingHref({ location: 'westfield', serviceSlug: item.slug })
                return (
                  <div key={item.id} className="rounded-2xl border shadow-sm p-4 flex flex-col">
                    <div className="flex items-center gap-3">
                      <img src={item.clientimage} alt={item.title} className="h-10 w-auto" />
                      <div className="font-semibold">{item.title}</div>
                    </div>
                    <a href={item.href} className="text-sm mt-2 underline">Learn about {item.title}</a>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {carmel && (
                        <a
                          href={carmelHref}
                          className="text-sm inline-flex items-center rounded-lg px-3 py-1 border font-medium hover:bg-gray-50"
                        >
                          Book in Carmel
                        </a>
                      )}
                      {westfield && (
                        <a
                          href={westfieldHref}
                          className="text-sm inline-flex items-center rounded-lg px-3 py-1 border font-medium hover:bg-gray-50"
                        >
                          Book in Westfield
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="mt-10">
            <TestimonialWidget
              testimonials={testimonials}
              heading={`What Patients Say About ${person.title?.split(' ')[0] || 'This Provider'}`}
              subheading={`Reviews from patients treated by ${person.title?.split(' ')[0] || 'this provider'}.`}
              showViewAll={false}
            />
          </div>
        )}

        {f?.videoIntro && (
          <div className="mt-10 max-w-5xl mx-auto px-6">
            <h2 className="text-xl font-semibold mb-2">Intro Video</h2>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={f.videoIntro}
                title={`Video intro by ${person.title}`}
                frameBorder="0"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          </div>
        )}
      </section>
    </>
  )
}
