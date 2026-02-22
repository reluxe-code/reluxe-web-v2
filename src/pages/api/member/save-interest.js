import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

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

  const { key, value } = req.body
  if (!key) return res.status(400).json({ error: 'key is required' })

  const prefs = member.preferences || {}

  if (value === null || value === undefined) {
    delete prefs[key]
  } else if (Array.isArray(prefs[key])) {
    if (prefs[key].includes(value)) {
      prefs[key] = prefs[key].filter(v => v !== value)
    } else {
      prefs[key].push(value)
    }
  } else {
    prefs[key] = value
  }

  const { error: updateErr } = await db
    .from('members')
    .update({ preferences: prefs, updated_at: new Date().toISOString() })
    .eq('id', member.id)

  if (updateErr) return res.status(500).json({ error: updateErr.message })

  return res.json({ ok: true, preferences: prefs })
}
