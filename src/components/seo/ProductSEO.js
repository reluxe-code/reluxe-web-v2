// src/components/seo/ProductSEO.js
// Product page structured data: Product, BreadcrumbList, FAQPage, HowTo, Speakable

import Head from 'next/head'

const LOCATIONS = [
  {
    '@type': 'MedicalBusiness',
    name: 'RELUXE Med Spa — Westfield',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '2498 E 146th St Suite 100',
      addressLocality: 'Westfield',
      addressRegion: 'IN',
      postalCode: '46074',
      addressCountry: 'US',
    },
    telephone: '+1-317-763-1142',
  },
  {
    '@type': 'MedicalBusiness',
    name: 'RELUXE Med Spa — Carmel',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '10485 N Pennsylvania St, Suite 150',
      addressLocality: 'Carmel',
      addressRegion: 'IN',
      postalCode: '46280',
      addressCountry: 'US',
    },
    telephone: '+1-317-763-1142',
  },
]

export default function ProductSEO({ product, brand, siteName = 'RELUXE Med Spa' }) {
  const p = product || {}
  const b = brand || {}
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://reluxemedspa.com').replace(/\/+$/, '')
  const url = `${baseUrl}/skincare/${b.slug}/${p.slug}`

  const toAbs = (src) => {
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    return `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`
  }

  const title = p.seo_title || `${p.name} by ${b.name} | ${siteName}`
  const description = p.seo_description ||
    `${p.name} is a ${p.category || 'skincare product'} by ${b.name} featuring ${(p.key_ingredients || []).slice(0, 3).join(', ')}. Available at ${siteName} in Westfield & Carmel, IN.`
  const image = toAbs(p.image_url || '/images/og/new-default-1200x630.png')

  // Product JSON-LD
  const purchaseType = p.purchase_type || b.purchase_type || 'in_clinic'
  const ldProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description || description,
    image: image ? [image] : undefined,
    brand: { '@type': 'Brand', name: b.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: p.price || undefined,
      availability: 'https://schema.org/InStock',
      url: p.purchase_url || url,
      seller: { '@type': 'MedicalBusiness', name: siteName },
      availableAtOrFrom: LOCATIONS,
    },
    category: p.category,
  }

  // BreadcrumbList
  const ldBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Skincare', item: `${baseUrl}/skincare` },
      { '@type': 'ListItem', position: 3, name: b.name, item: `${baseUrl}/skincare/${b.slug}` },
      { '@type': 'ListItem', position: 4, name: p.name, item: url },
    ],
  }

  // FAQPage (from product faq JSONB)
  const faqItems = Array.isArray(p.faq) ? p.faq.slice(0, 8) : []
  const ldFAQ = faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null

  // HowTo (from how_to_use)
  const ldHowTo = p.how_to_use
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to Use ${p.name}`,
        description: p.how_to_use,
        step: p.how_to_use.split(/\.\s+/).filter(Boolean).map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          text: s.endsWith('.') ? s : s + '.',
        })),
      }
    : null

  // Speakable
  const ldSpeakable = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.product-description', '.product-faq', '.product-how-to-use'],
    },
  }

  const ldList = [ldProduct, ldBreadcrumbs, ldFAQ, ldHowTo, ldSpeakable].filter(Boolean)

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="product" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:alt" content={`${p.name} by ${b.name}`} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {ldList.map((obj, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
      ))}
    </Head>
  )
}
