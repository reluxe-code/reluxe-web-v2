// src/components/seo/ServiceSEO.js

import Head from 'next/head'
import { useRouter } from 'next/router'

export default function ServiceSEO({ service, siteName = 'RELUXE Med Spa' }) {
  const s = service || {}
  const router = useRouter()
  const slug = String(s.slug || router?.query?.slug || '')
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://reluxemedspa.com').replace(/\/+$/, '')
  const url = `${baseUrl}/services/${slug}`

  // Core fields (fallbacks)
  const rawImg =
    s.seo?.image ||
    s.heroImage ||
    s.gallery?.[0]?.src ||
    '/images/opengraph-default.jpg'

  const toAbs = (src) => {
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    return `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`
  }

  const title =
    s.seo?.title ||
    `${s.name || 'Service'} | ${siteName}`

  const description =
    s.seo?.description ||
    s.tagline ||
    (s.overview?.p1 && s.overview.p1.slice(0, 155)) ||
    `Learn about ${s.name} at ${siteName} in Westfield & Carmel, IN.`

  const image = toAbs(rawImg)
  const robots = s.indexable === false ? 'noindex, nofollow, noarchive' : 'index, follow'

  // FAQ JSON-LD
  const faq = (Array.isArray(s.faq) ? s.faq.slice(0, 8) : []).map(q => ({
    '@type': 'Question',
    name: q.q,
    acceptedAnswer: { '@type': 'Answer', text: q.a }
  }))

  // Service JSON-LD
  const singlePrice = parseFloat(String(s.pricing?.single || '').replace(/[^0-9.]/g, '')) || undefined
  const ldService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    serviceType: s.name,
    description,
    image: image ? [image] : undefined,
    provider: {
      '@type': 'MedicalBusiness',
      name: siteName,
      areaServed: ['Westfield IN', 'Carmel IN', 'Fishers IN', 'Zionsville IN', 'North Indianapolis IN']
    },
    offers: singlePrice
      ? { '@type': 'Offer', priceCurrency: 'USD', price: singlePrice, url }
      : undefined
  }

  // Breadcrumbs JSON-LD
  const ldBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
      { '@type': 'ListItem', position: 3, name: s.name || 'Service', item: url }
    ]
  }

  // Optional Video JSON-LD
  const ldVideo = s.videoUrl
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: `${s.name} — How it works`,
        description,
        thumbnailUrl: image || undefined,
        uploadDate: new Date().toISOString().split('T')[0],
        embedUrl: s.videoUrl
      }
    : null

  // Optional FAQ JSON-LD
  const ldFAQ =
    faq.length > 0
      ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq }
      : null

  const ldList = [ldService, ldBreadcrumbs, ldVideo, ldFAQ].filter(Boolean)

  return (
    <Head>
      {/* Basic */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:alt" content={`${s.name} at ${siteName}`} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Structured Data */}
      {ldList.map((obj, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
      ))}
    </Head>
  )
}
