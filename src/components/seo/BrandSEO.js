// src/components/seo/BrandSEO.js
// Brand page structured data: Organization, BreadcrumbList, ItemList, Speakable

import Head from 'next/head'

export default function BrandSEO({ brand, products = [], siteName = 'RELUXE Med Spa' }) {
  const b = brand || {}
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://reluxemedspa.com').replace(/\/+$/, '')
  const url = `${baseUrl}/skincare/${b.slug}`

  const toAbs = (src) => {
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    return `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`
  }

  const title = `${b.name} in Carmel & Westfield | ${siteName}`
  const description = b.description ||
    `Shop ${b.name} at ${siteName} in Westfield and Carmel, Indiana. ${b.tagline || ''}`
  const image = toAbs(b.hero_image || b.logo_url || '/images/opengraph-default.jpg')

  // Organization (brand)
  const ldOrg = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: b.name,
    description: b.description,
    logo: toAbs(b.logo_url) || undefined,
    url: b.website || undefined,
  }

  // BreadcrumbList
  const ldBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Skincare', item: `${baseUrl}/skincare` },
      { '@type': 'ListItem', position: 3, name: b.name, item: url },
    ],
  }

  // ItemList (all products)
  const ldItemList = products.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${b.name} Products at ${siteName}`,
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.name,
          url: `${baseUrl}/skincare/${b.slug}/${p.slug}`,
        })),
      }
    : null

  // Speakable
  const ldSpeakable = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.brand-description', '.brand-products'],
    },
  }

  const ldList = [ldOrg, ldBreadcrumbs, ldItemList, ldSpeakable].filter(Boolean)

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:alt" content={`${b.name} at ${siteName}`} />}

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
