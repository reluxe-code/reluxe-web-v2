import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

/**
 * Resolve short TikTok URLs (tiktok.com/t/xxx) to full URLs with video ID.
 * Follows the redirect without downloading the page body.
 */
async function resolveTikTokUrl(url) {
  if (!url) return url
  // Already a full URL with video ID
  if (/tiktok\.com\/@[^/]+\/video\/\d+/.test(url)) return url
  // Only resolve short links
  if (!/tiktok\.com\/t\//.test(url) && !/vm\.tiktok\.com\//.test(url)) return url

  try {
    const resp = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    const resolved = resp.url
    // The resolved URL should contain /video/NNNN
    if (/\/video\/\d+/.test(resolved)) return resolved
    return url // couldn't resolve, keep original
  } catch {
    return url
  }
}

/** Resolve all TikTok short links in embed arrays */
async function resolveEmbeds(embeds) {
  if (!Array.isArray(embeds) || embeds.length === 0) return embeds
  return Promise.all(embeds.map(async (e) => {
    if (e.platform === 'tiktok' && e.url) {
      return { ...e, url: await resolveTikTokUrl(e.url) }
    }
    return e
  }))
}

async function resolveTreatmentEmbeds(treatments) {
  if (!Array.isArray(treatments) || treatments.length === 0) return treatments
  return Promise.all(treatments.map(async (t) => {
    if (t.embeds?.length > 0) {
      return { ...t, embeds: await resolveEmbeds(t.embeds) }
    }
    return t
  }))
}

async function handler(req, res) {
  const client = getServiceClient()
  const { action } = req.query

  // GET ?action=list
  if (req.method === 'GET' && action === 'list') {
    const { data, error } = await client
      .from('stories')
      .select('*')
      .order('sort_order')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  // GET ?action=get&id=xxx
  if (req.method === 'GET' && action === 'get') {
    const { id } = req.query
    const { data, error } = await client
      .from('stories')
      .select('*')
      .eq('id', id)
      .limit(1)
      .single()
    if (error) return res.status(404).json({ error: error.message })
    return res.status(200).json({ data })
  }

  // POST ?action=save
  if (req.method === 'POST' && action === 'save') {
    const body = req.body
    const isNew = !body.id

    const payload = {
      slug: body.slug,
      status: body.status || 'draft',
      person_name: body.person_name,
      person_title: body.person_title || null,
      person_image: body.person_image || null,
      title: body.title,
      subtitle: body.subtitle || null,
      hero_image: body.hero_image || null,
      hero_video_url: body.hero_video_url || null,
      intro: body.intro || null,
      body_html: body.body_html || null,
      treatments: body.treatments || [],
      social_embeds: body.social_embeds || [],
      gallery: body.gallery || [],
      cta_text: body.cta_text || 'Book Your Consultation',
      cta_link: body.cta_link || '/start/not-sure',
      meta_description: body.meta_description || null,
      og_image: body.og_image || null,
      sort_order: body.sort_order ?? 0,
      featured: body.featured ?? false,
      updated_at: new Date().toISOString(),
    }

    // Resolve TikTok short URLs before saving
    payload.treatments = await resolveTreatmentEmbeds(payload.treatments)
    payload.social_embeds = await resolveEmbeds(payload.social_embeds)

    let result
    if (isNew) {
      result = await client.from('stories').insert(payload).select()
    } else {
      result = await client.from('stories').update(payload).eq('id', body.id).select()
    }

    if (result.error) return res.status(400).json({ error: result.error.message })
    return res.status(200).json({ data: result.data?.[0], ok: true })
  }

  // POST ?action=delete
  if (req.method === 'POST' && action === 'delete') {
    const { id } = req.body
    const { error } = await client.from('stories').delete().eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: 'Unknown action' })
}

export default withAdminAuth(handler)
