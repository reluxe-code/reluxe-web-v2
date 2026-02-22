// src/pages/api/member/tox-update.js
// PATCH: Update tox brand preference or log external tox treatment.
import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'PATCH only' })

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' })

  const db = getServiceClient()

  const { data: member } = await db
    .from('members')
    .select('id, preferences')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!member) return res.status(404).json({ error: 'Member not found' })

  const prefs = member.preferences || {}
  const { action, tox_brand, external_date, external_brand, external_note } = req.body

  if (action === 'set_brand') {
    prefs.tox_brand = tox_brand || null
  } else if (action === 'log_external') {
    if (!external_date) return res.status(400).json({ error: 'Date required' })
    if (!prefs.external_tox) prefs.external_tox = []
    prefs.external_tox.push({
      date: external_date,
      brand: external_brand || null,
      note: external_note || 'Got it elsewhere',
      logged_at: new Date().toISOString(),
    })
  } else {
    return res.status(400).json({ error: 'Invalid action' })
  }

  const { error: updateErr } = await db
    .from('members')
    .update({ preferences: prefs, updated_at: new Date().toISOString() })
    .eq('id', member.id)

  if (updateErr) return res.status(500).json({ error: updateErr.message })

  return res.json({ ok: true, preferences: prefs })
}
