// POST /api/gift-cards/create-checkout
// Multi-item cart checkout: processes one Square payment, creates multiple gift cards,
// syncs each to Boulevard (non-blocking), sends our own branded emails.
import { getServiceClient } from '@/lib/supabase'
import { SquareClient, SquareEnvironment } from 'square'
import {
  generateGiftCardCode,
  generateClaimToken,
  resolveRecipientByEmail,
  getAutoAppliedPromos,
  calculateBonusOrDiscount,
  sendGiftCardEmail,
} from '@/lib/giftCards'
import { syncOneGiftCard } from '@/lib/blvdGiftCards'
import { trackBirdEvent } from '@/lib/birdTracking'
import { fireCAPIEvent, buildUserData } from '@/lib/metaCAPI'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'

const isSandbox = (process.env.SQUARE_APPLICATION_ID || '').startsWith('sandbox-')

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: isSandbox ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (applyRateLimit(req, res, rateLimiters.tight, getClientIp(req))) return

  try {
    const {
      sourceId,
      items,           // [{ id, amountCents, recipientName, recipientEmail, message, occasion }]
      senderName,
      senderEmail,
      deliverAt,       // ISO date string or null for immediate
      bonusChoices,    // { itemId: 'sender'|'recipient' }
    } = req.body || {}

    // ─── Validation ───
    if (!sourceId) return res.status(400).json({ error: 'Payment source required' })
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'At least one gift card required' })
    if (!senderName || !senderEmail) return res.status(400).json({ error: 'Sender details required' })

    const minAmountCents = isSandbox ? 25 : 2500

    for (const item of items) {
      if (!item.amountCents || item.amountCents < minAmountCents || item.amountCents > 200000) {
        return res.status(400).json({ error: isSandbox ? 'Amount must be between $0.25 and $2,000' : `Amount must be between $25 and $2,000` })
      }
      if (!item.recipientName || !item.recipientEmail) {
        return res.status(400).json({ error: 'Each gift card needs a recipient name and email' })
      }
    }

    const db = getServiceClient()

    // ─── Auto-applied promos (bonuses) ───
    const autoPromos = await getAutoAppliedPromos(db)

    // Calculate bonus for each item
    const itemsWithBonus = items.map(item => {
      const matching = autoPromos
        .filter(p => item.amountCents >= p.min_purchase_cents && (!p.max_purchase_cents || item.amountCents <= p.max_purchase_cents))
        .sort((a, b) => {
          const aVal = calculateBonusOrDiscount(a, item.amountCents)
          const bVal = calculateBonusOrDiscount(b, item.amountCents)
          return bVal.totalBenefit - aVal.totalBenefit
        })
      const promo = matching[0] || null
      const bonusCents = promo ? calculateBonusOrDiscount(promo, item.amountCents).bonusCents : 0
      const bonusChoice = bonusChoices?.[item.id] || promo?.bonus_recipient || 'recipient'
      return { ...item, promo, bonusCents, bonusChoice }
    })

    const subtotalCents = items.reduce((s, i) => s + i.amountCents, 0)
    const chargeAmountCents = subtotalCents
    const minCharge = isSandbox ? 25 : 100

    if (chargeAmountCents < minCharge) {
      return res.status(400).json({ error: 'Charge amount too low' })
    }

    // ─── Create order record (pending) ───
    const idempotencyKey = `gc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const senderMember = await resolveRecipientByEmail(db, senderEmail)

    const { data: order, error: orderErr } = await db.from('gift_card_orders').insert({
      amount_cents: subtotalCents,
      discount_cents: 0,
      payment_status: 'pending',
      sender_name: senderName.trim(),
      sender_email: senderEmail.trim().toLowerCase(),
      sender_member_id: senderMember?.id || null,
      recipient_name: items[0].recipientName.trim(),
      recipient_email: items[0].recipientEmail.trim().toLowerCase(),
      personal_message: items[0].message?.trim()?.slice(0, 200) || null,
      occasion: items[0].occasion || null,
      deliver_at: deliverAt || null,
      delivery_status: deliverAt ? 'scheduled' : 'pending',
      bonus_amount_cents: itemsWithBonus.reduce((s, i) => s + i.bonusCents, 0),
    }).select('id').single()

    if (orderErr) {
      console.error('[gift-cards] Order creation failed:', orderErr.message)
      return res.status(500).json({ error: 'Failed to create order' })
    }

    // ─── Process Square payment ───
    try {
      const recipientSummary = items.length === 1
        ? `${items[0].recipientName}`
        : `${items.length} recipients`

      const paymentResponse = await squareClient.payments.create({
        sourceId,
        idempotencyKey,
        amountMoney: {
          amount: BigInt(chargeAmountCents),
          currency: 'USD',
        },
        note: `RELUXE Gift Card${items.length > 1 ? 's' : ''} — ${recipientSummary}`,
        referenceId: order.id,
      })

      const payment = paymentResponse.payment

      await db.from('gift_card_orders').update({
        square_payment_id: payment.id,
        square_order_id: payment.orderId || null,
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      }).eq('id', order.id)

      // ─── Create gift cards for each item ───
      const cards = []

      for (const item of itemsWithBonus) {
        const recipientMember = await resolveRecipientByEmail(db, item.recipientEmail)

        // Determine if bonus adds to main card or creates separate card
        const bonusToRecipient = item.bonusCents > 0 && item.bonusChoice !== 'sender'
        const bonusToSender = item.bonusCents > 0 && item.bonusChoice === 'sender'

        // Main card amount: includes bonus if going to recipient
        const mainCardAmount = item.amountCents + (bonusToRecipient ? item.bonusCents : 0)

        // Main gift card
        const mainCode = generateGiftCardCode()
        const mainClaimToken = generateClaimToken()

        const { data: mainCard } = await db.from('gift_cards').insert({
          order_id: order.id,
          code: mainCode,
          original_amount_cents: mainCardAmount,
          remaining_amount_cents: mainCardAmount,
          owner_member_id: recipientMember?.id || null,
          claim_token: mainClaimToken,
          is_bonus: false,
        }).select('*').single()

        await db.from('gift_card_transactions').insert({
          gift_card_id: mainCard.id,
          event_type: 'purchase',
          amount_cents: mainCardAmount,
          balance_after_cents: mainCardAmount,
        })

        const cardResult = {
          code: mainCard.code,
          amount: mainCard.original_amount_cents,
          recipientName: item.recipientName,
          recipientEmail: item.recipientEmail,
          bonus: bonusToRecipient ? { amount: item.bonusCents, addedToCard: true } : null,
        }

        // Boulevard sync for main card (non-blocking)
        syncOneGiftCard({
          code: mainCode,
          amountCents: mainCardAmount,
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim().toLowerCase(),
          recipientName: item.recipientName.trim(),
          recipientEmail: item.recipientEmail.trim().toLowerCase(),
          message: item.message || null,
          deliverAt: deliverAt || null,
        }).then(result => {
          if (result.ok) {
            db.from('gift_card_orders').update({
              blvd_gift_card_id: result.giftCardId,
              blvd_synced: true,
            }).eq('id', order.id).then(() => {})
          }
        }).catch(() => {})

        // Send our own email for immediate deliveries (non-blocking)
        if (!deliverAt) {
          const emailOrder = {
            sender_name: senderName.trim(),
            sender_email: senderEmail.trim().toLowerCase(),
            recipient_name: item.recipientName.trim(),
            recipient_email: item.recipientEmail.trim().toLowerCase(),
            personal_message: item.message || null,
            occasion: item.occasion || null,
          }
          sendGiftCardEmail({ order: emailOrder, card: mainCard }).catch(err => {
            console.error(`[gift-cards] Email failed for ${mainCode}:`, err.message)
          })
        }

        // Separate bonus card for sender (if they chose to keep it)
        if (bonusToSender && item.promo) {
          const bonusCode = generateGiftCardCode()
          const bonusClaimToken = generateClaimToken()

          const { data: bonusCard } = await db.from('gift_cards').insert({
            order_id: order.id,
            code: bonusCode,
            original_amount_cents: item.bonusCents,
            remaining_amount_cents: item.bonusCents,
            owner_member_id: senderMember?.id || null,
            claim_token: bonusClaimToken,
            is_bonus: true,
          }).select('*').single()

          await db.from('gift_card_transactions').insert({
            gift_card_id: bonusCard.id,
            event_type: 'bonus',
            amount_cents: item.bonusCents,
            balance_after_cents: item.bonusCents,
          })

          cardResult.bonus = {
            code: bonusCard.code,
            amount: bonusCard.original_amount_cents,
            recipientName: senderName.trim(),
          }

          // Boulevard sync for bonus card (non-blocking)
          syncOneGiftCard({
            code: bonusCode,
            amountCents: item.bonusCents,
            senderName: senderName.trim(),
            senderEmail: senderEmail.trim().toLowerCase(),
            recipientName: senderName.trim(),
            recipientEmail: senderEmail.trim().toLowerCase(),
            message: null,
            deliverAt: deliverAt || null,
            isBonus: true,
          }).catch(() => {})

          // Send bonus card email to sender (non-blocking)
          if (!deliverAt) {
            const bonusEmailOrder = {
              sender_name: 'RELUXE Med Spa',
              sender_email: 'hello@reluxemedspa.com',
              recipient_name: senderName.trim(),
              recipient_email: senderEmail.trim().toLowerCase(),
              personal_message: null,
              occasion: null,
            }
            sendGiftCardEmail({ order: bonusEmailOrder, card: bonusCard, isBonus: true }).catch(err => {
              console.error(`[gift-cards] Bonus email failed for ${bonusCode}:`, err.message)
            })
          }
        }

        // Increment promo claim counter
        if (item.bonusCents > 0 && item.promo) {
          try {
            const { error: rpcErr } = await db.rpc('increment_promo_claims', { promo_id: item.promo.id })
            if (rpcErr) {
              // RPC doesn't exist yet — fallback to direct update
              await db.from('gift_card_promotions')
                .update({ total_claimed: (item.promo.total_claimed || 0) + 1, updated_at: new Date().toISOString() })
                .eq('id', item.promo.id)
            }
          } catch {
            await db.from('gift_card_promotions')
              .update({ total_claimed: (item.promo.total_claimed || 0) + 1, updated_at: new Date().toISOString() })
              .eq('id', item.promo.id)
          }
        }

        cards.push(cardResult)
      }

      // Update delivery status
      if (!deliverAt) {
        await db.from('gift_card_orders').update({
          delivery_status: 'sent',
          delivered_at: new Date().toISOString(),
        }).eq('id', order.id)
      }

      // Track conversion in Bird (non-blocking)
      trackBirdEvent('gift_card_purchase',
        { key: 'emailaddress', value: senderEmail.trim().toLowerCase() },
        { order_id: order.id, amount_cents: chargeAmountCents, num_cards: items.length, currency: 'USD' }
      ).catch(() => {})

      // Fire-and-forget: Meta CAPI Purchase event
      fireCAPIEvent({
        eventName: 'Purchase',
        eventId: req.body.event_id || undefined,
        eventSourceUrl: req.headers.referer || 'https://reluxemedspa.com/gift-cards',
        actionSource: 'website',
        userData: buildUserData({
          email: senderEmail,
          firstName: senderName.split(' ')[0],
          lastName: senderName.split(' ').slice(1).join(' ') || undefined,
          fbp: req.cookies?._fbp || req.body._fbp,
          fbc: req.cookies?._fbc || req.body._fbc,
          clientIp: getClientIp(req),
          userAgent: req.headers['user-agent'],
        }),
        customData: {
          value: chargeAmountCents / 100,
          currency: 'USD',
          content_name: 'Gift Card',
          content_type: 'product',
          num_items: items.length,
          order_id: order.id,
        },
      })

      return res.json({
        ok: true,
        orderId: order.id,
        cards,
        charged: chargeAmountCents,
      })
    } catch (payErr) {
      console.error('[gift-cards] Square payment failed:', payErr)

      await db.from('gift_card_orders').update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      }).eq('id', order.id)

      const errorMessage = payErr?.body?.errors?.[0]?.detail || payErr?.errors?.[0]?.detail || payErr.message || 'Payment failed'
      return res.status(402).json({ error: errorMessage })
    }
  } catch (outerErr) {
    console.error('[gift-cards] Unhandled error:', outerErr)
    return res.status(500).json({ error: outerErr.message || 'Internal server error' })
  }
}
