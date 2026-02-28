// src/pages/api/admin/concierge/config.js
// GET: read engine config + campaign templates.
// POST: update campaign templates + engine config.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const db = getServiceClient()

  if (req.method === 'GET') {
    try {
      const [configRes, campaignsRes] = await Promise.all([
        db.from('site_config').select('value').eq('key', 'concierge_engine').single(),
        db.from('concierge_campaigns').select('*').order('priority'),
      ])

      return res.json({
        engine: configRes.data?.value || {},
        campaigns: campaignsRes.data || [],
      })
    } catch (err) {
      console.error('[concierge/config] GET error:', err)
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'POST') {
    try {
      const { engine, campaigns } = req.body

      // Update engine config
      if (engine) {
        const { error } = await db
          .from('site_config')
          .update({ value: engine, updated_at: new Date().toISOString() })
          .eq('key', 'concierge_engine')

        if (error) throw error
      }

      // Upsert campaign templates
      if (campaigns && Array.isArray(campaigns)) {
        for (const campaign of campaigns) {
          const { error } = await db
            .from('concierge_campaigns')
            .update({
              variant_a_template: campaign.variant_a_template,
              variant_b_template: campaign.variant_b_template || null,
              ab_split: campaign.ab_split ?? 0.5,
              active: campaign.active ?? true,
              updated_at: new Date().toISOString(),
            })
            .eq('campaign_slug', campaign.campaign_slug)

          if (error) throw error
        }
      }

      return res.json({ ok: true })
    } catch (err) {
      console.error('[concierge/config] POST error:', err)
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
