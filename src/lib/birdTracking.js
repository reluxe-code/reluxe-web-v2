// src/lib/birdTracking.js
// Server-side Bird event tracking for reliable conversion attribution.
// Sends events to Bird's Track API so purchases and other backend events
// are attributed to Bird campaigns regardless of browser state.

import crypto from 'crypto'

const WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID || ''
const WRITE_KEY = process.env.BIRD_WRITE_KEY || ''
const TRACKING_URL = 'https://capture.eu-west-1.api.bird.com/tracking/track'

/**
 * Send a conversion event to Bird's server-side Track API.
 *
 * @param {string} eventName - e.g. 'gift_card_purchase', 'member_signup'
 * @param {{ key: string, value: string }} identifier - Contact identifier (emailaddress or phonenumber)
 * @param {object} properties - Event properties (order_id, amount_cents, etc.)
 */
export async function trackBirdEvent(eventName, identifier, properties = {}) {
  if (!WORKSPACE_ID || !WRITE_KEY) return

  try {
    const res = await fetch(TRACKING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bird-Event-Name': 'custom',
        'X-Bird-Sdk-Version': '0.0.1',
        'X-Bird-Workspace-Id': WORKSPACE_ID,
        'X-Bird-Write-Key': WRITE_KEY,
        'Origin': 'https://reluxemedspa.com',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        event: eventName,
        type: 'track',
        identity: {
          resolutionStrategy: 'lookup',
          entityType: 'contact',
          identifiers: [identifier],
        },
        properties,
        messageId: crypto.randomUUID(),
      }),
    })

    if (!res.ok) {
      console.error(`[bird] Track event failed (${res.status}):`, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error(`[bird] Track event error for ${eventName}:`, err.message)
  }
}
