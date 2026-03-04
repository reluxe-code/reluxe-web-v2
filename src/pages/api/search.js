// pages/api/search.js
// Public unified search API — searches across all content types.
// GET /api/search?q=botox&type=services&limit=20&offset=0

import { getServiceClient } from '@/lib/supabase'
import { createRateLimiter, getClientIp, applyRateLimit } from '@/lib/rateLimit'
import {
  searchServices,
  searchConditions,
  searchFAQs,
  searchLocations,
  searchComparisons,
  searchCostGuides,
  findDidYouMean,
} from '@/lib/searchIndex'

const limiter = createRateLimiter('search', 30, 60_000)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const ip = getClientIp(req)
  if (applyRateLimit(req, res, limiter, ip)) return

  const q = (req.query.q || '').trim()
  if (!q) return res.status(400).json({ error: 'Missing q parameter' })
  if (q.length > 200) return res.status(400).json({ error: 'Query too long' })

  const typeFilter = req.query.type || null
  const limit = Math.min(parseInt(req.query.limit) || 20, 50)
  const offset = parseInt(req.query.offset) || 0

  try {
    const db = getServiceClient()

    // Run all searches in parallel
    const [
      services,
      conditions,
      faqs,
      locations,
      comparisons,
      costGuides,
      blogPosts,
      staff,
      products,
      deals,
      stories,
      inspiration,
    ] = await Promise.all([
      searchServices(q),
      Promise.resolve(searchConditions(q)),
      Promise.resolve(searchFAQs(q)),
      Promise.resolve(searchLocations(q)),
      searchComparisons(q),
      searchCostGuides(q),
      searchBlogPosts(db, q),
      searchStaff(db, q),
      searchProducts(db, q),
      searchDeals(db, q),
      searchStories(db, q),
      searchInspiration(db, q),
    ])

    // Group results by type
    const groups = {
      services,
      conditions,
      faqs,
      locations,
      comparisons,
      costGuides,
      blog: blogPosts,
      team: staff,
      products,
      deals,
      stories,
      inspiration,
    }

    // Flatten, deduplicate by URL, sort by score
    const seen = new Set()
    let all = []
    for (const [, items] of Object.entries(groups)) {
      for (const item of items) {
        if (item.url && seen.has(item.url)) continue
        if (item.url) seen.add(item.url)
        all.push(item)
      }
    }
    all.sort((a, b) => (b.score || 0) - (a.score || 0))

    // Apply type filter
    if (typeFilter) {
      const filterMap = {
        services: 'Service',
        conditions: 'Condition',
        faqs: 'FAQ',
        locations: 'Location',
        comparisons: 'Comparison',
        costGuides: 'Cost Guide',
        blog: 'Blog',
        team: 'Team',
        products: 'Product',
        deals: 'Deal',
        stories: 'Story',
        inspiration: 'Inspiration',
      }
      const typeLabel = filterMap[typeFilter]
      if (typeLabel) all = all.filter(r => r.type === typeLabel)
    }

    const total = all.length
    const paginated = all.slice(offset, offset + limit)

    // Find "did you mean" for zero-result queries
    let didYouMean = null
    if (total === 0) {
      didYouMean = await findDidYouMean(q)
    }

    // Build group counts
    const groupCounts = {}
    for (const [key, items] of Object.entries(groups)) {
      if (items.length > 0) groupCounts[key] = items.length
    }

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res.status(200).json({
      ok: true,
      query: q,
      results: paginated,
      total,
      groups: groupCounts,
      didYouMean,
      limit,
      offset,
    })
  } catch (err) {
    console.error('[search] Error:', err.message)
    return res.status(500).json({ error: 'Search failed' })
  }
}

// ─── Supabase searchers ──────────────────────────────────

async function searchBlogPosts(db, q) {
  try {
    // Try FTS RPC first
    const { data, error } = await db.rpc('search_blog_posts', {
      search_query: q,
      result_limit: 15,
    })
    if (!error && data?.length) {
      return data.map((p, i) => ({
        title: p.title,
        url: `/blog/${p.slug}`,
        description: p.excerpt || '',
        type: 'Blog',
        image: p.featured_image || null,
        score: 80 - i * 2,
      }))
    }
    // Fallback: ilike
    const { data: fb } = await db
      .from('blog_posts')
      .select('slug, title, excerpt, featured_image')
      .eq('status', 'published')
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .limit(15)
    return (fb || []).map((p, i) => ({
      title: p.title,
      url: `/blog/${p.slug}`,
      description: p.excerpt || '',
      type: 'Blog',
      image: p.featured_image || null,
      score: 60 - i * 2,
    }))
  } catch {
    return []
  }
}

async function searchStaff(db, q) {
  try {
    const { data } = await db
      .from('staff')
      .select('slug, name, title, bio, featured_image, specialties')
      .or(`name.ilike.%${q}%,title.ilike.%${q}%,bio.ilike.%${q}%`)
      .limit(10)
    return (data || []).map((s, i) => ({
      title: s.name,
      url: `/team/${s.slug}`,
      description: s.title || '',
      type: 'Team',
      image: s.featured_image || null,
      tags: Array.isArray(s.specialties) ? s.specialties : [],
      score: (s.name?.toLowerCase().includes(q.toLowerCase()) ? 85 : 55) - i,
    }))
  } catch {
    return []
  }
}

async function searchProducts(db, q) {
  try {
    const { data } = await db
      .from('products')
      .select('slug, name, short_description, category, brand:brands(name, slug), images')
      .or(`name.ilike.%${q}%,short_description.ilike.%${q}%,category.ilike.%${q}%`)
      .limit(10)
    return (data || []).map((p, i) => ({
      title: p.name,
      url: `/skincare/${p.brand?.slug || 'shop'}/${p.slug}`,
      description: p.short_description || '',
      type: 'Product',
      image: Array.isArray(p.images) ? p.images[0] : null,
      category: p.category,
      score: 50 - i,
    }))
  } catch {
    return []
  }
}

async function searchDeals(db, q) {
  try {
    const { data } = await db
      .from('deals')
      .select('slug, title, subtitle, tag, price, compare_at')
      .eq('active', true)
      .or(`title.ilike.%${q}%,subtitle.ilike.%${q}%,tag.ilike.%${q}%`)
      .limit(10)
    return (data || []).map((d, i) => ({
      title: d.title,
      url: `/hot-deals/${d.slug}`,
      description: d.subtitle || '',
      type: 'Deal',
      tag: d.tag,
      price: d.price,
      compareAt: d.compare_at,
      score: 50 - i,
    }))
  } catch {
    return []
  }
}

async function searchStories(db, q) {
  try {
    const { data } = await db
      .from('stories')
      .select('slug, title, person_name, intro, featured_image')
      .eq('status', 'published')
      .or(`title.ilike.%${q}%,person_name.ilike.%${q}%,intro.ilike.%${q}%`)
      .limit(10)
    return (data || []).map((s, i) => ({
      title: s.title || s.person_name,
      url: `/stories/${s.slug}`,
      description: s.intro || '',
      type: 'Story',
      image: s.featured_image || null,
      score: 45 - i,
    }))
  } catch {
    return []
  }
}

async function searchInspiration(db, q) {
  try {
    const { data } = await db
      .from('inspiration_articles')
      .select('slug, title, excerpt, featured_image, category')
      .eq('status', 'published')
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .limit(10)
    return (data || []).map((a, i) => ({
      title: a.title,
      url: `/inspiration/${a.slug}`,
      description: a.excerpt || '',
      type: 'Inspiration',
      image: a.featured_image || null,
      category: a.category,
      score: 45 - i,
    }))
  } catch {
    return []
  }
}
