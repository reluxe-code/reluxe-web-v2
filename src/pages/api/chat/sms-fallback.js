// POST /api/chat/sms-fallback — SMS handoff endpoint
// Sends an SMS via Bird so a team member can follow up.
// Phone passes through to Bird API only — never written to any database.

import { getClientIp, applyRateLimit } from '@/lib/rateLimit'
import { chatLimiters } from '@/lib/chat/chatRateLimit'
import { sendSMS } from '@/lib/bird'
import { getServiceClient } from '@/lib/supabase'
import { safeLog, safeError } from '@/lib/logSanitizer'

const CHAT_ENABLED = process.env.CHAT_ENABLED !== 'false'

export default async function handler(req, res) {
  if (!CHAT_ENABLED) {
    return res.status(503).json({ error: 'Chat is currently unavailable.' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)

  // Rate limit: SMS fallbacks per hour
  if (applyRateLimit(req, res, chatLimiters.sms, ip)) return

  const { sessionId, phone } = req.body

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' })
  }

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required.' })
  }

  // Normalize phone to E.164
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' })
  }

  const e164 = digits.length === 10
    ? `+1${digits}`
    : digits.length === 11 && digits.startsWith('1')
      ? `+${digits}`
      : `+${digits}`

  try {
    const message = [
      'Hi! You were chatting with our AI assistant on reluxemedspa.com.',
      'A team member will follow up with you shortly.',
      'You can also reply here or call (317) 763-1142.',
      '-RELUXE Med Spa',
      'Reply STOP to opt out',
    ].join('\n')

    const result = await sendSMS(e164, message)

    if (!result.ok) {
      safeError('[chat/sms-fallback] sendSMS failed', result)
      return res.status(500).json({
        error: 'Could not send SMS. Please call us directly at (317) 763-1142.',
      })
    }

    safeLog('[chat/sms-fallback] SMS sent', { sessionId })

    // Update session metadata — mark as sms_fallback, set sms_sent flag
    // Phone is NOT written to the database
    try {
      const supabase = getServiceClient()
      await supabase
        .from('chat_sessions')
        .update({
          outcome: 'sms_fallback',
          sms_sent: true,
          last_message_at: new Date().toISOString(),
        })
        .eq('session_token', sessionId)
    } catch (dbErr) {
      safeError('[chat/sms-fallback] session update', dbErr.message)
      // Non-fatal — SMS was already sent
    }

    return res.status(200).json({
      success: true,
      message: 'SMS sent! A team member will text you back shortly.',
    })
  } catch (err) {
    safeError('[chat/sms-fallback] handler error', err.message)
    return res.status(500).json({
      error: 'Something went wrong. Please call us at (317) 763-1142.',
    })
  }
}
