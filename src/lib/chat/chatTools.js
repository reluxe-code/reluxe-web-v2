// src/lib/chat/chatTools.js
// Tool definitions for Claude and the executor that dispatches to existing Boulevard/Bird APIs.

import { createCartWithItem } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'
import { getCircuitState } from '@/server/circuitBreaker'
import { sendSMS } from '@/lib/bird'
import { CHAT_KNOWLEDGE } from './chatKnowledge'

// ── Tool Definitions (sent to Claude) ──

export const TOOL_DEFINITIONS = [
  {
    name: 'search_services',
    description: 'Search RELUXE services by name, category, or concern. Returns matching services with pricing and booking slugs.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Service name, category, or concern (e.g. "botox", "wrinkles", "facial")' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_providers',
    description: 'Get providers at a location who offer a specific service, including their next available date.',
    input_schema: {
      type: 'object',
      properties: {
        locationKey: { type: 'string', enum: ['westfield', 'carmel'], description: 'Location' },
        serviceSlug: { type: 'string', description: 'Service slug (e.g. "tox", "massage", "facials")' },
      },
      required: ['locationKey', 'serviceSlug'],
    },
  },
  {
    name: 'get_available_dates',
    description: 'Get available booking dates for a service at a location, optionally with a specific provider. Returns an array of date strings.',
    input_schema: {
      type: 'object',
      properties: {
        locationKey: { type: 'string', enum: ['westfield', 'carmel'] },
        serviceItemId: { type: 'string', description: 'Boulevard service item ID (from service booking map)' },
        staffProviderId: { type: 'string', description: 'Optional: Boulevard provider ID to filter by' },
      },
      required: ['locationKey', 'serviceItemId'],
    },
  },
  {
    name: 'get_available_times',
    description: 'Get available time slots for a specific date. Returns array of { startTime } objects.',
    input_schema: {
      type: 'object',
      properties: {
        locationKey: { type: 'string', enum: ['westfield', 'carmel'] },
        serviceItemId: { type: 'string' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        staffProviderId: { type: 'string', description: 'Optional provider ID' },
      },
      required: ['locationKey', 'serviceItemId', 'date'],
    },
  },
  {
    name: 'create_cart',
    description: 'Reserve a specific time slot by creating a booking cart. Returns cartId and booking summary.',
    input_schema: {
      type: 'object',
      properties: {
        locationKey: { type: 'string', enum: ['westfield', 'carmel'] },
        serviceItemId: { type: 'string' },
        date: { type: 'string', description: 'YYYY-MM-DD' },
        startTime: { type: 'string', description: 'Time in HH:MM format (e.g. "14:30")' },
        staffProviderId: { type: 'string', description: 'Optional provider ID' },
      },
      required: ['locationKey', 'serviceItemId', 'date', 'startTime'],
    },
  },
  {
    name: 'send_verification_code',
    description: 'Send an SMS verification code to the user\'s phone for booking confirmation. Phone is used only for this code and is NOT stored.',
    input_schema: {
      type: 'object',
      properties: {
        cartId: { type: 'string' },
        phone: { type: 'string', description: 'US phone number' },
      },
      required: ['cartId', 'phone'],
    },
  },
  {
    name: 'verify_code_and_checkout',
    description: 'Verify the SMS code and complete the booking. Requires name and email to finalize.',
    input_schema: {
      type: 'object',
      properties: {
        cartId: { type: 'string' },
        codeId: { type: 'string' },
        code: { type: 'string', description: 'Verification code from SMS' },
        date: { type: 'string' },
        startTime: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
      },
      required: ['cartId', 'codeId', 'code', 'firstName', 'lastName', 'email'],
    },
  },
  {
    name: 'request_sms_followup',
    description: 'Send an SMS so a human team member can follow up. Use when you cannot fully help the user.',
    input_schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'US phone number' },
        summary: { type: 'string', description: 'Brief context of what the user needs (no personal info)' },
      },
      required: ['phone', 'summary'],
    },
  },
]

// ── Tool Executor ──

export async function executeTool(name, args) {
  switch (name) {
    case 'search_services':
      return searchServices(args.query)

    case 'get_providers':
      return getProviders(args.locationKey, args.serviceSlug)

    case 'get_available_dates':
      return getAvailableDates(args.locationKey, args.serviceItemId, args.staffProviderId)

    case 'get_available_times':
      return getAvailableTimes(args.locationKey, args.serviceItemId, args.date, args.staffProviderId)

    case 'create_cart':
      return createCart(args.locationKey, args.serviceItemId, args.date, args.startTime, args.staffProviderId)

    case 'send_verification_code':
      return sendVerificationCode(args.cartId, args.phone)

    case 'verify_code_and_checkout':
      return verifyAndCheckout(args)

    case 'request_sms_followup':
      return requestSmsFollowup(args.phone, args.summary)

    default:
      return { error: `Unknown tool: ${name}` }
  }
}

// ── Tool Implementations ──

function searchServices(query) {
  const q = query.toLowerCase()
  const lines = CHAT_KNOWLEDGE.split('\n')
  const matches = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    if (line.includes(q)) {
      // Grab surrounding context (2 lines before, 3 after)
      const start = Math.max(0, i - 2)
      const end = Math.min(lines.length, i + 4)
      matches.push(lines.slice(start, end).join('\n'))
    }
  }

  if (matches.length === 0) {
    return { results: [], message: `No services found matching "${query}". Try a broader term.` }
  }

  // Deduplicate and limit
  const unique = [...new Set(matches)].slice(0, 5)
  return { results: unique }
}

async function getProviders(locationKey, serviceSlug) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const url = `${baseUrl}/api/blvd/providers/for-service?serviceSlug=${encodeURIComponent(serviceSlug)}&locationKey=${encodeURIComponent(locationKey)}`
    const res = await fetch(url)
    if (!res.ok) return { error: 'Could not fetch providers', degraded: true }

    const data = await res.json()
    if (data.degraded) return { error: 'Booking system temporarily unavailable', degraded: true }

    return {
      providers: (data || []).map(p => ({
        name: p.name,
        title: p.title,
        boulevardProviderId: p.boulevardProviderId,
        serviceItemId: p.serviceItemId,
        nextAvailableDate: p.nextAvailableDate,
      })),
    }
  } catch (err) {
    return { error: 'Failed to look up providers' }
  }
}

async function getAvailableDates(locationKey, serviceItemId, staffProviderId) {
  try {
    const circuit = getCircuitState()
    if (circuit.state === 'OPEN') return { error: 'Booking system temporarily busy', degraded: true }

    const result = await createCartWithItem(locationKey, serviceItemId, staffProviderId)
    if (result.staffMismatch) return { dates: [], message: 'This provider does not offer this service at this location.' }

    const cart = result.cart
    const dates = await cart.getBookableDates({})
    const dateStrings = (dates || []).map(d => d.date).slice(0, 14)

    return { dates: dateStrings }
  } catch (err) {
    return { error: 'Could not check availability. The booking system may be temporarily busy.' }
  }
}

async function getAvailableTimes(locationKey, serviceItemId, date, staffProviderId) {
  try {
    const circuit = getCircuitState()
    if (circuit.state === 'OPEN') return { error: 'Booking system temporarily busy', degraded: true }

    const result = await createCartWithItem(locationKey, serviceItemId, staffProviderId)
    if (result.staffMismatch) return { times: [] }

    const cart = result.cart
    const times = await cart.getBookableTimes({ date })

    return {
      times: (times || []).map(t => ({
        id: t.id || `${date}T${t.startTime}`,
        startTime: t.startTime,
      })),
    }
  } catch (err) {
    return { error: 'Could not check time slots.' }
  }
}

async function createCart(locationKey, serviceItemId, date, startTime, staffProviderId) {
  try {
    const result = await createCartWithItem(locationKey, serviceItemId, staffProviderId)
    if (result.staffMismatch) {
      return { error: 'This provider does not offer this service at this location.' }
    }

    const cart = result.cart
    const times = await cart.getBookableTimes({ date })
    const match = (times || []).find(t => t.startTime === startTime)
    if (!match) {
      // Find nearest alternatives
      const alternatives = (times || []).slice(0, 5).map(t => t.startTime)
      return { error: `${startTime} is not available.`, alternativeTimes: alternatives }
    }

    const reserved = await cart.reserveBookableItems(match)
    const duration = result.staffVariant?.duration || result.item?.listDurationRange?.max || null

    return {
      cartId: reserved.id,
      expiresAt: reserved.expiresAt || null,
      summary: {
        serviceName: result.item?.name || 'Service',
        staffName: result.staffVariant?.staff?.name || null,
        location: locationKey,
        date,
        startTime,
        duration,
      },
    }
  } catch (err) {
    return { error: 'Failed to reserve time slot. Please try again.' }
  }
}

async function sendVerificationCode(cartId, phone) {
  try {
    // Lazy-import the Boulevard SDK to get the cart
    const { default: Blvd, PlatformTarget } = await import('@boulevard/blvd-book-sdk')
    const blvd = new Blvd(process.env.BLVD_ADMIN_API_KEY, process.env.BLVD_BUSINESS_ID, PlatformTarget.Live)

    const cart = await blvd.carts.get(cartId)

    // Normalize phone
    const digits = phone.replace(/\D/g, '')
    const e164 = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith('1') ? `+${digits}` : phone.startsWith('+') ? phone : `+${digits}`

    const codeResult = await cart.sendOwnershipCodeBySms(e164)

    return { codeId: codeResult, success: true }
  } catch (err) {
    return { error: 'Could not send verification code. Please check the phone number and try again.', skipVerification: true }
  }
}

async function verifyAndCheckout({ cartId, codeId, code, date, startTime, firstName, lastName, email }) {
  try {
    const { default: Blvd, PlatformTarget } = await import('@boulevard/blvd-book-sdk')
    const blvd = new Blvd(process.env.BLVD_ADMIN_API_KEY, process.env.BLVD_BUSINESS_ID, PlatformTarget.Live)

    const cart = await blvd.carts.get(cartId)

    // Verify ownership code
    await cart.takeOwnershipByCode(codeId, code)

    // Re-reserve the time slot (takeOwnership clears it)
    if (date && startTime) {
      try {
        const times = await cart.getBookableTimes({ date })
        const match = (times || []).find(t => t.startTime === startTime)
        if (match) await cart.reserveBookableItems(match)
      } catch {
        // Slot may have been taken — continue and let checkout handle it
      }
    }

    // Set client info
    await cart.setClientInformation({
      firstName,
      lastName,
      email,
    })

    // Checkout
    const checkoutResult = await cart.checkout()

    return {
      success: true,
      confirmation: { firstName, lastName, email },
      appointmentId: checkoutResult?.appointments?.[0]?.appointmentId || null,
    }
  } catch (err) {
    const msg = err.message || ''
    if (msg.includes('expired') || msg.includes('Expired')) {
      return { error: 'Your reservation has expired. Please select a new time and try again.' }
    }
    if (msg.includes('code') || msg.includes('Code')) {
      return { error: 'Invalid verification code. Please check the code and try again.' }
    }
    return { error: 'Could not complete booking. Please try again or call (317) 763-1142.' }
  }
}

async function requestSmsFollowup(phone, summary) {
  const message = [
    'Hi! You were chatting with our AI assistant on reluxemedspa.com.',
    'A team member will follow up with you shortly.',
    'You can also reply here or call (317) 763-1142.',
    '-RELUXE Med Spa',
    'Reply STOP to opt out',
  ].join('\n')

  const result = await sendSMS(phone, message)
  if (!result.ok) {
    return { error: 'Could not send SMS. Please call us directly at (317) 763-1142.' }
  }

  return { success: true, message: 'SMS sent! A team member will text you back shortly.' }
}
