// src/pages/api/audit/config.js
// Returns whether audit tracking is enabled (feature flag from site_config).
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()
  const { data } = await db
    .from('site_config')
    .select('value')
    .eq('key', 'audit_tracking_enabled')
    .single()

  const enabled = data?.value !== false && data?.value !== 'false'

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  return res.status(200).json({ enabled })
}
