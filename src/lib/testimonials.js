// src/lib/testimonials.js
// Unified fetch utility for testimonials across SSR and client-side use.

import { supabase, getServiceClient } from '@/lib/supabase'

/**
 * Build a Supabase query with common filters.
 * @param {object} client – Supabase client (anon or service role)
 * @param {object} opts
 * @param {string}  [opts.location]  – 'westfield' or 'carmel'
 * @param {string}  [opts.provider]  – staff first name
 * @param {string}  [opts.service]   – service slug
 * @param {boolean} [opts.featured]  – only featured
 * @param {number}  [opts.minRating] – minimum rating (default 5)
 * @param {number}  [opts.limit]     – max results (default 20)
 */
function buildQuery(client, opts = {}) {
  const {
    location,
    provider,
    service,
    featured,
    minRating = 5,
    limit = 20,
  } = opts

  let q = client
    .from('testimonials')
    .select('*')
    .eq('status', 'published')
    .eq('recommendable', true)
    .gte('rating', minRating)
    .not('quote', 'is', null)
    .neq('quote', '')

  if (location) q = q.eq('location', location)
  if (provider) q = q.eq('provider', provider)
  if (service) q = q.eq('service', service)
  if (featured) q = q.eq('featured', true)

  // Sort: featured first, then newest first
  q = q.order('featured', { ascending: false })
       .order('review_date', { ascending: false, nullsFirst: false })
       .limit(limit)

  return q
}

/**
 * Shuffle an array (Fisher-Yates) for rotation.
 */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Sort testimonials with recency boost: featured first, then recent (last 60 days)
 * shuffled, then older shuffled.
 */
function sortWithRecencyBoost(testimonials) {
  const now = Date.now()
  const sixtyDays = 60 * 24 * 60 * 60 * 1000

  const featured = []
  const recent = []
  const older = []

  for (const t of testimonials) {
    if (t.featured) {
      featured.push(t)
    } else {
      const reviewMs = t.review_date ? new Date(t.review_date).getTime() : 0
      if (now - reviewMs <= sixtyDays) {
        recent.push(t)
      } else {
        older.push(t)
      }
    }
  }

  return [...shuffle(featured), ...shuffle(recent), ...shuffle(older)]
}

/**
 * SSR fetch – uses service role client (bypasses RLS).
 * Call from getStaticProps / getServerSideProps.
 */
export async function getTestimonialsSSR(opts = {}) {
  const client = getServiceClient()
  const { data, error } = await buildQuery(client, opts)
  if (error) {
    console.error('getTestimonialsSSR error:', error.message)
    return []
  }
  return sortWithRecencyBoost(data || [])
}

/**
 * Client-side fetch – uses anon client (RLS enforced).
 * Call from useEffect in client components.
 */
export async function getTestimonialsClient(opts = {}) {
  const { data, error } = await buildQuery(supabase, opts)
  if (error) {
    console.error('getTestimonialsClient error:', error.message)
    return []
  }
  return sortWithRecencyBoost(data || [])
}
