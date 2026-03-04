// src/pages/best-med-spa/[city].js
// Geo-targeted authority pages for local SEO dominance
// Targets: "best med spa in [city]", "best botox [city]", etc.
import { useState } from 'react'
import { motion } from 'framer-motion'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, typeScale } from '@/components/preview/tokens'
import GravityBookButton from '@/components/beta/GravityBookButton'
import GoogleReviewBadge from '@/components/GoogleReviewBadge'
import { getServiceClient } from '@/lib/supabase'

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

const CITIES = {
  westfield: {
    city: 'Westfield',
    state: 'IN',
    locationKey: 'westfield',
    address: '514 E State Road 32, Westfield, IN 46074',
    phone: '(317) 763-1142',
    hours: 'Mon\u2013Wed, Fri 9am\u20135pm \u00b7 Thu 9am\u20137pm \u00b7 Sat 9am\u20133pm',
    lat: 40.04298,
    lng: -86.12955,
    nearbyAreas: ['Noblesville', 'Fishers', 'Carmel', 'Zionsville', 'North Indianapolis'],
    intro: 'Located on US-32 near Grand Park, our Westfield location was where RELUXE started. Full treatment menu, salt room, infrared sauna, and the expert team that built our reputation from the ground up.',
    whyBest: [
      { title: '5-Star Rated', body: 'Consistently rated 5.0 stars across hundreds of verified patient reviews on Google.' },
      { title: 'Expert Injectors', body: 'Every provider is rigorously trained in anatomy-first injection techniques. Our Medical Director oversees every treatment plan.' },
      { title: 'Transparent Pricing', body: 'No hidden fees, no upselling. You know exactly what you\'ll pay before any treatment. VIP Membership saves 10-15% on everything.' },
      { title: '40+ Treatments', body: 'From Botox and fillers to Morpheus8, laser hair removal, facials, and IV therapy — we have every treatment under one roof.' },
      { title: 'Family Owned', body: 'We\'re not a franchise or corporate chain. RELUXE is locally owned and operated by a family that lives in Hamilton County.' },
      { title: 'Same-Day Availability', body: 'Easy online booking with same-day and next-day appointments frequently available. Extended Thursday hours until 7pm.' },
    ],
    faqs: [
      { q: 'What makes RELUXE the best med spa in Westfield?', a: 'RELUXE is Westfield\'s highest-rated med spa with a 5.0 star average across hundreds of reviews. We offer 40+ treatments, transparent pricing, expert providers overseen by a Medical Director, and a luxury experience that prioritizes results and safety over volume.' },
      { q: 'What treatments are available at the Westfield location?', a: 'Our Westfield location offers the full RELUXE treatment menu: Botox, Dysport, Jeuveau, Daxxify, dermal fillers, Morpheus8, laser hair removal, IPL, facials, chemical peels, HydraFacial, GLO2Facial, SkinPen, and more. We also have a salt room and infrared sauna.' },
      { q: 'How do I book an appointment in Westfield?', a: 'Book online at reluxemedspa.com/book, call us at (317) 763-1142, or text us. Free consultations are available for first-time patients. Same-day appointments are frequently available.' },
      { q: 'Do you offer free consultations?', a: 'Yes — all first-time patients receive a free, no-pressure consultation. Your provider will discuss your goals, recommend treatments, and give you exact pricing before any work is done.' },
      { q: 'What are your hours in Westfield?', a: 'Monday through Wednesday and Friday: 9am-5pm. Thursday: 9am-7pm (extended hours). Saturday: 9am-3pm. We\'re closed on Sundays.' },
      { q: 'Is there parking at the Westfield location?', a: 'Yes — free lot parking is available right outside our door. The location is easy to find on US-32 near Grand Park and Birdies.' },
    ],
  },
  carmel: {
    city: 'Carmel',
    state: 'IN',
    locationKey: 'carmel',
    address: '10485 N Pennsylvania St, Suite 150, Carmel, IN 46280',
    phone: '(317) 763-1142',
    hours: 'Mon\u2013Fri 9am\u20135pm',
    lat: 39.94054,
    lng: -86.16063,
    nearbyAreas: ['Zionsville', 'Westfield', 'North Indianapolis', 'Fishers', 'Noblesville'],
    intro: 'Our Carmel location brings the same obsessive standards and expert providers to south Hamilton County. Partnered with House of Health for IV therapy and a next-level wellness experience.',
    whyBest: [
      { title: '5-Star Rated', body: 'Consistently rated 5.0 stars across hundreds of verified patient reviews on Google.' },
      { title: 'Expert Injectors', body: 'Every provider is rigorously trained in anatomy-first injection techniques. Our Medical Director oversees every treatment plan.' },
      { title: 'Wellness Partnership', body: 'Partnered with House of Health for IV therapy, giving you access to aesthetic and wellness treatments in one visit.' },
      { title: '40+ Treatments', body: 'From Botox and fillers to Morpheus8, laser hair removal, facials, and more — the full RELUXE treatment menu.' },
      { title: 'Transparent Pricing', body: 'No hidden fees. You know what you\'ll pay before treatment. VIP Membership saves 10-15% on everything.' },
      { title: 'Convenient Location', body: 'Easy access off US-31 and 106th Street. Free lot parking and a modern, luxury space designed for comfort.' },
    ],
    faqs: [
      { q: 'What makes RELUXE the best med spa in Carmel?', a: 'RELUXE is one of Carmel\'s highest-rated med spas with a 5.0 star average. We combine expert providers, transparent pricing, 40+ treatments, and a luxury experience. Our Carmel location also partners with House of Health for IV therapy and wellness services.' },
      { q: 'What treatments are available at the Carmel location?', a: 'Our Carmel location offers the full RELUXE treatment menu: Botox, Dysport, Jeuveau, Daxxify, dermal fillers, Morpheus8, laser hair removal, IPL, facials, chemical peels, HydraFacial, GLO2Facial, SkinPen, IV therapy (through House of Health), and more.' },
      { q: 'How do I book an appointment in Carmel?', a: 'Book online at reluxemedspa.com/book, call us at (317) 763-1142, or text us. Free consultations are available for first-time patients. Same-day appointments are frequently available.' },
      { q: 'Do you offer free consultations in Carmel?', a: 'Yes — all first-time patients receive a free, no-pressure consultation. Your provider will discuss your goals, recommend treatments, and give you exact pricing before any work is done.' },
      { q: 'What are your hours in Carmel?', a: 'Monday through Friday: 9am-5pm. We\'re closed on weekends at the Carmel location. Our Westfield location offers Saturday hours if you need weekend availability.' },
      { q: 'Where exactly is the Carmel location?', a: 'We\'re at 10485 N Pennsylvania St, Suite 150, Carmel, IN 46280 — right off US-31 at the 106th Street exit. Free lot parking is available.' },
    ],
  },
  fishers: {
    city: 'Fishers',
    state: 'IN',
    locationKey: null,
    address: null,
    phone: '(317) 763-1142',
    hours: null,
    lat: null,
    lng: null,
    nearbyAreas: ['Carmel', 'Noblesville', 'Westfield', 'Indianapolis', 'Fortville', 'McCordsville'],
    intro: 'RELUXE Med Spa proudly serves Fishers from our two Hamilton County locations in Carmel and Westfield. Our Carmel location is just 6 miles south — about 12 minutes down US-31 or Keystone Parkway. Our Westfield location is 8 miles north — about 15 minutes up SR-37. Both offer the full 40+ treatment menu, free parking, and the same expert team.',
    whyBest: [
      { title: '5-Star Rated', body: 'Consistently 5.0 stars across hundreds of verified Google reviews from Hamilton County patients, including Fishers.' },
      { title: 'Two Locations Near Fishers', body: 'Carmel: 12 min south via US-31 or Keystone Pkwy (10485 N Pennsylvania St, Suite 150). Westfield: 15 min north via SR-37 (514 E State Road 32). Free parking at both.' },
      { title: 'Expert Providers', body: 'Every injector is rigorously trained in anatomy-first techniques. Our Medical Director oversees every treatment plan for safety and results.' },
      { title: '40+ Treatments', body: 'Botox, fillers, Morpheus8, laser hair removal, facials, peels, HydraFacial, IV therapy — everything under one roof at either location.' },
      { title: 'Transparent Pricing', body: 'No hidden fees or upselling. You know exactly what you\'ll pay before treatment. VIP Membership saves 10-15% on everything.' },
      { title: 'Family Owned', body: 'We\'re not a franchise or corporate chain. RELUXE is locally owned and operated by a family that lives in Hamilton County.' },
    ],
    faqs: [
      { q: 'Where is the closest RELUXE location to Fishers?', a: 'Our Carmel location is the closest to most Fishers residents — about 6 miles and 12 minutes south. Take US-31 South or Keystone Parkway to 106th Street. The address is 10485 N Pennsylvania St, Suite 150, Carmel, IN 46280. Our Westfield location is about 8 miles and 15 minutes north — take SR-37 North to SR-32 West. The address is 514 E State Road 32, Westfield, IN 46074.' },
      { q: 'What makes RELUXE the best med spa near Fishers?', a: 'RELUXE is the highest-rated med spa in Hamilton County with a 5.0 star average across hundreds of reviews. We serve Fishers from two convenient locations in Carmel (12 min) and Westfield (15 min), with expert providers overseen by a Medical Director, 40+ treatments, and transparent pricing.' },
      { q: 'What treatments does RELUXE offer for Fishers patients?', a: 'Both our Carmel and Westfield locations offer the full RELUXE treatment menu: Botox, Dysport, Jeuveau, Daxxify, dermal fillers, Morpheus8, Sculptra, laser hair removal, IPL, ClearLift, HydraFacial, GLO2Facial, SkinPen microneedling, chemical peels, IV therapy, and more — 40+ treatments total.' },
      { q: 'Do you offer free consultations for Fishers residents?', a: 'Yes — all first-time patients receive a free, no-pressure consultation at either our Carmel or Westfield location. Your provider discusses your goals, recommends a plan, and gives exact pricing before any treatment.' },
      { q: 'How do I book an appointment from Fishers?', a: 'Book online at reluxemedspa.com/book, call (317) 763-1142, or text us. Select either our Carmel location (closer for south/central Fishers) or Westfield location (closer for north Fishers). Same-day appointments are frequently available.' },
      { q: 'Do you offer financing for treatments?', a: 'Yes — we offer flexible financing through Cherry with plans starting at 0% APR. Apply in seconds with no hard credit check. Our team will help you find a payment option that fits your budget.' },
    ],
  },
  noblesville: {
    city: 'Noblesville',
    state: 'IN',
    locationKey: null,
    address: null,
    phone: '(317) 763-1142',
    hours: null,
    lat: null,
    lng: null,
    nearbyAreas: ['Westfield', 'Fishers', 'Carmel', 'Cicero', 'Arcadia', 'Anderson'],
    intro: 'RELUXE Med Spa proudly serves Noblesville from our Westfield and Carmel locations. Our Westfield location is the closest — just 5 miles and 10 minutes west on SR-32. Our Carmel location is about 13 miles and 20 minutes south via SR-37 to US-31. Both offer the full 40+ treatment menu, free parking, and our expert team.',
    whyBest: [
      { title: '5-Star Rated', body: 'Consistently 5.0 stars across hundreds of verified Google reviews from Hamilton County patients, including Noblesville.' },
      { title: 'Two Locations Nearby', body: 'Westfield: 10 min west on SR-32 (514 E State Road 32). Carmel: 20 min south via SR-37 (10485 N Pennsylvania St, Suite 150). Free parking at both.' },
      { title: 'Expert Providers', body: 'Every injector is rigorously trained in anatomy-first techniques. Our Medical Director oversees every treatment plan for safety and results.' },
      { title: '40+ Treatments', body: 'Botox, fillers, Morpheus8, laser hair removal, facials, peels, HydraFacial, Sculptra, IV therapy — everything under one roof at either location.' },
      { title: 'Transparent Pricing', body: 'No hidden fees or upselling. Exact pricing before any treatment. VIP Membership saves 10-15% on everything.' },
      { title: 'Salt Room & Sauna', body: 'Our Westfield location — the closest to Noblesville — includes a salt room and infrared sauna you won\'t find at other med spas.' },
    ],
    faqs: [
      { q: 'Where is the closest RELUXE location to Noblesville?', a: 'Our Westfield location is the closest — about 5 miles and 10 minutes from downtown Noblesville. Take SR-32 West straight to our door at 514 E State Road 32, Westfield, IN 46074. Our Carmel location is about 13 miles and 20 minutes south — take SR-37 South to US-31 South, exit at 106th Street. The address is 10485 N Pennsylvania St, Suite 150, Carmel, IN 46280.' },
      { q: 'What makes RELUXE the best med spa near Noblesville?', a: 'RELUXE is the highest-rated med spa in Hamilton County with a 5.0 star average across hundreds of reviews. We serve Noblesville from our Westfield location (10 min) and Carmel location (20 min), with expert providers, 40+ treatments, transparent pricing, and a luxury experience focused on results.' },
      { q: 'What treatments does RELUXE offer?', a: 'Both our Westfield and Carmel locations offer the full RELUXE menu: Botox, Dysport, Jeuveau, Daxxify, dermal fillers, Morpheus8, Sculptra, laser hair removal, IPL, ClearLift, HydraFacial, GLO2Facial, SkinPen microneedling, chemical peels, EvolveX, IV therapy, salt room (Westfield), infrared sauna (Westfield), and more — 40+ treatments.' },
      { q: 'Do you offer free consultations for Noblesville patients?', a: 'Yes — all first-time patients receive a free, no-pressure consultation at either our Westfield or Carmel location. Your provider discusses your goals, recommends treatments, and gives you exact pricing before any work is done.' },
      { q: 'How do I book an appointment from Noblesville?', a: 'Book online at reluxemedspa.com/book, call (317) 763-1142, or text us. We recommend our Westfield location for the quickest drive from Noblesville — just 10 minutes on SR-32. Same-day appointments are frequently available.' },
      { q: 'Do you offer a VIP membership?', a: 'Yes — our VIP Membership saves 10-15% on all treatments and includes exclusive perks. It\'s the most popular way for regular patients to save. Ask about membership during your free consultation at either location.' },
    ],
  },
  zionsville: {
    city: 'Zionsville',
    state: 'IN',
    locationKey: null,
    address: null,
    phone: '(317) 763-1142',
    hours: null,
    lat: null,
    lng: null,
    nearbyAreas: ['Carmel', 'Westfield', 'Whitestown', 'Lebanon', 'Indianapolis', 'Brownsburg'],
    intro: 'RELUXE Med Spa proudly serves Zionsville from our Carmel and Westfield locations. Our Carmel location is the closest — just 7 miles and 12 minutes east on 106th Street. Our Westfield location is about 12 miles and 20 minutes northeast via US-421 to SR-32. Both offer the full 40+ treatment menu, free parking, and our expert team.',
    whyBest: [
      { title: '5-Star Rated', body: 'Consistently 5.0 stars across hundreds of verified Google reviews. Zionsville patients choose RELUXE for results, safety, and experience.' },
      { title: 'Two Locations Nearby', body: 'Carmel: 12 min east on 106th St (10485 N Pennsylvania St, Suite 150). Westfield: 20 min northeast via US-421 (514 E State Road 32). Free parking at both.' },
      { title: 'Expert Providers', body: 'Every injector is rigorously trained in anatomy-first techniques. Our Medical Director oversees every treatment plan for safety and results.' },
      { title: '40+ Treatments', body: 'Botox, fillers, Morpheus8, Sculptra, laser hair removal, facials, peels, HydraFacial, IV therapy — everything under one roof at either location.' },
      { title: 'Transparent Pricing', body: 'No hidden fees or upselling. You know exactly what you\'ll pay before treatment. VIP Membership saves 10-15% on everything.' },
      { title: 'Wellness Partnership', body: 'Our Carmel location — the closest to Zionsville — partners with House of Health for IV therapy and wellness treatments in one visit.' },
    ],
    faqs: [
      { q: 'Where is the closest RELUXE location to Zionsville?', a: 'Our Carmel location is the closest — about 7 miles and 12 minutes from downtown Zionsville. Take 106th Street East to US-31, then head north to Pennsylvania Street. The address is 10485 N Pennsylvania St, Suite 150, Carmel, IN 46280. Our Westfield location is about 12 miles and 20 minutes northeast — take US-421 North to SR-32 East. The address is 514 E State Road 32, Westfield, IN 46074.' },
      { q: 'What makes RELUXE the best med spa near Zionsville?', a: 'RELUXE is the highest-rated med spa in the area with a 5.0 star average across hundreds of reviews. We serve Zionsville from our Carmel location (12 min) and Westfield location (20 min), with expert providers, 40+ treatments, transparent pricing, and a luxury experience.' },
      { q: 'What treatments does RELUXE offer for Zionsville patients?', a: 'Both our Carmel and Westfield locations offer the full RELUXE menu: Botox, Dysport, Jeuveau, Daxxify, dermal fillers, Morpheus8, Sculptra, laser hair removal, IPL, ClearLift, HydraFacial, GLO2Facial, SkinPen microneedling, chemical peels, IV therapy (through House of Health at Carmel), and more — 40+ treatments total.' },
      { q: 'Do you offer free consultations?', a: 'Yes — all first-time patients receive a free, no-pressure consultation at either our Carmel or Westfield location. Your provider discusses your goals, recommends a plan, and gives exact pricing before any treatment.' },
      { q: 'How do I book an appointment from Zionsville?', a: 'Book online at reluxemedspa.com/book, call (317) 763-1142, or text us. We recommend our Carmel location for the quickest drive from Zionsville — just 12 minutes on 106th Street. Same-day appointments are frequently available.' },
      { q: 'Do you offer financing?', a: 'Yes — we offer flexible financing through Cherry with plans starting at 0% APR. Apply in seconds with no hard credit check. Our team helps you find a payment option that works for your budget.' },
    ],
  },
  indianapolis: {
    city: 'Indianapolis',
    state: 'IN',
    locationKey: null,
    address: null,
    phone: '(317) 763-1142',
    hours: null,
    lat: null,
    lng: null,
    nearbyAreas: ['Carmel', 'Westfield', 'Fishers', 'Noblesville', 'Zionsville', 'Broad Ripple', 'Meridian-Kessler'],
    intro: 'RELUXE Med Spa serves greater Indianapolis from two luxury locations in Westfield and Carmel — just minutes north of downtown. Our expert providers, transparent pricing, and 40+ treatment options make us the top-rated choice for Indianapolis-area patients.',
    whyBest: [
      { title: '5-Star Rated', body: 'Consistently 5.0 stars across hundreds of verified Google reviews from Indianapolis-area patients.' },
      { title: '2 Convenient Locations', body: 'Westfield (off US-32) and Carmel (off US-31) — both within 20-30 minutes of downtown Indianapolis with free parking.' },
      { title: 'Expert Providers', body: 'Every injector is rigorously trained. Our Medical Director oversees every treatment plan for safety and results.' },
      { title: '40+ Treatments', body: 'Botox, fillers, Morpheus8, laser hair removal, facials, peels, IV therapy — everything under one roof.' },
      { title: 'Transparent Pricing', body: 'No hidden fees or upselling. Exact pricing before any treatment. VIP Membership saves 10-15% on everything.' },
      { title: 'Not a Chain', body: 'Family-owned and locally operated. We live in the community we serve and take pride in every patient relationship.' },
    ],
    faqs: [
      { q: 'Where is RELUXE located near Indianapolis?', a: 'RELUXE has two locations serving the greater Indianapolis area: Westfield (514 E State Road 32) and Carmel (10485 N Pennsylvania St, Suite 150). Both are within 20-30 minutes of downtown Indianapolis with free parking.' },
      { q: 'What makes RELUXE the best med spa near Indianapolis?', a: 'RELUXE is the highest-rated med spa in the Indianapolis area with a 5.0 star average across hundreds of reviews. We offer 40+ treatments, expert providers overseen by a Medical Director, transparent pricing, and a luxury experience focused on results — not volume.' },
      { q: 'What treatments does RELUXE offer?', a: 'We offer Botox, Dysport, Jeuveau, Daxxify, dermal fillers (lips, cheeks, jawline), Morpheus8, laser hair removal, IPL, ClearLift, facials, chemical peels, HydraFacial, GLO2Facial, SkinPen microneedling, Sculptra, IV therapy, and more — 40+ treatments total.' },
      { q: 'Do you offer free consultations?', a: 'Yes — all first-time patients receive a free, no-pressure consultation at either location. Your provider discusses your goals, recommends a plan, and gives exact pricing before any treatment.' },
      { q: 'How do I book at RELUXE?', a: 'Book online at reluxemedspa.com/book, call (317) 763-1142, or text us. Same-day appointments are frequently available at both locations.' },
      { q: 'Do you offer financing for treatments?', a: 'Yes — we offer flexible financing through Cherry with plans starting at 0% APR. You can apply in seconds with no hard credit check. Our patient coordinators will help you find a payment option that fits your budget.' },
    ],
  },
}

const SERVICES_HIGHLIGHT = [
  { name: 'Botox & Tox', href: '/services/tox', desc: 'Smooth lines, prevent wrinkles' },
  { name: 'Dermal Fillers', href: '/services/filler', desc: 'Lips, cheeks, jawline' },
  { name: 'Morpheus8', href: '/services/morpheus8', desc: 'Skin tightening & remodeling' },
  { name: 'Laser Hair Removal', href: '/services/laser-hair-removal', desc: 'Unlimited packages' },
  { name: 'Facials & Peels', href: '/services/facials', desc: 'Medical-grade skin care' },
  { name: 'HydraFacial', href: '/services/hydrafacial', desc: 'Deep cleanse & hydration' },
]

export async function getStaticPaths() {
  return {
    paths: Object.keys(CITIES).map((city) => ({ params: { city } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const cityData = CITIES[params.city]
  if (!cityData) return { notFound: true }

  let testimonials = []
  try {
    const sb = getServiceClient()
    const { data } = await sb
      .from('testimonials')
      .select('id, author_name, quote, rating, service, location')
      .eq('status', 'published')
      .gte('rating', 4)
      .order('rating', { ascending: false })
      .limit(6)
    testimonials = data || []
  } catch {}

  return {
    props: { cityKey: params.city, cityData, testimonials },
    revalidate: 86400,
  }
}

export default function BestMedSpaCity({ cityKey, cityData, testimonials }) {
  const [openFaq, setOpenFaq] = useState(null)
  const c = cityData

  const canonical = `https://reluxemedspa.com/best-med-spa/${cityKey}`
  const title = `Best Med Spa in ${c.city}, ${c.state}`
  const description = `RELUXE Med Spa is the highest-rated med spa in ${c.city}, Indiana. 5-star rated, 40+ treatments, expert providers, transparent pricing. Botox, fillers, Morpheus8, facials & more. Book your free consultation today.`

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalBusiness',
        name: `RELUXE Med Spa — ${c.city}`,
        url: canonical,
        telephone: '+1-317-763-1142',
        priceRange: '$$',
        ...(c.address ? { address: { '@type': 'PostalAddress', streetAddress: c.address.split(',')[0], addressLocality: c.city, addressRegion: 'IN', addressCountry: 'US' } } : {}),
        ...(c.lat ? { geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng } } : {}),
        areaServed: [c.city + ' IN', ...c.nearbyAreas.map((a) => a + ' IN')],
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '5.0', reviewCount: '300', bestRating: '5' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reluxemedspa.com' },
          { '@type': 'ListItem', position: 2, name: `Best Med Spa in ${c.city}`, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: c.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }

  return (
    <BetaLayout title={title} description={description} canonical={canonical} structuredData={structuredData}>
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section className="relative" style={{ backgroundColor: colors.ink, paddingTop: 80 }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: `radial-gradient(ellipse at right, ${colors.violet}0c, transparent 70%)`, pointerEvents: 'none' }} />
            <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 relative">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>
                  {c.city}, Indiana
                </p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  Best Med Spa in{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {c.city}
                  </span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.7, color: 'rgba(250,248,245,0.6)', maxWidth: '36rem', marginBottom: '2rem' }}>
                  {c.intro}
                </p>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <GravityBookButton fontKey={fontKey} size="hero" />
                  <a href="/services" className="rounded-full flex items-center gap-2" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', color: 'rgba(250,248,245,0.7)', border: '1.5px solid rgba(250,248,245,0.2)', textDecoration: 'none' }}>
                    View All Treatments
                  </a>
                </div>
                <GoogleReviewBadge variant="hero" fonts={fonts} />
              </motion.div>
            </div>
          </section>

          {/* Why Best */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
              <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Why Patients Choose Us</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: 700, color: colors.heading }}>
                  What Makes RELUXE the Best
                </h2>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {c.whyBest.map((item, i) => (
                  <motion.div key={item.title} className="rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, lineHeight: 1.6 }}>{item.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Services Grid */}
          <section style={{ backgroundColor: colors.cream }}>
            <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
              <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Our Treatments</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: 700, color: colors.heading }}>
                  Popular Treatments in {c.city}
                </h2>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICES_HIGHLIGHT.map((svc) => (
                  <a key={svc.name} href={svc.href} className="group rounded-2xl p-6 transition-all duration-200 hover:shadow-md" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, textDecoration: 'none' }}>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>{svc.name}</h3>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>{svc.desc}</p>
                    <span className="inline-flex items-center gap-1.5 mt-3 transition-all group-hover:gap-2.5" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet }}>
                      Learn more
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </a>
                ))}
              </div>
              <div className="text-center mt-8">
                <a href="/services" className="inline-flex rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.5rem', background: gradients.primary, color: '#fff', textDecoration: 'none' }}>
                  View All 40+ Treatments
                </a>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section style={{ backgroundColor: '#fff' }}>
              <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
                <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Patient Reviews</p>
                  <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: 700, color: colors.heading }}>
                    What {c.city} Patients Are Saying
                  </h2>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {testimonials.map((t) => (
                    <div key={t.id} className="rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: t.rating }, (_, i) => (
                          <svg key={i} width="16" height="16" viewBox="0 0 20 20"><polygon points="10,1.5 12.5,7 18.5,7.5 14,11.5 15.5,17.5 10,14 4.5,17.5 6,11.5 1.5,7.5 7.5,7" fill="#FBBC05" /></svg>
                        ))}
                      </div>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, lineHeight: 1.6, fontStyle: 'italic', marginBottom: '0.75rem' }}>
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>
                        {t.author_name}
                        {t.service && <span style={{ fontWeight: 400, color: colors.muted }}> &middot; {t.service}</span>}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <a href="/reviews" className="text-sm font-semibold" style={{ color: colors.violet, textDecoration: 'none' }}>
                    Read all reviews &rarr;
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* Serving Areas */}
          <section style={{ backgroundColor: colors.ink }}>
            <div className="max-w-6xl mx-auto px-6 py-16 text-center">
              <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.white, marginBottom: '1rem' }}>
                Serving {c.city} &amp; Surrounding Areas
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {c.nearbyAreas.map((area) => (
                  <span key={area} className="rounded-full px-4 py-2" style={{ backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.1)', fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.6)' }}>
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section style={{ backgroundColor: colors.cream }}>
            <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28">
              <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>FAQ</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: 700, color: colors.heading }}>
                  Common Questions
                </h2>
              </motion.div>
              <div className="space-y-3">
                {c.faqs.map((faq, i) => (
                  <div key={i} className="rounded-xl overflow-hidden" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}>
                    <button className="w-full text-left p-5 flex items-center justify-between gap-4" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>{faq.q}</span>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <path d="M5 8L10 13L15 8" stroke={colors.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5">
                        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, lineHeight: 1.6 }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                Ready to Experience the Best?
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
                Book a free consultation at RELUXE in {c.city}. No pressure, just expert advice.
              </p>
              <GravityBookButton fontKey={fontKey} size="hero" />
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  )
}

BestMedSpaCity.getLayout = (page) => page
