// src/pages/server-sitemap.xml/index.js
// Dynamic server-side sitemap for CMS-driven content.
// Fetches live data from Supabase so new pages appear without a redeploy.

import { getServerSideSitemapLegacy } from 'next-sitemap'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://reluxemedspa.com'

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function getServerSideProps(ctx) {
  const client = sb()
  if (!client) return getServerSideSitemapLegacy(ctx, [])

  const [
    services,
    serviceCategories,
    staff,
    blog,
    inspiration,
    brands,
    products,
    stories,
    hotDeals,
    locations,
    conditions,
  ] = await Promise.all([
    client.from('cms_services').select('slug, updated_at').eq('status', 'published'),
    client.from('service_categories').select('slug, updated_at').eq('active', true),
    client.from('staff').select('slug, updated_at').eq('status', 'published'),
    client.from('blog_posts').select('slug, updated_at, published_at').eq('status', 'published'),
    client.from('inspiration_articles').select('slug, updated_at').eq('status', 'published'),
    client.from('brands').select('slug, updated_at').eq('active', true),
    client.from('products').select('slug, updated_at, brands!inner(slug)').eq('active', true),
    client.from('stories').select('slug, updated_at').eq('status', 'published'),
    client.from('deals').select('slug, updated_at').eq('active', true).catch(() => ({ data: [] })),
    client.from('locations').select('slug, updated_at'),
    client.from('conditions').select('slug, updated_at').catch(() => ({ data: [] })),
  ])

  const fields = []
  const CITIES = ['westfield', 'carmel']

  const add = (loc, lastmod, priority = 0.8, changefreq = 'monthly') => {
    fields.push({
      loc: `${SITE_URL}${loc}`,
      lastmod: lastmod ? new Date(lastmod).toISOString() : new Date().toISOString(),
      priority,
      changefreq,
    })
  }

  // Services (base + per-city)
  for (const s of services.data || []) {
    add(`/services/${s.slug}`, s.updated_at, 0.9, 'weekly')
    for (const city of CITIES) {
      add(`/services/${s.slug}/${city}`, s.updated_at, 0.85, 'monthly')
    }
  }

  // Service collections
  for (const c of serviceCategories.data || []) {
    add(`/services/collections/${c.slug}`, c.updated_at, 0.88, 'weekly')
  }

  // Team members
  for (const t of staff.data || []) {
    add(`/team/${t.slug}`, t.updated_at, 0.8, 'monthly')
  }

  // Blog posts
  for (const b of blog.data || []) {
    add(`/blog/${b.slug}`, b.updated_at || b.published_at, 0.75, 'monthly')
  }

  // Inspiration articles
  for (const a of inspiration.data || []) {
    add(`/inspiration/${a.slug}`, a.updated_at, 0.8, 'monthly')
  }

  // Skincare brands + products
  for (const b of brands.data || []) {
    add(`/skincare/${b.slug}`, b.updated_at, 0.8, 'weekly')
  }
  for (const p of products.data || []) {
    const brandSlug = p.brands?.slug
    if (brandSlug) add(`/skincare/${brandSlug}/${p.slug}`, p.updated_at, 0.75, 'monthly')
  }

  // Stories
  for (const s of stories.data || []) {
    add(`/stories/${s.slug}`, s.updated_at, 0.75, 'monthly')
  }

  // Hot deals
  for (const d of hotDeals.data || []) {
    add(`/hot-deals/${d.slug}`, d.updated_at, 0.85, 'daily')
  }

  // Locations
  for (const l of locations.data || []) {
    add(`/locations/${l.slug}`, l.updated_at, 0.9, 'monthly')
  }

  // Conditions
  for (const c of conditions.data || []) {
    add(`/conditions/${c.slug}`, c.updated_at, 0.8, 'monthly')
  }

  // Cache for 1 hour — balances freshness vs. Supabase load
  ctx.res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')

  return getServerSideSitemapLegacy(ctx, fields)
}

export default function Sitemap() {}
