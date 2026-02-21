// src/pages/api/member/interests.js
// Saves interest tags for a member.
import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'

const VALID_INTERESTS = ['tox', 'fillers', 'skin', 'body', 'wellness']

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  // Extract Bearer token
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  // Verify the user
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  const { interests } = req.body || {}
  if (!Array.isArray(interests) || interests.length === 0) {
    return res.status(400).json({ error: 'At least one interest required' })
  }

  // Filter to valid interests only
  const filtered = interests.filter((i) => VALID_INTERESTS.includes(i))
  if (filtered.length === 0) {
    return res.status(400).json({ error: 'No valid interests provided' })
  }

  const db = getServiceClient()
  const { error } = await db
    .from('members')
    .update({
      interests: filtered,
      onboarded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('auth_user_id', user.id)

  if (error) {
    console.error('[member/interests]', error.message)
    return res.status(500).json({ error: 'Failed to save interests' })
  }

  res.json({ success: true, interests: filtered })
}
