// src/lib/giftCards.js
// Shared helpers for the Gift Card system.

import { getSmtpConfig, escHtml } from '@/lib/email'

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

export function generateGiftCardCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `RLXE-${seg()}-${seg()}`
}

export function generateClaimToken() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatCents(cents) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

// ---------------------------------------------------------------------------
// Promo validation
// ---------------------------------------------------------------------------

export async function validatePromo(db, { code, amountCents }) {
  const now = new Date().toISOString()

  let query = db
    .from('gift_card_promotions')
    .select('*')
    .eq('is_active', true)
    .lte('starts_at', now)

  if (code) {
    query = query.ilike('promo_code', code.trim())
  } else {
    query = query.is('promo_code', null)
  }

  const { data: promos } = await query

  if (!promos?.length) return { valid: false, error: 'Invalid promo code' }

  // Filter by date window and amount range
  const matching = promos.filter((p) => {
    if (p.ends_at && p.ends_at < now) return false
    if (amountCents < p.min_purchase_cents) return false
    if (p.max_purchase_cents && amountCents > p.max_purchase_cents) return false
    if (p.max_claims && p.total_claimed >= p.max_claims) return false
    return true
  })

  if (!matching.length) {
    if (code) return { valid: false, error: 'This code doesn\u2019t apply to your selected amount' }
    return { valid: false, error: null } // no auto-applied promo, not an error
  }

  // Pick best match (highest value)
  const promo = matching.sort((a, b) => {
    const aVal = calculateBonusOrDiscount(a, amountCents)
    const bVal = calculateBonusOrDiscount(b, amountCents)
    return bVal.totalBenefit - aVal.totalBenefit
  })[0]

  const result = calculateBonusOrDiscount(promo, amountCents)
  return { valid: true, promo, ...result }
}

export function calculateBonusOrDiscount(promo, amountCents) {
  let bonusCents = 0
  let discountCents = 0

  switch (promo.promo_type) {
    // New types
    case 'bonus_flat':
      // Spend $X+, get flat $Y bonus (e.g. $100+ → $20, $1000+ → still $20)
      if (amountCents >= (promo.min_purchase_cents || 0)) {
        bonusCents = promo.promo_value_cents || 0
      }
      break
    case 'bonus_tiered':
      // Every $X, get $Y (e.g. every $100 → $20, so $200 = $40, $150 = $20)
      if (promo.min_purchase_cents > 0) {
        const tiers = Math.floor(amountCents / promo.min_purchase_cents)
        bonusCents = tiers * (promo.promo_value_cents || 0)
      }
      break
    case 'service_voucher':
      // Spend $X+, get free service — no monetary bonus
      break
    // Legacy types (backward compat)
    case 'bonus_fixed':
      bonusCents = promo.promo_value_cents || 0
      break
    case 'bonus_percentage':
      bonusCents = Math.floor(amountCents * (parseFloat(promo.promo_percentage) / 100))
      break
    case 'discount_fixed':
      discountCents = Math.min(promo.promo_value_cents || 0, amountCents - 100)
      break
    case 'discount_percentage':
      discountCents = Math.floor(amountCents * (parseFloat(promo.promo_percentage) / 100))
      discountCents = Math.min(discountCents, amountCents - 100)
      break
  }

  return {
    bonusCents,
    discountCents,
    totalBenefit: bonusCents + discountCents,
    chargeAmountCents: amountCents - discountCents,
  }
}

// ---------------------------------------------------------------------------
// Auto-applied promos (no code required, shown on the amount step)
// ---------------------------------------------------------------------------

export async function getAutoAppliedPromos(db) {
  const now = new Date().toISOString()
  const { data } = await db
    .from('gift_card_promotions')
    .select('*')
    .eq('is_active', true)
    .is('promo_code', null)
    .lte('starts_at', now)
    .order('sort_order', { ascending: true })

  return (data || []).filter((p) => !p.ends_at || p.ends_at >= now)
}

// ---------------------------------------------------------------------------
// Email: Gift card delivery
// ---------------------------------------------------------------------------

export async function sendGiftCardEmail({ order, card, isBonus = false }) {
  const smtp = getSmtpConfig()
  if (!smtp) {
    console.warn('[gift-cards] SMTP not configured, skipping email')
    return false
  }

  const recipientName = isBonus && order.bonus_recipient_choice === 'sender'
    ? order.sender_name
    : order.recipient_name
  const recipientEmail = isBonus && order.bonus_recipient_choice === 'sender'
    ? order.sender_email
    : order.recipient_email

  const amount = formatCents(card.original_amount_cents)
  const senderName = escHtml(order.sender_name)
  const message = order.personal_message ? escHtml(order.personal_message) : null

  const subject = isBonus
    ? `You received a bonus gift card from RELUXE`
    : `${escHtml(order.sender_name)} sent you a RELUXE Gift Card`

  const html = buildGiftCardEmailHtml({
    recipientName: escHtml(recipientName),
    senderName,
    amount,
    code: card.code,
    message,
    isBonus,
    occasion: order.occasion,
    expiresAt: new Date(card.expires_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  })

  // Use hello@ as the from address for gift card emails
  const fromAddress = process.env.GIFT_CARD_FROM_EMAIL || 'hello@reluxemedspa.com'

  console.log(`[gift-cards] Sending email: to=${recipientEmail}, from=${fromAddress}, subject="${subject}"`)

  await smtp.transporter.sendMail({
    from: `RELUXE Med Spa <${fromAddress}>`,
    to: recipientEmail,
    subject,
    html,
  })

  return true
}

function buildGiftCardEmailHtml({ recipientName, senderName, amount, code, message, isBonus, occasion, expiresAt }) {
  const occasionText = {
    birthday: 'Happy Birthday!',
    valentines: 'Happy Valentine\u2019s Day!',
    mothers_day: 'Happy Mother\u2019s Day!',
    thank_you: 'Thank You!',
    anniversary: 'Happy Anniversary!',
    just_because: 'Just Because.',
  }[occasion] || ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #FAF8F5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
  .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
  .card { background: #1A1A1A; border-radius: 16px; padding: 40px 32px; text-align: center; }
  .logo { font-size: 14px; font-weight: 600; letter-spacing: 0.15em; color: #8A8580; text-transform: uppercase; margin-bottom: 24px; }
  .occasion { font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #7C3AED; margin-bottom: 8px; }
  .amount { font-size: 48px; font-weight: 700; background: linear-gradient(135deg, #7C3AED, #C026D3, #E11D73); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 16px 0; }
  .label { font-size: 14px; color: #8A8580; margin-bottom: 4px; }
  .code { font-size: 24px; font-weight: 700; letter-spacing: 0.08em; color: #FAF8F5; margin: 8px 0 24px; }
  .message-box { background: rgba(250,248,245,0.06); border-radius: 12px; padding: 16px 20px; margin: 24px 0; }
  .message { font-size: 15px; line-height: 1.6; color: rgba(250,248,245,0.7); font-style: italic; }
  .from { font-size: 13px; color: rgba(250,248,245,0.4); margin-top: 8px; }
  .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7C3AED, #C026D3); color: #ffffff; text-decoration: none; border-radius: 999px; font-size: 15px; font-weight: 600; margin: 24px 0 8px; }
  .footer { text-align: center; padding: 24px; font-size: 12px; color: #8A8580; line-height: 1.6; }
  .divider { width: 40px; height: 2px; background: linear-gradient(135deg, #7C3AED, #C026D3); margin: 20px auto; border-radius: 1px; }
  .locations { background: rgba(250,248,245,0.05); border-radius: 12px; padding: 20px; margin-top: 24px; text-align: center; }
  .locations p { margin: 0; font-size: 13px; color: rgba(250,248,245,0.5); line-height: 1.6; }
  .locations .loc-name { font-weight: 600; color: rgba(250,248,245,0.7); }
  .locations .phone { font-size: 15px; font-weight: 600; color: #7C3AED; margin-top: 12px; }
  .locations .phone a { color: #7C3AED; text-decoration: none; }
</style></head><body>
<div class="container">
  <div class="card">
    <div class="logo">RELUXE Med Spa</div>
    ${occasionText ? `<div class="occasion">${occasionText}</div>` : ''}
    <div class="amount">${amount}</div>
    <p style="font-size: 15px; color: rgba(250,248,245,0.55); margin: 0 0 4px;">Gift Card</p>
    <div class="divider"></div>
    <div class="label">Your Gift Card Code</div>
    <div class="code">${code}</div>
    ${message ? `<div class="message-box"><p class="message">\u201C${message}\u201D</p><p class="from">\u2014 ${senderName}</p></div>` : `<p style="font-size:14px; color:rgba(250,248,245,0.5);">From ${senderName}</p>`}
    <a href="https://reluxemedspa.com/start" class="btn">Book Your Service</a>
    <p style="font-size: 12px; color: rgba(250,248,245,0.3); margin-top: 8px;">Present code <strong>${code}</strong> when you book or check in</p>
    <div class="locations">
      <p><span class="loc-name">Westfield</span><br>2503 E 146th St, Suite 100, Westfield, IN 46074</p>
      <p style="margin-top: 10px;"><span class="loc-name">Carmel</span><br>14390 Clay Terrace Blvd, Suite 159, Carmel, IN 46032</p>
      <p class="phone"><a href="tel:+13177631142">(317) 763-1142</a></p>
    </div>
  </div>
  <div class="footer">
    <p>Valid at both RELUXE Med Spa locations</p>
    <p>Gift card expires ${expiresAt}</p>
    <p style="margin-top: 12px;"><a href="https://reluxemedspa.com/gift-card-terms" style="color: #7C3AED; text-decoration: underline;">Terms & Conditions</a></p>
  </div>
</div>
</body></html>`
}

// ---------------------------------------------------------------------------
// Resolve recipient member
// ---------------------------------------------------------------------------

export async function resolveRecipientByEmail(db, email) {
  if (!email) return null
  const { data } = await db
    .from('members')
    .select('id, first_name, last_name, email, blvd_client_id')
    .ilike('email', email.trim())
    .limit(1)
    .maybeSingle()
  return data || null
}
