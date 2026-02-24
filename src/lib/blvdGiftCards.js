// src/lib/blvdGiftCards.js
// Boulevard gift card sync — creates matching gift cards in BLVD
// after our Square payment succeeds, so they appear under the
// "Gift card" payment method at checkout.

import { adminQuery } from '@/server/blvdAdmin'

// Default location for gift card origination (Westfield)
const DEFAULT_LOCATION_ID = process.env.BLVD_LOCATION_ID_WESTFIELD || 'cf34bcaa-6702-46c6-9f5f-43be8943cc58'

/**
 * Create a gift card in Boulevard's system.
 * Uses the same code we generated (RLXE-XXXX-XXXX) so the front desk
 * can look it up by code at checkout.
 */
export async function createBlvdGiftCard(code, amountCents, opts = {}) {
  const locationId = opts.locationId || DEFAULT_LOCATION_ID
  const locationUrn = locationId.startsWith('urn:')
    ? locationId
    : `urn:blvd:Location:${locationId}`

  const data = await adminQuery(
    `mutation CreateGiftCard($input: CreateGiftCardInput!) {
      createGiftCard(input: $input) {
        giftCard { id code currentBalance }
      }
    }`,
    {
      input: {
        amount: amountCents,
        code,
        locationId: locationUrn,
        note: opts.note || null,
      },
    }
  )

  const gc = data.createGiftCard.giftCard
  return { giftCardId: gc.id, code: gc.code, balance: gc.currentBalance }
}

/**
 * Tell Boulevard to email the gift card to the recipient.
 * Supports scheduled delivery via deliveryDate.
 */
export async function createBlvdEmailFulfillment(giftCardId, { recipientEmail, recipientName, senderName, message, deliveryDate }) {
  const input = {
    giftCardId,
    recipientEmail,
    recipientName,
    senderName,
  }
  if (message) input.messageFromSender = message
  if (deliveryDate) input.deliveryDate = deliveryDate

  const data = await adminQuery(
    `mutation CreateGiftCardEmailFulfillment($input: CreateGiftCardEmailFulfillmentInput!) {
      createGiftCardEmailFulfillment(input: $input) {
        giftCardEmailFulfillment { id }
      }
    }`,
    { input }
  )

  return data.createGiftCardEmailFulfillment?.giftCardEmailFulfillment
}

/**
 * Sync a single gift card to Boulevard: create + email fulfillment.
 * Non-blocking — logs errors but doesn't throw.
 *
 * @param {object} opts
 * @param {string} opts.code - RLXE-XXXX-XXXX code
 * @param {number} opts.amountCents - Gift card value
 * @param {string} opts.senderName
 * @param {string} opts.senderEmail
 * @param {string} opts.recipientName
 * @param {string} opts.recipientEmail
 * @param {string} [opts.message] - Personal message
 * @param {string} [opts.deliverAt] - ISO date for scheduled delivery (null = immediate)
 * @param {boolean} [opts.isBonus] - Whether this is a bonus card
 * @returns {{ ok: boolean, giftCardId?: string, error?: string }}
 */
export async function syncOneGiftCard(opts) {
  try {
    // 1. Create the gift card in Boulevard
    const result = await createBlvdGiftCard(opts.code, opts.amountCents, {
      note: opts.isBonus
        ? `Bonus gift card (online purchase by ${opts.senderName})`
        : `Online gift card from ${opts.senderName} to ${opts.recipientName}`,
    })

    // 2. Create email fulfillment (Boulevard sends the email)
    await createBlvdEmailFulfillment(result.giftCardId, {
      recipientEmail: opts.recipientEmail,
      recipientName: opts.recipientName,
      senderName: opts.senderName,
      message: opts.message || null,
      deliveryDate: opts.deliverAt ? opts.deliverAt.split('T')[0] : null,
    })

    console.log(`[gift-cards] BLVD sync OK: code=${opts.code}, blvdId=${result.giftCardId}`)
    return { ok: true, giftCardId: result.giftCardId }
  } catch (err) {
    console.error(`[gift-cards] BLVD sync failed for ${opts.code}:`, err.message)
    return { ok: false, error: err.message }
  }
}
