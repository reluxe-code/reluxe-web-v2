// src/lib/bird.js
// Bird (formerly MessageBird) SMS helper.
// Sends SMS via Bird's REST API. Gracefully returns false if env vars not set.

import { safeError } from '@/lib/logSanitizer'

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

  // Normalize to E.164 format
  const digits = to.replace(/\D/g, '')
  const phone = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith('1') ? `+${digits}` : to.startsWith('+') ? to : `+${digits}`

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
            contacts: [{ identifierValue: phone }],
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
      safeError('[bird] SMS send failed:', res.status, body)
      return { ok: false, error: `Bird API error: ${res.status}` }
    }

    // Extract Bird message ID for webhook correlation
    const data = await res.json().catch(() => ({}))
    return { ok: true, messageId: data.id || data.messageId || null }
  } catch (err) {
    safeError('[bird] SMS send error:', err.message)
    return { ok: false, error: err.message }
  }
}
