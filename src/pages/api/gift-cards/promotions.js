// GET /api/gift-cards/promotions
// Public endpoint — returns active promotions (both auto-applied and code-required)
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const db = getServiceClient()
  const now = new Date().toISOString()

  const { data: promos } = await db
    .from('gift_card_promotions')
    .select('id, name, description, badge_text, promo_code, min_purchase_cents, max_purchase_cents, promo_type, promo_value_cents, promo_percentage, bonus_service_name, bonus_recipient, starts_at, ends_at')
    .eq('is_active', true)
    .lte('starts_at', now)
    .order('sort_order', { ascending: true })

  const active = (promos || []).filter((p) => !p.ends_at || p.ends_at >= now)

  // Split into auto-applied (no code) and code-required
  const autoApplied = active.filter((p) => !p.promo_code)
  const codeRequired = active.filter((p) => !!p.promo_code).map((p) => ({
    // Don't expose the actual code — just that a code promo exists
    id: p.id,
    name: p.name,
    description: p.description,
    badge_text: p.badge_text,
    hasCode: true,
  }))

  return res.json({ autoApplied, codeRequired })
}
