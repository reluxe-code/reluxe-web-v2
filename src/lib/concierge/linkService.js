// src/lib/concierge/linkService.js
// Generates and resolves short-lived, single-use concierge booking links.
// Links use /c/{token} as a short URL that tracks clicks then redirects to /start/provider.

import crypto from 'crypto'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reluxemedspa.com'

// Map campaign types to /start booking flow params
const CAMPAIGN_BOOKING_PARAMS = {
  tox_journey: { path: '/start/provider', category: 'tox' },
  membership_voucher: { path: '/start/provider' },
  aesthetic_winback: { path: '/start/provider' },
  last_minute_gap: { path: '/start/provider' },
  package_voucher: { path: '/start/provider' },
}

/**
 * Build the /start destination URL for a concierge link.
 * Each cohort gets smart pre-population to minimize booking friction.
 *
 * - P1 Tox: /start/provider?p={slug}&c=tox → lands on "Choose Your Tox" screen
 * - P2 Voucher: /start/provider?p={slug} → provider pre-selected
 * - P3 Winback: /start/provider?p={slug}&s={facialSlug} → provider + specific facial
 * - P4 Gap: /start/provider?p={slug}&s={serviceSlug} → provider + specific service
 */
function buildDestination({ campaignSlug, providerSlug, serviceSlug, locationKey }) {
  const config = CAMPAIGN_BOOKING_PARAMS[campaignSlug] || { path: '/start/provider' }
  const params = new URLSearchParams()

  if (providerSlug) params.set('p', providerSlug)

  // Campaign-specific service pre-population
  if (config.category) {
    params.set('c', config.category)
  } else if (serviceSlug) {
    params.set('s', serviceSlug)
  }

  const qs = params.toString()
  return qs ? `${config.path}?${qs}` : config.path
}

/**
 * Generate a concierge link with a unique token and 48-hour expiry.
 * The short URL /c/{token} redirects to /start/provider with smart params + UTM tracking.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {object} opts
 * @param {string} opts.clientId - Client UUID
 * @param {string} opts.providerSlug - Provider slug for pre-population
 * @param {string} opts.campaignSlug - Campaign type (tox_journey, membership_voucher, etc.)
 * @param {string} [opts.serviceSlug] - Service slug for service pre-selection
 * @param {string} [opts.locationKey] - Location key
 * @returns {Promise<{ token: string, url: string }>}
 */
export async function generateConciergeLink(db, { clientId, providerSlug, campaignSlug, serviceSlug, locationKey }) {
  const token = 'cg_' + crypto.randomBytes(12).toString('base64url')

  const destination = buildDestination({ campaignSlug, providerSlug, serviceSlug, locationKey })

  const { error } = await db.from('concierge_links').insert({
    token,
    client_id: clientId,
    destination,
    utm_source: 'reluxe_concierge',
    utm_medium: 'sms',
    utm_campaign: campaignSlug,
    utm_content: providerSlug || null,
  })

  if (error) {
    console.error('[concierge/linkService] insert error:', error.message)
    throw error
  }

  const url = `${BASE_URL}/c/${token}`
  return { token, url }
}

/**
 * Resolve a concierge link by token. Returns the destination URL with UTMs
 * appended, or null if expired/not found.
 * Marks the link as used on first resolution.
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string} token
 * @returns {Promise<{ destination: string, clientId: string, campaignSlug: string } | null>}
 */
export async function resolveConciergeLink(db, token) {
  const { data: link, error } = await db
    .from('concierge_links')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !link) return null

  // Check expiry
  if (new Date(link.expires_at) < new Date()) return null

  // Build destination with UTMs + tracking token
  const utmParams = new URLSearchParams({
    utm_source: link.utm_source || 'reluxe_concierge',
    utm_medium: link.utm_medium || 'sms',
    ...(link.utm_campaign && { utm_campaign: link.utm_campaign }),
    ...(link.utm_content && { utm_content: link.utm_content }),
    cg_token: token, // Pass tracking token through to booking flow for attribution
  })
  const separator = link.destination.includes('?') ? '&' : '?'
  const destination = `${link.destination}${separator}${utmParams}`

  // Mark as used (only on first click)
  if (!link.used) {
    await db
      .from('concierge_links')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', link.id)

    // Update marketing_touches clicked_at
    await db
      .from('marketing_touches')
      .update({ clicked_at: new Date().toISOString(), status: 'clicked' })
      .eq('link_token', token)
      .is('clicked_at', null)
  }

  return {
    destination,
    clientId: link.client_id,
    campaignSlug: link.utm_campaign,
  }
}
