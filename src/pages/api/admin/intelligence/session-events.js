// src/pages/api/admin/intelligence/session-events.js
// Returns all events for a given experiment session — powers the detail drawer.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'
import { maskPhone, maskEmail, nameInitial } from '@/lib/piiHash'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { session_id } = req.query
  if (!session_id) return res.status(400).json({ error: 'session_id required' })

  const db = getServiceClient()

  try {
    // Fetch session metadata
    const { data: session, error: sErr } = await db
      .from('experiment_sessions')
      .select('*')
      .eq('session_id', session_id)
      .single()

    if (sErr) throw sErr

    // Fetch all events for this session, chronological
    const { data: events, error: eErr } = await db
      .from('experiment_events')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    if (eErr) throw eErr

    // Mask PII before sending
    const maskedSession = { ...session }
    maskedSession.contact_phone = maskPhone(session.contact_phone)
    maskedSession.client_email = maskEmail(session.client_email)
    maskedSession.client_name = session.client_name_initial || nameInitial(session.client_name) || null

    res.json({ session: maskedSession, events })
  } catch (err) {
    console.error('[admin/intelligence/session-events]', err.message)
    res.status(500).json({ error: err.message || 'Unknown error' })
  }
}

export default withAdminAuth(handler)
