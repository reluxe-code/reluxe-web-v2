// src/lib/social-engine/manychat.js
// ManyChat API integration for Instagram DM automation.
// Fire-and-forget pattern matching src/lib/metaCAPI.js.

const MANYCHAT_API_KEY = process.env.MANYCHAT_API_KEY || ''
const MANYCHAT_BASE = 'https://api.manychat.com/fb'

/**
 * Set a page-level custom field value in ManyChat.
 * Used to update the current promo booking URL.
 */
export async function setCustomField(fieldName, value) {
  if (!MANYCHAT_API_KEY) {
    console.warn('[manychat] MANYCHAT_API_KEY not configured')
    return { ok: false, error: 'MANYCHAT_API_KEY not set' }
  }

  try {
    const res = await fetch(`${MANYCHAT_BASE}/page/setCustomFieldByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MANYCHAT_API_KEY}`,
      },
      body: JSON.stringify({
        field_name: fieldName,
        field_value: value,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[manychat] API error:', res.status, body)
      return { ok: false, error: `ManyChat API ${res.status}` }
    }

    const data = await res.json()
    return { ok: true, data }
  } catch (err) {
    console.error('[manychat] Network error:', err.message)
    return { ok: false, error: err.message }
  }
}

/**
 * Fire-and-forget ManyChat field update.
 */
export function fireManyChatUpdate(fieldName, value) {
  setCustomField(fieldName, value).catch(err => {
    console.error('[manychat] Fire-and-forget error:', err.message)
  })
}
