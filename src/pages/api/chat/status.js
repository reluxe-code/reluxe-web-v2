// GET /api/chat/status — public endpoint for ChatWidget to check if chat is enabled
// Reads from site_config table (public-readable via RLS).

import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Cache for 30s to avoid hammering DB on every page load
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')

  try {
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'chat_enabled')
      .single()

    // Default to enabled if no row exists
    const enabled = data?.value?.enabled !== false

    return res.json({ enabled })
  } catch {
    // Fail open — if we can't check, show the widget
    return res.json({ enabled: true })
  }
}
