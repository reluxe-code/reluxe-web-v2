// src/pages/api/admin/social-engine/notify-provider.js
// SMS the copy package to the provider via Bird.
import { getServiceClient } from '@/lib/supabase'
import { sendSMS } from '@/lib/bird'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { campaignId, phone } = req.body
  if (!campaignId) return res.status(400).json({ error: 'campaignId required' })
  if (!phone) return res.status(400).json({ error: 'phone required' })

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

  const firstName = (campaign.provider_name || '').split(' ')[0] || 'Hey'
  const slotsText = (campaign.time_slots || [])
    .map(s => s.label || s.startTime)
    .join(', ')

  const smsBody =
    `Hi ${firstName}! Your open slots have been promoted on IG Stories.\n\n` +
    `Service: ${campaign.service_name || campaign.service_slug}\n` +
    `Times: ${slotsText}\n` +
    `Keyword: ${campaign.keyword}\n\n` +
    `Download image: ${campaign.image_url}\n` +
    `Booking link: ${campaign.booking_url}\n\n` +
    `Post the image to your IG Story and tell patients to comment "${campaign.keyword}" to book!`

  try {
    const smsResult = await sendSMS(phone, smsBody)

    await db
      .from('social_campaigns')
      .update({
        sms_sent: true,
        sms_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)

    res.json({ ok: true, sms: smsResult })
  } catch (err) {
    console.error('[social-engine/notify-provider]', err.message)
    res.status(500).json({ error: err.message || 'SMS failed' })
  }
}

export default withAdminAuth(handler)
