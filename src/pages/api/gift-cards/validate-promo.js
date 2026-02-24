// POST /api/gift-cards/validate-promo
// Validate a promo code for a given gift card amount
import { getServiceClient } from '@/lib/supabase'
import { validatePromo } from '@/lib/giftCards'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { code, amountCents } = req.body || {}

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, error: 'Promo code is required' })
  }
  if (!amountCents || amountCents < 2500) {
    return res.status(400).json({ valid: false, error: 'Invalid amount' })
  }

  const db = getServiceClient()
  const result = await validatePromo(db, { code: code.trim().toUpperCase(), amountCents })

  if (!result.valid) {
    return res.json({ valid: false, error: result.error })
  }

  return res.json({
    valid: true,
    promoId: result.promo.id,
    promoName: result.promo.name,
    promoDescription: result.promo.description,
    promoType: result.promo.promo_type,
    bonusCents: result.bonusCents,
    discountCents: result.discountCents,
    chargeAmountCents: result.chargeAmountCents,
    bonusRecipient: result.promo.bonus_recipient,
    bonusServiceName: result.promo.bonus_service_name,
  })
}
