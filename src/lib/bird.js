// src/lib/bird.js
// Bird (formerly MessageBird) SMS helper.
// Sends SMS via Bird's REST API. Gracefully returns false if env vars not set.

const WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID
const CHANNEL_ID = process.env.BIRD_CHANNEL_ID
const ACCESS_KEY = process.env.BIRD_ACCESS_KEY

/**
 * Send an SMS via Bird.
 * @param {string} to - Phone number in E.164 format (e.g. +13175551234)
 * @param {string} text - Message body
 * @returns {{ ok: boolean, error?: string }}
 */
export async function sendSMS(to, text) {
  if (!WORKSPACE_ID || !CHANNEL_ID || !ACCESS_KEY) {
    console.warn('[bird] SMS not configured — missing BIRD env vars')
    return { ok: false, error: 'SMS not configured' }
  }

  try {
    const res = await fetch(
      `https://api.bird.com/workspaces/${WORKSPACE_ID}/channels/${CHANNEL_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `AccessKey ${ACCESS_KEY}`,
        },
        body: JSON.stringify({
          receiver: {
            contacts: [{ identifierValue: to }],
          },
          body: {
            type: 'text',
            text: { text },
          },
        }),
      }
    )

    if (!res.ok) {
      const body = await res.text()
      console.error('[bird] SMS send failed:', res.status, body)
      return { ok: false, error: `Bird API error: ${res.status}` }
    }

    return { ok: true }
  } catch (err) {
    console.error('[bird] SMS send error:', err.message)
    return { ok: false, error: err.message }
  }
}
