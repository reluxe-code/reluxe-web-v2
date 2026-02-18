// src/pages/locations/[slug].js

import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '@/components/header/header-2'
import ServiceCategorySlider from '@/components/services/ServiceCategorySlider'
import { serviceCategories } from '@/data/ServiceCategories'
import { FiHelpCircle, FiChevronDown } from 'react-icons/fi'
import Map from '@/components/Map'
import LocationOverview from '@/components/locations/LocationOverview'
import CollaborationSection from '@/components/locations/CollaborationSection'
import DealsCarousel from '@/components/deals/DealsCarousel'
import { getDealsSSR } from '@/lib/deals';
import ForceLocation from '@/components/location/ForceLocation';
import { getServiceClient } from '@/lib/supabase';
import { toWPStaffShape } from '@/lib/staff-helpers';


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

  return { props: { location, staff, deals: locationDeals } }
}

export default function LocationDetail({ location, staff, deals = [] }) {
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

      {/* Hero */}
      <section className="bg-white py-16 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
              {f.fullAddress && <p className="text-gray-600 text-lg mb-2">{f.fullAddress}</p>}
              {(f.city || f.state || f.zip) && (
                <p className="text-gray-500 mb-4">{f.city}{f.city && (f.state || f.zip) ? ',' : ''} {f.state} {f.zip}</p>
              )}
              {f.phone && (
                <p className="text-sm text-gray-600">
                  <a href={`tel:${f.phone}`} className="underline">{f.phone}</a>
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-4">
                <a href="#overview" className="bg-black text-white px-5 py-2 rounded-md text-sm font-semibold">About this Location</a>
                <a href="#directions" className="border border-black px-5 py-2 rounded-md text-sm font-semibold">Get Directions</a>
                <a href="/services" className="border border-black px-5 py-2 rounded-md text-sm font-semibold">View Services</a>
              </div>
            </div>
            <div className="flex-1">
              <img
                src={location.featuredImage?.node?.sourceUrl || '/images/location-hero-placeholder.jpg'}
                alt={title}
                className="rounded-xl shadow-lg object-cover w-full h-[550px]"
              />
            </div>
          </div>
        </div>
      </section>

      <LocationOverview
        id="overview"
        locationSlug={slug}
        title={title}
        phone={f.phone}
      />

      <CollaborationSection
        locationSlug={slug}
        partnerName="House of Health"
        partnerLead="Dr. Tracy Warhop & team"
        partnerUrl="/partners/house-of-health"
      />

      {/* Services Slider */}
      <section className="w-full bg-azure">
        <ServiceCategorySlider items={serviceCategories} showOnlyFeatured={false} />
      </section>

      {/* Meet the Experts */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-2">Meet the Experts Behind RELUXE {title}</h2>
        <p className="text-lg text-gray-600 mb-8">Every treatment starts with the right provider.</p>
        {staff?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {staff.map(s => (
              <Link
                key={s.slug}
                href={`/team/${s.slug}`}
                className="group block text-center hover:shadow-md transition p-2 rounded-lg bg-white"
              >
                <img
                  src={s.featuredImage?.node?.sourceUrl || '/images/avatar-placeholder.png'}
                  alt={s.title}
                  className="w-50 h-50 mx-auto object-cover"
                />
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.staffFields?.role}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        {/* Hours / Directions / Map */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Hours */}
          <div className="bg-white rounded-2xl shadow-xl border-l-4 border-reluxeGold p-8 transform hover:-translate-y-2 transition duration-300">
            <div className="flex items-center mb-6 space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-reluxeGold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-800">Hours</h2>
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
          <div id="directions" className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">Getting Here</h2>
            {f.directions465 && <p className="text-sm text-gray-600 mb-2"><strong>From 465:</strong> {f.directions465}</p>}
            {f.directionssouth && <p className="text-sm text-gray-600 mb-2"><strong>From South:</strong> {f.directionssouth}</p>}
            {f.directionsnorth && <p className="text-sm text-gray-600"><strong>From North:</strong> {f.directionsnorth}</p>}
          </div>

          {/* Map */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">Map</h2>
            <Map lat={f.locationMap?.latitude} lng={f.locationMap?.longitude} />
          </div>
        </div>

        {/* Gallery */}
        {f.gallery?.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">See What&apos;s Happening at {title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {f.gallery.map((item, idx) => (
                <div key={idx} className="overflow-hidden rounded-xl shadow">
                  <img
                    src={item.url.sourceUrl}
                    alt={item.url.altText || `Gallery image ${idx + 1}`}
                    className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300 ease-in-out"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deals */}
        <div className="bg-gray-50 rounded-xl p-6">
          <DealsCarousel deals={deals} autoAdvance={false} />
        </div>

        {/* FAQs */}
        <section className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex flex-col lg:flex-row items-center gap-6 mb-8">
            <FiHelpCircle className="h-16 w-16 text-reluxeGold mx-auto lg:mx-0" />
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Got Questions?</h2>
              <p className="text-gray-600 mt-2">
                We&apos;ve gathered the answers to our most common FAQs to help you prepare for your visit.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group border border-gray-200 rounded-lg overflow-hidden">
                <summary className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-reluxeGold/10 transition-colors">
                  <span className="font-medium text-gray-800 group-open:text-reluxeGold">
                    {faq.question}
                  </span>
                  <FiChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-open:rotate-180 group-open:text-reluxeGold" />
                </summary>
                <div className="p-4 text-gray-700 bg-white">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      </section>
    </>
  )
}
