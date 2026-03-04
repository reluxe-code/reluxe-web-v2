// GET  /api/admin/chat-settings — returns { enabled: bool }
// POST /api/admin/chat-settings — body { enabled: bool } — toggles chat on/off

import { withAdminAuth } from '@/lib/adminAuth'
import { getServiceClient } from '@/lib/supabase'

async function handler(req, res) {
  const supabase = getServiceClient()

  if (req.method === 'GET') {
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'chat_enabled')
      .single()

    return res.json({ enabled: data?.value?.enabled !== false })
  }

  if (req.method === 'POST') {
    const { enabled } = req.body
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' })
    }

    const { error } = await supabase
      .from('site_config')
      .upsert(
        { key: 'chat_enabled', value: { enabled }, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (error) {
      return res.status(500).json({ error: 'Failed to update setting' })
    }

    return res.json({ ok: true, enabled })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
