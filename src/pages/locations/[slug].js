// src/pages/locations/[slug].js

import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import HeaderTwo from '@/components/header/header-2'
import { FiHelpCircle, FiChevronDown, FiPhone, FiMapPin } from 'react-icons/fi'
import Map from '@/components/Map'

const LocationMap = dynamic(
  () => import('@/components/locations/LocationMap'),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl" /> }
)
import LocationOverview from '@/components/locations/LocationOverview'
import CollaborationSection from '@/components/locations/CollaborationSection'
import LocationServicesGrid from '@/components/locations/LocationServicesGrid'
import WhyChooseLocation from '@/components/locations/WhyChooseLocation'
import CrossLocationCTA from '@/components/locations/CrossLocationCTA'
import DealsCarousel from '@/components/deals/DealsCarousel'
import { getDealsSSR } from '@/lib/deals'
import ForceLocation from '@/components/location/ForceLocation'
import { getServiceClient } from '@/lib/supabase'
import { getTestimonialsSSR } from '@/lib/testimonials'
import TestimonialWidget from '@/components/testimonials/TestimonialWidget'
import { toWPStaffShape } from '@/lib/staff-helpers'


export async function getStaticPaths() {
  const sb = getServiceClient()
  const { data } = await sb.from('locations').select('slug')
  const paths = (data || []).map(l => ({ params: { slug: l.slug } }))
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const sb = getServiceClient()
  const pageSlug = String(params.slug || '').trim().toLowerCase()

  // Fetch location + all staff in parallel
  const [{ data: locRows }, { data: staffRows }] = await Promise.all([
    sb.from('locations').select('*').eq('slug', pageSlug).limit(1),
    sb.from('staff').select('*').eq('status', 'published').order('sort_order').order('name'),
  ])

  const loc = locRows?.[0]
  if (!loc) return { notFound: true }

  // Transform to WP-compatible shape for the page component
  const location = {
    title: loc.name || '',
    slug: loc.slug,
    featuredImage: loc.featured_image
      ? { node: { sourceUrl: loc.featured_image } }
      : null,
    locationFields: {
      fullAddress: loc.full_address || null,
      city: loc.city || null,
      state: loc.state || 'IN',
      zip: loc.zip || null,
      phone: loc.phone || null,
      email: loc.email || null,
      directionssouth: loc.directions_south || null,
      directionsnorth: loc.directions_north || null,
      directions465: loc.directions_465 || null,
      locationMap: (loc.lat && loc.lng) ? { latitude: loc.lat, longitude: loc.lng } : null,
      hours: loc.hours || {},
      faqs: Array.isArray(loc.faqs) ? loc.faqs : [],
      gallery: Array.isArray(loc.gallery)
        ? loc.gallery.map(g => ({ url: { sourceUrl: g.url, altText: g.alt || '' } }))
        : [],
    },
  }

  // Filter staff by location
  const allStaffWP = (staffRows || []).map(toWPStaffShape)
  const staff = allStaffWP.filter(s => {
    const locs = s?.staffFields?.location || []
    const arr = Array.isArray(locs) ? locs : [locs]
    return arr.some(l => String(l?.slug || '').toLowerCase() === pageSlug)
  })

  // Fetch deals filtered to this location
  let allDeals = [];
  try {
    allDeals = await getDealsSSR();
  } catch {
    allDeals = [];
  }
  const locationDeals = allDeals.filter((d) => {
    const slugs = Array.isArray(d.locations) ? d.locations : [];
    return slugs.length === 0 || slugs.includes(pageSlug);
  });

  const testimonials = await getTestimonialsSSR({ location: pageSlug, limit: 20 })

  return { props: { location, staff, deals: locationDeals, testimonials }, revalidate: 3600 }
}

export default function LocationDetail({ location, staff, deals = [], testimonials = [] }) {
  const f     = location.locationFields || {}
  const title = location.title || 'RELUXE Location'
  const slug  = String(location.slug || '').toLowerCase()

  // Hours normalization
  const rawHours = f.hours || {}
  const hours    = Array.isArray(rawHours) ? (rawHours[0] || {}) : rawHours

  const faqs = f.faqs?.length
    ? f.faqs
    : [
        { question: 'Do you accept walk-ins?', answer: 'Appointments are preferred; walk-ins are accommodated when the schedule allows.' },
        { question: 'I\u2019m new\u2014can I do a consult first?', answer: 'Yes! We offer consults to map goals and dosing. If appropriate, treatment can be done the same day.' },
        { question: 'What services are available?', answer: 'Injectables (Botox\u00AE, Jeuveau\u00AE, fillers), facials, IPL/photofacials, laser hair removal, body contouring, and massage.' },
        { question: 'Is parking easy?', answer: 'Both our Westfield & Carmel locations have convenient, free parking on-site.' },
        { question: 'Who performs treatments?', answer: 'NP and RN injectors for injectables; licensed aestheticians for skin and lasers; licensed massage therapists for massage.' },
        { question: 'Do you take gift cards or financing?', answer: 'Yes\u2014RELUXE accepts SpaFinder gift cards and offers Cherry payment plans for eligible purchases.' },
      ]

  const cityName = f.city || title.replace('RELUXE Med Spa ', '');
  const stateName = f.state || 'IN';
  const seoTitle = `RELUXE Med Spa ${cityName}, ${stateName} | Botox, Facials & Aesthetic Treatments`;
  const seoDesc = `Visit RELUXE Med Spa in ${cityName}, ${stateName}. Expert Botox, fillers, facials, laser treatments & body contouring. ${f.fullAddress ? f.fullAddress + '.' : ''} Call ${f.phone || '(317) 763-1142'} to book.`;
  const pageUrl = `https://reluxemedspa.com/locations/${location.slug}`;
  const seoImage = location.featuredImage?.node?.sourceUrl || 'https://reluxemedspa.com/images/locations/location-hero.jpg';

  const locationBadge = slug === 'carmel' ? 'Newest Location' : 'Flagship';

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: `RELUXE Med Spa ${cityName}`,
    image: seoImage,
    url: pageUrl,
    telephone: f.phone || '(317) 763-1142',
    address: {
      '@type': 'PostalAddress',
      streetAddress: f.fullAddress || '',
      addressLocality: f.city || cityName,
      addressRegion: f.state || 'IN',
      postalCode: f.zip || '',
      addressCountry: 'US',
    },
    ...(f.locationMap?.latitude && f.locationMap?.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: f.locationMap.latitude,
        longitude: f.locationMap.longitude,
      },
    }),
    openingHoursSpecification: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
      .filter(day => hours[day] && hours[day] !== 'Closed')
      .map(day => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
        opens: hours[day]?.split('\u2013')?.[0]?.trim() || '',
        closes: hours[day]?.split('\u2013')?.[1]?.trim() || '',
      })),
    priceRange: '$$',
    medicalSpecialty: 'Dermatology',
  };

  const faqSchema = faqs.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  } : null;

  return (
    <>
    <ForceLocation loc={slug} />
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:type" content="place" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={seoImage} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      </Head>

      <HeaderTwo />

      {/* ── HERO — clean & minimal with map ── */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-azure/30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">
            {/* Left — text */}
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[11px] tracking-[0.2em] uppercase font-medium text-gray-500 border border-gray-200 px-3 py-1 rounded-full mb-5">
                {locationBadge}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.05] mb-6">
                {title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-gray-500 mb-8">
                {f.fullAddress && (
                  <span className="flex items-center gap-2">
                    <FiMapPin className="h-4 w-4 shrink-0" />
                    {f.fullAddress}
                  </span>
                )}
                {f.phone && (
                  <a href={`tel:${f.phone}`} className="flex items-center gap-2 hover:text-gray-900 transition">
                    <FiPhone className="h-4 w-4 shrink-0" />
                    {f.phone}
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#services"
                  className="bg-gray-900 text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition"
                >
                  Explore Services
                </a>
                <a
                  href="#directions"
                  className="border border-gray-300 text-gray-700 px-7 py-3 rounded-full text-sm font-semibold hover:border-gray-900 hover:text-gray-900 transition"
                >
                  Get Directions
                </a>
                <a
                  href="#team"
                  className="border border-gray-300 text-gray-700 px-7 py-3 rounded-full text-sm font-semibold hover:border-gray-900 hover:text-gray-900 transition"
                >
                  Meet the Team
                </a>
              </div>
            </div>

            {/* Right — map */}
            <div className="lg:w-[420px] xl:w-[480px] shrink-0">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-[300px] lg:h-[340px]">
                <LocationMap locationSlug={slug} />
              </div>
            </div>
          </div>
        </div>
        {/* subtle bottom border */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </section>

      {/* ── OVERVIEW ── */}
      <LocationOverview
        id="overview"
        locationSlug={slug}
        title={title}
        phone={f.phone}
      />

      {/* ── COLLABORATION (Carmel only) ── */}
      <CollaborationSection
        locationSlug={slug}
        partnerName="House of Health"
        partnerLead="Dr. Tracy Warhop & team"
        partnerUrl="/partners/house-of-health"
      />

      {/* ── WHY CHOOSE THIS LOCATION ── */}
      <WhyChooseLocation locationSlug={slug} />

      {/* ── SERVICES GRID (location-filtered) ── */}
      <div id="services" className="bg-azure">
        <LocationServicesGrid locationSlug={slug} />

        {/* ── WESTFIELD-ONLY NOTE (Carmel page only) ── */}
        {slug === 'carmel' && (
          <div className="max-w-7xl mx-auto px-4 pb-12">
            <div className="border-l-2 border-violet-400 bg-white/60 rounded-r-lg px-4 py-3 max-w-2xl mx-auto">
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-violet-600">Looking for CO₂, Massage, HydraFacial, or Opus?</span>{' '}
                A handful of services are offered exclusively at our Westfield location. We&apos;re happy to get you scheduled there —{' '}
                <Link href="/locations/westfield#services" className="text-violet-600 font-medium underline underline-offset-2 hover:text-violet-800 transition">view Westfield services</Link>{' '}
                or call <a href="tel:3177631142" className="text-violet-600 font-medium underline underline-offset-2 hover:text-violet-800 transition">(317) 763-1142</a>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <TestimonialWidget
          testimonials={testimonials}
          heading={`What Patients Say About ${cityName}`}
          subheading={`Real reviews from our ${cityName} location.`}
        />
      )}

      {/* ── MEET THE EXPERTS ── */}
      <section id="team" className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs tracking-widest uppercase text-gray-500 mb-2">Our Team</span>
          <h2 className="text-3xl md:text-4xl font-bold">Meet the Experts at {cityName}</h2>
          <p className="text-lg text-gray-600 mt-2">Every treatment starts with the right provider.</p>
        </div>
        {staff?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {staff.map(s => (
              <Link
                key={s.slug}
                href={`/team/${s.slug}`}
                className="group block text-center hover:shadow-lg transition rounded-2xl bg-white overflow-hidden border border-gray-100"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={s.featuredImage?.node?.sourceUrl || '/images/avatar-placeholder.png'}
                    alt={s.title || 'Team member'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.staffFields?.role}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── DETAILS: Hours / Directions / Map ── */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hours */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition">
            <div className="flex items-center mb-5 space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">Hours</h2>
            </div>
            <div className="space-y-2 text-gray-700">
              {['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].map(day => (
                <div key={day} className="flex justify-between">
                  <span className="capitalize font-medium">{day}</span>
                  <span className="font-light">{hours[day] ?? 'Closed'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Getting Here */}
          <div id="directions" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">Getting Here</h2>
            {f.directions465 && <p className="text-sm text-gray-600 mb-3"><strong>From 465:</strong> {f.directions465}</p>}
            {f.directionssouth && <p className="text-sm text-gray-600 mb-3"><strong>From South:</strong> {f.directionssouth}</p>}
            {f.directionsnorth && <p className="text-sm text-gray-600"><strong>From North:</strong> {f.directionsnorth}</p>}
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">Map</h2>
            <Map lat={f.locationMap?.latitude} lng={f.locationMap?.longitude} />
          </div>
        </div>

        {/* Gallery */}
        {f.gallery?.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">See What&apos;s Happening at {cityName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {f.gallery.map((item, idx) => (
                <div key={idx} className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm">
                  <Image
                    src={item.url.sourceUrl}
                    alt={item.url.altText || `Gallery image ${idx + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300 ease-in-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deals */}
        {deals?.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-6">
            <DealsCarousel deals={deals} autoAdvance={false} />
          </div>
        )}

        {/* FAQs */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row items-center gap-6 mb-8">
            <FiHelpCircle className="h-14 w-14 text-violet-600 mx-auto lg:mx-0 shrink-0" />
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Got Questions?</h2>
              <p className="text-gray-600 mt-2">
                We&apos;ve gathered the answers to our most common FAQs to help you prepare for your visit.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-violet-50 transition-colors">
                  <span className="font-medium text-gray-800 group-open:text-violet-600">
                    {faq.question}
                  </span>
                  <FiChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-open:rotate-180 group-open:text-violet-600 shrink-0 ml-3" />
                </summary>
                <div className="p-4 text-gray-700 bg-white">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      </section>

      {/* ── CROSS-LOCATION CTA ── */}
      <CrossLocationCTA locationSlug={slug} />
    </>
  )
}
