// src/pages/api/blvd/bundles.js
// Returns treatment bundles from site_config.
// Optional ?featured=true to return only featured bundles.
import { getServiceClient } from '@/lib/supabase'
import { getCached, setCache } from '@/server/cache'
import { SLUG_TITLES } from '@/data/treatmentBundles'

/** Normalize legacy slugs[] format to items[{slug,label}] */
function normalizeBundle(b) {
  if (b.items) return b
  return { ...b, items: (b.slugs || []).map(s => ({ slug: s, label: SLUG_TITLES[s] || s })) }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { featured } = req.query
  const cacheKey = 'site-config:treatment_bundles'
  const cached = getCached(cacheKey, 300_000) // 5 min
  if (cached && !cached.stale) {
    const bundles = filterBundles(cached.data, featured)
    return res.json(bundles)
  }

  try {
    const sb = getServiceClient()
    const { data } = await sb
      .from('site_config')
      .select('value')
      .eq('key', 'treatment_bundles')
      .limit(1)
      .single()

    const raw = (data?.value || []).map(normalizeBundle)
    const sorted = [...raw].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99))

    setCache(cacheKey, sorted)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    res.json(filterBundles(sorted, featured))
  } catch (err) {
    console.error('[blvd/bundles]', err.message)
    if (cached) return res.json(filterBundles(cached.data, featured))
    res.status(200).json([])
  }
}

function filterBundles(bundles, featured) {
  if (featured === 'true') return bundles.filter(b => b.featured)
  return bundles
}
