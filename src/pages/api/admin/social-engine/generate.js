// src/pages/api/admin/social-engine/generate.js
// Generates an IG Story image, creates a trackable booking link,
// and stores the campaign record.
import { getServiceClient } from '@/lib/supabase'
import { generateStoryImage } from '@/lib/social-engine/imageGenerator'
import { generateSocialLink } from '@/lib/social-engine/bookingLink'
import { withAdminAuth } from '@/lib/adminAuth'

export const config = { maxDuration: 30 }

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const {
    providerSlug, providerName, locationKey,
    serviceSlug, serviceName,
    timeSlots, keyword, style, caption,
    backgroundUrl,
  } = req.body

  if (!providerSlug || !locationKey || !serviceSlug || !timeSlots?.length || !keyword) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (timeSlots.length > 4) {
    return res.status(400).json({ error: 'Maximum 4 time slots' })
  }

  const db = getServiceClient()

  try {
    // 1. Generate trackable booking link
    const link = await generateSocialLink(db, {
      providerSlug,
      serviceSlug,
    })

    // 2. Generate Story image via Sharp template
    const image = await generateStoryImage({
      backgroundUrl,
      timeSlots,
      keyword: keyword.toUpperCase(),
      style,
      providerName: providerName || providerSlug,
      serviceName: serviceName || serviceSlug,
    })

    // 3. Build suggested caption if not provided
    const slotsText = timeSlots.map(s => s.label || s.startTime).join(', ')
    const autoCaption = caption ||
      `Last-minute availability with ${providerName || providerSlug}! ` +
      `${serviceName || serviceSlug} — ${slotsText}. ` +
      `Comment "${keyword.toUpperCase()}" to get the booking link sent to your DMs.`

    // 4. Insert campaign record
    const { data: campaign, error: insertErr } = await db
      .from('social_campaigns')
      .insert({
        provider_slug: providerSlug,
        provider_name: providerName || providerSlug,
        location_key: locationKey,
        service_slug: serviceSlug,
        service_name: serviceName || serviceSlug,
        time_slots: timeSlots,
        keyword: keyword.toUpperCase(),
        caption: autoCaption,
        image_url: image.imageUrl,
        image_path: image.imagePath,
        booking_url: link.url,
        link_token: link.token,
        status: 'draft',
        utm_params: {
          utm_source: 'ig_story',
          utm_medium: 'social',
          utm_campaign: 'flash_avail',
          utm_content: `${providerSlug}_${serviceSlug}`,
        },
      })
      .select()
      .single()

    if (insertErr) throw insertErr

    // Update the link with the campaign ID
    await db
      .from('concierge_links')
      .update({ utm_content: `${providerSlug}_${campaign.id}` })
      .eq('token', link.token)

    res.json({ ok: true, campaign })
  } catch (err) {
    console.error('[social-engine/generate]', err.message)
    res.status(500).json({ error: err.message || 'Generation failed' })
  }
}

export default withAdminAuth(handler)
