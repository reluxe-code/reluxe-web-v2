// src/pages/api/admin/social-engine/activate.js
// Pushes the booking URL to ManyChat and activates the campaign.
import { getServiceClient } from '@/lib/supabase'
import { setCustomField } from '@/lib/social-engine/manychat'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { campaignId } = req.body
  if (!campaignId) return res.status(400).json({ error: 'campaignId required' })

  const db = getServiceClient()

  // Load campaign
  const { data: campaign, error: loadErr } = await db
    .from('social_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (loadErr || !campaign) {
    return res.status(404).json({ error: 'Campaign not found' })
  }

  if (campaign.status !== 'draft') {
    return res.status(400).json({ error: `Campaign is ${campaign.status}, must be draft to activate` })
  }

  try {
    // Load config for ManyChat field name
    const { data: configRow } = await db
      .from('site_config')
      .select('value')
      .eq('key', 'social_engine')
      .single()

    const config = configRow?.value || {}
    const fieldName = config.manychat_field || 'current_promo_link'

    // Push to ManyChat
    const mcResult = await setCustomField(fieldName, campaign.booking_url)

    // Update campaign status
    const { data: updated, error: updateErr } = await db
      .from('social_campaigns')
      .update({
        status: 'active',
        manychat_synced: mcResult.ok,
        manychat_synced_at: mcResult.ok ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .select()
      .single()

    if (updateErr) throw updateErr

    res.json({
      ok: true,
      campaign: updated,
      manychat: mcResult,
    })
  } catch (err) {
    console.error('[social-engine/activate]', err.message)
    res.status(500).json({ error: err.message || 'Activation failed' })
  }
}
