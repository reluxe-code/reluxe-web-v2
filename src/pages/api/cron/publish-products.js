// src/pages/api/cron/publish-products.js
// Runs every 15 minutes. Activates auto-generated product pages
// whose published_at time has passed.
// Identifies pending products by: active=false, is_new=true,
// published_at is set and has passed, and description is not null
// (indicating AI-generated content, not an empty admin draft).

import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.authorization
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db = getServiceClient()
  const now = new Date().toISOString()

  // Find products ready to publish:
  // - Not active yet
  // - Have a description (auto-generated content exists)
  // - published_at is set and has passed
  // - is_new = true (marker from auto-generation)
  const { data: ready, error: fetchErr } = await db
    .from('products')
    .select('id, slug, brand_id')
    .eq('active', false)
    .eq('is_new', true)
    .not('description', 'is', null)
    .not('published_at', 'is', null)
    .lte('published_at', now)

  if (fetchErr) {
    console.error('[publish-products] Fetch error:', fetchErr.message)
    return res.status(500).json({ error: fetchErr.message })
  }

  if (!ready || ready.length === 0) {
    return res.status(200).json({ ok: true, published: 0 })
  }

  const published = []

  for (const product of ready) {
    const { error: updateErr } = await db
      .from('products')
      .update({ active: true, updated_at: new Date().toISOString() })
      .eq('id', product.id)

    if (updateErr) {
      console.error(`[publish-products] Update error for ${product.slug}:`, updateErr.message)
    } else {
      published.push(product.slug)
      console.log(`[publish-products] Activated: ${product.slug}`)
    }
  }

  return res.status(200).json({ ok: true, published: published.length, slugs: published })
}
