// src/pages/locations/[slug].js

import { gql } from '@apollo/client'
import client from '@/lib/apollo'
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '@/components/header/header-2'
import HotDealsSection from '@/components/home-page/HotDealsSection'
import ServiceCategorySlider from '@/components/services/ServiceCategorySlider'
import { serviceCategories } from '@/data/ServiceCategories'
import { GET_STAFF_LIST } from '@/lib/queries/getStaffList'
import { FiHelpCircle, FiChevronDown } from 'react-icons/fi'
import Map from '@/components/Map'
import LocationOverview from '@/components/locations/LocationOverview'         
import CollaborationSection from '@/components/locations/CollaborationSection' 
import DealsCarousel from '@/components/deals/DealsCarousel'
import { getDealsSSR } from '@/lib/deals';
import ForceLocation from '@/components/location/ForceLocation';


export async function getStaticPaths() {
  const { data } = await client.query({
    query: gql`
      query {
        locations(first: 100) {
          nodes { slug }
        }
      }
    `
  })

  const paths = data?.locations?.nodes?.map(l => ({ params: { slug: l.slug } })) || []
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  // helper: normalize any deal "locations" field into an array of slugs
  const getDealLocationSlugs = (d = {}) => {
    const acf = d.raw?.acf || {};
    const raw =
      d.locations ??
      acf.locations ??
      acf.location ??
      acf.location_slugs ??
      [];
    const arr = Array.isArray(raw) ? raw : [raw];
    // each entry can be a string or { slug } or { value: { slug } }
    return arr
      .map((x) =>
        typeof x === 'string'
          ? x
          : x?.slug ?? x?.value?.slug ?? x?.value ?? ''
      )
      .map((s) => String(s).trim().toLowerCase())
      .filter(Boolean);
  };

  const LOCATION_QUERY = gql`
    query GetLocationDetail($slug: String!) {
      locationBy(slug: $slug) {
        title
        slug
        featuredImage { node { sourceUrl } }
        locationFields {
          fullAddress
          city
          state
          zip
          phone
          email
          directionssouth
          directionsnorth
          directions465
          locationMap { latitude longitude }
          hours { sunday monday tuesday wednesday thursday friday saturday }
          faqs { question answer }
          gallery { url { sourceUrl altText } }
        }
      }
    }
  `

  const [{ data: locData }, { data: staffListData }] = await Promise.all([
    client.query({ query: LOCATION_QUERY, variables: { slug: params.slug } }),
    client.query({ query: GET_STAFF_LIST })
  ])

  const location  = locData.locationBy || {}
  const staffList = staffListData.staffs?.nodes || []

  // normalize page slug (from URL) for comparison
  const pageSlug = String(params.slug || '').trim().toLowerCase()

  // helper: normalize staffFields.location (array OR single) -> array of slugs
  const getLocationSlugs = (locField) => {
    if (!locField) return []
    const arr = Array.isArray(locField) ? locField : [locField]
    return arr
      .map(l => String(l?.slug || '').trim().toLowerCase())
      .filter(Boolean)
  }

  // filtered staff for this page's location
  const staff = staffList.filter(s => {
    const slugs = getLocationSlugs(s?.staffFields?.location)
    return slugs.includes(pageSlug)
  })

  // ✅ fetch deals (same as Home) and filter to this location (if deal has locations)
  let allDeals = [];
  try {
    allDeals = await getDealsSSR();
  } catch {
    allDeals = [];
  }
  const locationDeals = allDeals.filter((d) => {
    const slugs = getDealLocationSlugs(d);
    // if a deal has no location targeting, show it everywhere
    return slugs.length === 0 || slugs.includes(pageSlug);
  });

  return { props: { location, staff, deals: locationDeals }, }

}

export default function LocationDetail({ location, staff, deals = [] }) {
  const f     = location.locationFields || {}
  const title = location.title || 'RELUXE Location'
  const slug  = String(location.slug || '').toLowerCase()

  // ACF hours table normalization
  const rawHours = f.hours || []
  const hours    = Array.isArray(rawHours) ? (rawHours[0] || {}) : rawHours

  const faqs = f.faqs?.length
    ? f.faqs
    : [
        { question: 'Do you accept walk-ins?', answer: 'Appointments are preferred; walk-ins are accommodated when the schedule allows.' },
        { question: 'I’m new—can I do a consult first?', answer: 'Yes! We offer consults to map goals and dosing. If appropriate, treatment can be done the same day.' },
        { question: 'What services are available?', answer: 'Injectables (Botox®, Jeuveau®, fillers), facials, IPL/photofacials, laser hair removal, body contouring, and massage.' },
        { question: 'Is parking easy?', answer: 'Both our Westfield & Carmel locations have convenient, free parking on-site.' },
        { question: 'Who performs treatments?', answer: 'NP and RN injectors for injectables; licensed aestheticians for skin and lasers; licensed massage therapists for massage.' },
        { question: 'Do you take gift cards or financing?', answer: 'Yes—RELUXE accepts SpaFinder gift cards and offers Cherry payment plans for eligible purchases.' },
      ]

  return (
    <>
    <ForceLocation loc={slug} />
      <Head>
        <title>RELUXE Med Spa {title} | Expert Botox, Facials & Aesthetic Treatments in Hamilton County</title>
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
                  📞 <a href={`tel:${f.phone}`} className="underline">{f.phone}</a>
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

      {/* ✅ New: Overview for BOTH locations (copy varies by slug) */}
      <LocationOverview
        id="overview"
        locationSlug={slug}
        title={title}
        phone={f.phone}
      />

      {/* ✅ New: Collaboration callout (Carmel only) */}
      <CollaborationSection
        locationSlug={slug}
        partnerName="House of Health"
        partnerLead="Dr. Tracy Warhop & team"
        partnerUrl="/partners/house-of-health"   // update if you have a dedicated page or external URL
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
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">🗺️ Getting Here</h2>
            {f.directions465 && <p className="text-sm text-gray-600 mb-2"><strong>From 465:</strong> {f.directions465}</p>}
            {f.directionssouth && <p className="text-sm text-gray-600 mb-2"><strong>From South:</strong> {f.directionssouth}</p>}
            {f.directionsnorth && <p className="text-sm text-gray-600"><strong>From North:</strong> {f.directionsnorth}</p>}
          </div>

          {/* Map */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">📍 Map</h2>
            <Map lat={f.locationMap?.latitude} lng={f.locationMap?.longitude} />
          </div>
        </div>

        {/* Gallery */}
        {f.gallery?.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">📸 See What’s Happening at {title}</h2>
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
                We’ve gathered the answers to our most common FAQs to help you prepare for your visit.
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
