// src/lib/social-engine/bookingLink.js
// Generates trackable booking links for Social Engine campaigns.
// Reuses the concierge_links table + /c/[token] redirect infrastructure.

import crypto from 'crypto'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reluxemedspa.com'

/**
 * Build a /start destination URL for a social campaign link.
 */
function buildDestination({ providerSlug, serviceSlug }) {
  const params = new URLSearchParams()
  if (providerSlug) params.set('p', providerSlug)
  if (serviceSlug) params.set('s', serviceSlug)
  const qs = params.toString()
  return qs ? `/start/provider?${qs}` : '/start/provider'
}

/**
 * Generate a trackable social campaign booking link.
 * Inserts into concierge_links with ig_story UTM source.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {object} opts
 * @param {string} opts.providerSlug
 * @param {string} opts.serviceSlug
 * @param {string} [opts.campaignId]
 * @returns {Promise<{ token: string, url: string }>}
 */
export async function generateSocialLink(db, { providerSlug, serviceSlug, campaignId }) {
  const token = 'se_' + crypto.randomBytes(12).toString('base64url')
  const destination = buildDestination({ providerSlug, serviceSlug })

  const { error } = await db.from('concierge_links').insert({
    token,
    client_id: null,
    destination,
    utm_source: 'ig_story',
    utm_medium: 'social',
    utm_campaign: 'flash_avail',
    utm_content: `${providerSlug}_${campaignId || 'unknown'}`,
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  })

  if (error) {
    console.error('[social-engine/bookingLink] insert error:', error.message)
    throw error
  }

  return { token, url: `${BASE_URL}/c/${token}` }
}
