// src/pages/api/cron/publish-inspiration.js
// Runs every 15 minutes. Publishes scheduled inspiration articles
// whose published_at time has passed.

import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Cron auth — fail-closed
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.authorization
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db = getServiceClient()

  // Find all scheduled articles whose publish time has passed
  const now = new Date().toISOString()
  const { data: ready, error: fetchErr } = await db
    .from('inspiration_articles')
    .select('id, slug, published_at')
    .eq('status', 'scheduled')
    .lte('published_at', now)

  if (fetchErr) {
    console.error('[publish-inspiration] Fetch error:', fetchErr.message)
    return res.status(500).json({ error: fetchErr.message })
  }

  if (!ready || ready.length === 0) {
    return res.status(200).json({ ok: true, published: 0 })
  }

  // Assign sort_order: newest articles get lower sort_order (appear first)
  // Get the current minimum sort_order so new articles appear at the top
  const { data: minRow } = await db
    .from('inspiration_articles')
    .select('sort_order')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .limit(1)
    .single()

  let nextSort = (minRow?.sort_order ?? 0) - ready.length

  const published = []

  for (const article of ready) {
    const { error: updateErr } = await db
      .from('inspiration_articles')
      .update({ status: 'published', sort_order: nextSort })
      .eq('id', article.id)

    if (updateErr) {
      console.error(`[publish-inspiration] Update error for ${article.slug}:`, updateErr.message)
    } else {
      published.push(article.slug)
      console.log(`[publish-inspiration] Published: ${article.slug}`)
    }
    nextSort++
  }

  return res.status(200).json({ ok: true, published: published.length, slugs: published })
}
