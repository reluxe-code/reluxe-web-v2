// src/lib/searchIndex.js
// Server-side content indexer — loads static data at module scope
// and provides weighted search across all content types.

import { getServicesList } from '@/data/servicesList'
import CONDITIONS from '@/data/conditions'
import faqData from '@/data/faqs'
import { LOCATIONS } from '@/data/locations'

let _comparisons = null
let _costGuides = null

async function getComparisons() {
  if (!_comparisons) {
    try { _comparisons = (await import('@/data/comparisons')).default } catch { _comparisons = {} }
  }
  return _comparisons
}
async function getCostGuides() {
  if (!_costGuides) {
    try { _costGuides = (await import('@/data/cost-guides')).default } catch { _costGuides = {} }
  }
  return _costGuides
}

// ─── Helpers ─────────────────────────────────────────────

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
}

function scoreMatch(text, query) {
  if (!text || !query) return 0
  const t = normalize(text)
  const q = normalize(query)
  if (!q) return 0
  if (t === q) return 100
  if (t.startsWith(q)) return 90
  if (t.includes(q)) return 70
  // word match
  const words = q.split(' ')
  const matched = words.filter(w => t.includes(w))
  if (matched.length === words.length) return 60
  if (matched.length > 0) return 30 + (matched.length / words.length) * 20
  return 0
}

function bestScore(fields, query) {
  let best = 0
  for (const f of fields) {
    const s = scoreMatch(f, query)
    if (s > best) best = s
  }
  return best
}

// ─── Levenshtein distance (for "did you mean") ──────────

function levenshtein(a, b) {
  const m = a.length, n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const d = Array.from({ length: m + 1 }, (_, i) => {
    const row = new Array(n + 1)
    row[0] = i
    return row
  })
  for (let j = 1; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
    }
  }
  return d[m][n]
}

// ─── Static content searchers ────────────────────────────

let _servicesCache = null
let _allTitles = null

async function getServicesCache() {
  if (!_servicesCache) {
    try {
      const list = await getServicesList()
      _servicesCache = list.filter(s => s && s.slug && s.indexable !== false)
    } catch {
      _servicesCache = []
    }
  }
  return _servicesCache
}

async function getAllTitles() {
  if (_allTitles) return _allTitles
  const titles = []
  const services = await getServicesCache()
  services.forEach(s => titles.push(s.name))
  Object.values(CONDITIONS).forEach(c => titles.push(c.title))
  const comparisons = await getComparisons()
  Object.values(comparisons).forEach(c => titles.push(c.title))
  const guides = await getCostGuides()
  Object.values(guides).forEach(g => titles.push(g.title))
  LOCATIONS.forEach(l => titles.push(l.city))
  _allTitles = titles.filter(Boolean)
  return _allTitles
}

export async function findDidYouMean(query) {
  const titles = await getAllTitles()
  const q = normalize(query)
  if (!q || q.length < 3) return null

  let best = null
  let bestDist = Infinity
  for (const title of titles) {
    const t = normalize(title)
    const dist = levenshtein(q, t)
    const threshold = Math.max(2, Math.floor(q.length * 0.4))
    if (dist < bestDist && dist <= threshold && dist > 0 && t !== q) {
      bestDist = dist
      best = title
    }
  }
  return best
}

export async function searchServices(query) {
  const services = await getServicesCache()
  const results = []
  for (const s of services) {
    const fields = [
      s.name,
      s.tagline,
      s.seo?.title,
      s.seo?.description,
      s.overview?.p1,
      s.overview?.p2,
      ...(s.benefits || []),
      ...(s.faq || []).map(f => f.q),
    ]
    const score = bestScore(fields, query) * 1.2 // boost services
    if (score > 0) {
      results.push({
        title: s.name,
        url: `/services/${s.slug}`,
        description: s.tagline || s.seo?.description || '',
        type: 'Service',
        image: s.heroImage || null,
        score,
      })
    }
  }
  return results
}

export function searchConditions(query) {
  const results = []
  for (const [slug, c] of Object.entries(CONDITIONS)) {
    const fields = [
      c.title,
      c.heroDescription,
      c.aboutHeading,
      c.aboutP1,
      c.aboutP2,
      ...(c.treatments || []).map(t => t.title),
      ...(c.treatments || []).map(t => t.copy),
      ...(c.faqs || []).map(f => f.q),
    ]
    const score = bestScore(fields, query)
    if (score > 0) {
      results.push({
        title: c.title,
        url: `/conditions/${slug}`,
        description: c.heroDescription || '',
        type: 'Condition',
        image: c.heroImage || null,
        score,
      })
    }
  }
  return results
}

export function searchFAQs(query) {
  const results = []
  for (const [category, items] of Object.entries(faqData)) {
    for (const faq of items) {
      const score = bestScore([faq.q, faq.a, category], query) * 0.8
      if (score > 0) {
        results.push({
          title: faq.q,
          url: '/faqs',
          description: faq.a.substring(0, 200),
          type: 'FAQ',
          category,
          score,
        })
      }
    }
  }
  return results
}

export function searchLocations(query) {
  const results = []
  for (const loc of LOCATIONS) {
    const fields = [
      loc.city,
      loc.label,
      loc.address,
      loc.existsNote,
      ...(loc.neighborhoods || []),
      ...(loc.landmarks || []),
    ]
    const score = bestScore(fields, query) * 1.1
    if (score > 0) {
      results.push({
        title: `RELUXE Med Spa — ${loc.city}`,
        url: `/locations/${loc.key}`,
        description: `${loc.address} · ${loc.hoursNote}`,
        type: 'Location',
        score,
      })
    }
  }
  return results
}

export async function searchComparisons(query) {
  const comparisons = await getComparisons()
  const results = []
  for (const [slug, c] of Object.entries(comparisons)) {
    const fields = [c.title, c.heroDescription, c.category, c.intro?.p1, c.intro?.p2]
    const score = bestScore(fields, query) * 0.9
    if (score > 0) {
      results.push({
        title: c.title,
        url: `/compare/${slug}`,
        description: c.heroDescription || '',
        type: 'Comparison',
        score,
      })
    }
  }
  return results
}

export async function searchCostGuides(query) {
  const guides = await getCostGuides()
  const results = []
  for (const [slug, g] of Object.entries(guides)) {
    const fields = [g.title, g.heroDescription, g.serviceName, g.intro?.p1, g.intro?.p2]
    const score = bestScore(fields, query) * 0.9
    if (score > 0) {
      results.push({
        title: g.title,
        url: `/cost/${slug}`,
        description: g.heroDescription || '',
        type: 'Cost Guide',
        score,
      })
    }
  }
  return results
}
