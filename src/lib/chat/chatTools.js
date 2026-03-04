// src/lib/chat/chatTools.js
// Tool definitions for Claude + server-side booking state machine.
// Booking flow is driven by a single advance_booking tool — the server
// tracks state in chat_sessions.booking_state (JSONB) so the LLM never
// has to chain tools or manage IDs.
//
// SMS verification uses Boulevard's built-in ownership OTP
// (sendOwnershipCodeBySms / takeOwnershipByCode) — same as the website booking.

import { createCartWithItem, blvd } from '@/server/blvd'
import { getServiceClient } from '@/lib/supabase'
import { getCircuitState } from '@/server/circuitBreaker'
import { sendSMS } from '@/lib/bird'
import { CHAT_KNOWLEDGE } from './chatKnowledge'
import { SERVICE_BOOKING_MAP } from '@/data/serviceBookingMap'

const SERVICE_NAMES = Object.fromEntries(
  Object.entries(SERVICE_BOOKING_MAP).map(([slug, info]) => [slug, info.name])
)

// Map common names/aliases to canonical service slugs
const SERVICE_ALIASES = {
  botox: 'tox', dysport: 'tox', jeuveau: 'tox', daxxify: 'tox', newtox: 'tox',
  'lip filler': 'filler', 'lip fillers': 'filler', 'dermal filler': 'filler', 'dermal fillers': 'filler', juvederm: 'filler', restylane: 'filler', versa: 'filler', rha: 'filler',
  microneedling: 'skinpen', 'micro needling': 'skinpen', 'skin pen': 'skinpen',
  hydrafacial: 'hydrafacial', 'hydra facial': 'hydrafacial',
  facial: 'facials', 'signature facial': 'facials',
  peel: 'peels', 'chemical peel': 'peels',
  laser: 'lasers', 'laser treatment': 'lasers',
  'laser hair': 'laser-hair-removal', 'hair removal': 'laser-hair-removal',
  ipl: 'ipl', photofacial: 'ipl', 'photo facial': 'ipl',
  sauna: 'salt-sauna', 'salt booth': 'salt-sauna', 'infrared sauna': 'salt-sauna',
  consultation: 'consult', consult: 'consult',
  'body contouring': 'evolvex', evolvex: 'evolvex',
  morpheus: 'morpheus8', 'morpheus 8': 'morpheus8',
  co2: 'co2', 'co2 laser': 'co2',
  opus: 'opus', 'opus plasma': 'opus',
  sculptra: 'sculptra',
  clearlift: 'clearlift', 'clear lift': 'clearlift',
  clearskin: 'clearskin', 'clear skin': 'clearskin',
  vascupen: 'vascupen',
  'glo2facial': 'glo2facial', 'glo2': 'glo2facial',
  'skin iq': 'skin-iq', skiniq: 'skin-iq',
}

function resolveServiceSlug(input) {
  if (!input) return input
  // Already a valid slug
  if (SERVICE_BOOKING_MAP[input]) return input
  // Check aliases (case-insensitive)
  const lower = input.toLowerCase().trim()
  if (SERVICE_ALIASES[lower]) return SERVICE_ALIASES[lower]
  // Partial match against aliases
  for (const [alias, slug] of Object.entries(SERVICE_ALIASES)) {
    if (lower.includes(alias) || alias.includes(lower)) return slug
  }
  // Partial match against service names
  for (const [slug, name] of Object.entries(SERVICE_NAMES)) {
    if (name.toLowerCase().includes(lower) || lower.includes(name.toLowerCase())) return slug
  }
  return input // Return as-is; will fail gracefully
}

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
    name: 'advance_booking',
    description: 'Progress the booking flow. Pass whatever new info the user provided — the system tracks state and determines the next step automatically. Call this whenever the user provides booking-related info: provider name, service, location, date, time, phone number, verification code, or personal details.',
    input_schema: {
      type: 'object',
      properties: {
        providerName: { type: 'string', description: 'Provider name (e.g. "Jane", "Sarah Smith")' },
        serviceSlug: { type: 'string', description: 'Service slug (e.g. "massage", "tox", "facials")' },
        locationKey: { type: 'string', enum: ['westfield', 'carmel'], description: 'Location' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        time: { type: 'string', description: 'Time in HH:MM format (e.g. "14:30")' },
        phone: { type: 'string', description: 'US phone number for verification' },
        verificationCode: { type: 'string', description: 'SMS verification code' },
        firstName: { type: 'string', description: 'Client first name' },
        lastName: { type: 'string', description: 'Client last name' },
        email: { type: 'string', description: 'Client email' },
        anyProvider: { type: 'boolean', description: 'Set true when user says "any provider", "whoever is available", "anyone", "doesn\'t matter" for provider selection' },
        firstAvailable: { type: 'boolean', description: 'Set true when user says "any", "first available", "earliest", "any of them", "whichever", or similar — picks the first open time slot automatically' },
        reset: { type: 'boolean', description: 'Set true to cancel and start over' },
        resend: { type: 'boolean', description: 'Set true to resend the verification code' },
        skipVerification: { type: 'boolean', description: 'Set true if user cannot receive the SMS code and wants to proceed without it' },
      },
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

export async function executeTool(name, args, bookingState) {
  switch (name) {
    case 'search_services':
      return searchServices(args.query)

    case 'advance_booking':
      return advanceBooking(args, bookingState)

    case 'request_sms_followup':
      return requestSmsFollowup(args.phone, args.summary)

    default:
      return { error: `Unknown tool: ${name}` }
  }
}

// ── Search Services (unchanged) ──

function searchServices(query) {
  const q = query.toLowerCase()
  const lines = CHAT_KNOWLEDGE.split('\n')
  const matches = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    if (line.includes(q)) {
      const start = Math.max(0, i - 2)
      const end = Math.min(lines.length, i + 4)
      matches.push(lines.slice(start, end).join('\n'))
    }
  }

  if (matches.length === 0) {
    return { results: [], message: `No services found matching "${query}". Try a broader term.` }
  }

  const unique = [...new Set(matches)].slice(0, 5)
  return { results: unique }
}

// ── SMS Followup (unchanged) ──

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

// ── Booking State Machine ──

const MAX_ADVANCES = 6 // Safety: prevent infinite loops in a single call

async function advanceBooking(input, currentState) {
  let state = { step: 'IDLE', ...(currentState || {}) }

  // Reset support
  if (input.reset) {
    return buildResponse({ step: 'IDLE', message: 'No problem! What would you like to book?', instruction: 'Ask what service or provider they want to book.' })
  }

  // Resend verification code
  if (input.resend && state.step === 'NEED_CODE') {
    state.codeId = null
    state.verificationCode = null
  }

  // Skip verification — proceed without SMS code
  if (input.skipVerification && state.step === 'NEED_CODE') {
    state.phoneVerified = false
    state.step = 'NEED_CLIENT_INFO'
    state.message = "No problem! Let's finish your booking. I need your first name, last name, and email address."
    state.instruction = 'Ask for first name, last name, and email. These three fields only.'
    return buildResponse(state)
  }

  // Merge new input (never overwrite already-resolved fields)
  if (input.providerName && !state.providerName) state.providerName = input.providerName
  if (input.serviceSlug && !state.serviceSlug) state.serviceSlug = resolveServiceSlug(input.serviceSlug)
  if (input.locationKey && !state.locationKey) state.locationKey = input.locationKey
  if (input.date) state.date = resolveDate(input.date)
  if (input.time) state.time = normalizeTime(input.time)
  if (input.firstAvailable) state.firstAvailable = true
  if (input.anyProvider) state.anyProvider = true
  if (input.phone) state.phone = input.phone
  if (input.verificationCode) state.verificationCode = input.verificationCode
  if (input.firstName) state.firstName = input.firstName
  if (input.lastName) state.lastName = input.lastName
  if (input.email) state.email = input.email

  // Advance through states as far as possible
  for (let i = 0; i < MAX_ADVANCES; i++) {
    const result = await processStep(state)
    state = result.state
    if (result.done) break
  }

  return buildResponse(state)
}

async function processStep(state) {
  try {
    switch (state.step) {
      case 'IDLE':              return await handleIdle(state)
      case 'NEED_SERVICE':      return handleNeedService(state)
      case 'NEED_LOCATION':     return await handleNeedLocation(state)
      case 'NEED_PROVIDER':     return handleNeedProvider(state)
      case 'NEED_DATE':         return await handleNeedDate(state)
      case 'NEED_TIME':         return await handleNeedTime(state)
      case 'NEED_PHONE':        return handleNeedPhone(state)
      case 'NEED_CODE':         return await handleNeedCode(state)
      case 'NEED_CLIENT_INFO':  return handleNeedClientInfo(state)
      case 'CHECKOUT':          return await handleCheckout(state)
      case 'COMPLETED':         return { done: true, state }
      case 'ERROR':             return { done: true, state }
      default:                  return { done: true, state: { ...state, step: 'ERROR', message: 'Unexpected booking state.' } }
    }
  } catch (err) {
    console.error('[chat] booking step error:', state.step, err.message)
    return {
      done: true,
      state: {
        ...state,
        step: 'ERROR',
        message: `Something went wrong. You can try again or book directly at reluxemedspa.com/book/ or call (317) 763-1142.`,
      },
    }
  }
}

// ── Step Handlers ──

async function handleIdle(state) {
  // If provider name given, resolve them
  if (state.providerName) {
    const provider = await resolveProvider(state.providerName)
    if (!provider) {
      return {
        done: true,
        state: { ...state, step: 'ERROR', message: `I couldn't find a provider named "${state.providerName}". Would you like to see our team or pick a service instead?` },
      }
    }

    state.providerName = provider.name
    state.boulevardProviderId = provider.boulevardProviderId
    state.availableServices = provider.services
    state.availableLocations = provider.locations
    state.serviceDetails = provider.serviceDetails

    // Auto-resolve single service
    if (provider.services.length === 1) {
      const svc = provider.services[0]
      state.serviceSlug = svc.slug
      state.serviceName = svc.name
    }

    // Auto-resolve single location
    if (provider.locations.length === 1) {
      state.locationKey = provider.locations[0]
    }

    // Resolve serviceItemId if we have both service + location
    if (state.serviceSlug && state.locationKey) {
      const itemId = state.serviceDetails?.[state.serviceSlug]?.[state.locationKey]
      if (itemId) state.serviceItemId = itemId
    }
  }

  // Service-first flow: auto-resolve location if service is only at one location
  if (state.serviceSlug && !state.locationKey && !state.providerName) {
    const serviceLocations = await getServiceLocations(state.serviceSlug)
    if (serviceLocations.length === 1) {
      state.locationKey = serviceLocations[0]
    }
  }

  // If service given without provider, resolve serviceItemId directly
  if (state.serviceSlug && state.locationKey && !state.serviceItemId) {
    const providers = await resolveProviders(state.locationKey, state.serviceSlug)
    if (providers.length === 0) {
      return {
        done: true,
        state: { ...state, step: 'ERROR', message: `No providers found for this service at ${state.locationKey}. Try a different location?` },
      }
    }
    state.serviceName = state.serviceName || SERVICE_NAMES[state.serviceSlug] || state.serviceSlug
    state.availableProviders = providers
    if (!state.boulevardProviderId) {
      // Auto-select if only one provider or user said "any provider"
      if (providers.length === 1 || state.anyProvider) {
        state.anyProvider = false
        state.serviceItemId = providers[0].serviceItemId
        if (providers.length === 1) {
          state.boulevardProviderId = providers[0].boulevardProviderId
          state.providerName = providers[0].name
        }
      } else {
        state.step = 'NEED_PROVIDER'
        return { done: false, state }
      }
    }
  }

  // Determine what we still need
  if (!state.serviceSlug && state.availableServices?.length > 1) {
    state.step = 'NEED_SERVICE'
    state.message = `${state.providerName} offers: ${state.availableServices.map(s => s.name).join(', ')}. Which service would you like?`
    state.instruction = 'Ask which service they want. Only show the options listed above.'
    return { done: true, state }
  }

  if (!state.locationKey && state.availableLocations?.length > 1) {
    state.step = 'NEED_LOCATION'
    state.message = `${state.providerName || 'This service is'} available at Westfield and Carmel. Which location do you prefer?`
    state.instruction = 'Ask which location: Westfield or Carmel. Nothing else.'
    return { done: true, state }
  }

  if (!state.serviceSlug) {
    state.step = 'NEED_SERVICE'
    state.message = 'What service would you like to book?'
    state.instruction = 'Ask what service they want to book. Nothing else.'
    return { done: true, state }
  }

  if (!state.locationKey) {
    state.step = 'NEED_LOCATION'
    state.message = 'Which location — Westfield or Carmel?'
    state.instruction = 'Ask which location: Westfield or Carmel. Nothing else.'
    return { done: true, state }
  }

  // We have service + location, move to date
  state.step = 'NEED_DATE'
  return { done: false, state }
}

function handleNeedService(state) {
  if (!state.serviceSlug) return { done: true, state }

  state.serviceName = SERVICE_NAMES[state.serviceSlug] || state.serviceSlug

  // Resolve serviceItemId
  if (state.serviceDetails?.[state.serviceSlug]) {
    if (state.locationKey) {
      state.serviceItemId = state.serviceDetails[state.serviceSlug][state.locationKey]
    }
  }

  if (!state.locationKey) {
    state.step = 'NEED_LOCATION'
    return { done: false, state }
  }

  state.step = 'NEED_DATE'
  return { done: false, state }
}

async function handleNeedLocation(state) {
  // Auto-resolve if service is only at one location (belt + suspenders with handleIdle)
  if (!state.locationKey && state.serviceSlug) {
    const serviceLocations = await getServiceLocations(state.serviceSlug)
    if (serviceLocations.length === 1) {
      state.locationKey = serviceLocations[0]
    }
  }

  if (!state.locationKey) return { done: true, state }

  // Resolve serviceItemId now that we have location
  if (state.serviceSlug && state.serviceDetails?.[state.serviceSlug]?.[state.locationKey]) {
    state.serviceItemId = state.serviceDetails[state.serviceSlug][state.locationKey]
  }

  // If we still need a provider choice (service-first flow), get providers
  if (!state.serviceItemId && !state.boulevardProviderId) {
    state.step = 'NEED_DATE' // will resolve in handleNeedDate
    return { done: false, state }
  }

  state.step = 'NEED_DATE'
  return { done: false, state }
}

function handleNeedProvider(state) {
  // Auto-select if only one provider
  if (!state.boulevardProviderId && state.availableProviders?.length === 1) {
    const p = state.availableProviders[0]
    state.boulevardProviderId = p.boulevardProviderId
    state.serviceItemId = p.serviceItemId
    state.providerName = p.name
    state.step = 'NEED_DATE'
    return { done: false, state }
  }

  // "Any provider" — pick the first available
  if (state.anyProvider && state.availableProviders?.length > 0) {
    state.anyProvider = false
    const p = state.availableProviders[0]
    state.serviceItemId = p.serviceItemId
    // Don't set boulevardProviderId — Boulevard will pick any available staff
    state.providerName = null
    state.step = 'NEED_DATE'
    return { done: false, state }
  }

  // User needs to pick from availableProviders
  if (!state.boulevardProviderId && state.availableProviders?.length > 0) {
    // Check if user provided a provider name that matches
    if (state.providerName) {
      const match = state.availableProviders.find(p =>
        p.name.toLowerCase().includes(state.providerName.toLowerCase())
      )
      if (match) {
        state.boulevardProviderId = match.boulevardProviderId
        state.serviceItemId = match.serviceItemId
        state.providerName = match.name
      }
    }

    if (!state.boulevardProviderId) {
      state.message = `Here are our providers for ${state.serviceName || state.serviceSlug} at ${state.locationKey}:\n${state.availableProviders.map(p => `- ${p.name}${p.title ? ' (' + p.title + ')' : ''}`).join('\n')}\nWho would you like to book with, or any available?`
      state.instruction = 'Present the provider list and ask who they want. If they say "any", "anyone", "whoever is available", or similar, pass { anyProvider: true }. Nothing else.'
      return { done: true, state }
    }
  }

  // Fallback: no specific provider selected — use first provider's serviceItemId
  if (!state.boulevardProviderId && state.availableProviders?.length > 0) {
    state.serviceItemId = state.availableProviders[0].serviceItemId
  }

  state.step = 'NEED_DATE'
  return { done: false, state }
}

async function handleNeedDate(state) {
  // If we still need serviceItemId, resolve via provider lookup
  if (!state.serviceItemId) {
    if (state.serviceSlug && state.locationKey) {
      const providers = await resolveProviders(state.locationKey, state.serviceSlug)
      if (providers.length === 0) {
        state.step = 'ERROR'
        state.message = `No availability for ${state.serviceName || state.serviceSlug} at ${state.locationKey}. Try a different service or location?`
        return { done: true, state }
      }
      if (state.boulevardProviderId) {
        const match = providers.find(p => p.boulevardProviderId === state.boulevardProviderId)
        state.serviceItemId = match?.serviceItemId || providers[0].serviceItemId
      } else if (providers.length === 1) {
        // Auto-select the only provider
        state.serviceItemId = providers[0].serviceItemId
        state.boulevardProviderId = providers[0].boulevardProviderId
        state.providerName = providers[0].name
      } else {
        state.serviceItemId = providers[0].serviceItemId
        state.availableProviders = providers
      }
    } else {
      state.step = 'ERROR'
      state.message = 'Missing service or location information. What would you like to book?'
      return { done: true, state }
    }
  }

  // Check circuit breaker before hitting Boulevard
  const circuit = getCircuitState()
  if (circuit.state === 'OPEN') {
    state.step = 'ERROR'
    state.message = 'Our booking system is temporarily busy. Please try again in a moment or call (317) 763-1142.'
    return { done: true, state }
  }

  // If user already picked a date, go straight to fetching times
  if (state.date) {
    state.step = 'NEED_TIME'
    return { done: false, state }
  }

  // Fetch available dates
  const result = await createCartWithItem(state.locationKey, state.serviceItemId, state.boulevardProviderId)
  if (result.staffMismatch) {
    state.step = 'ERROR'
    state.message = 'This provider does not offer this service at this location.'
    return { done: true, state }
  }

  const cart = result.cart
  const dates = await cart.getBookableDates({})
  const dateStrings = (dates || []).map(d => d.date).slice(0, 14)

  if (dateStrings.length === 0) {
    state.step = 'ERROR'
    state.message = `No availability found for ${state.serviceName || 'this service'} in the next two weeks. Would you like to try a different service or location?`
    return { done: true, state }
  }

  state.availableDates = dateStrings
  state.message = `Available dates for ${state.serviceName || 'your appointment'}${state.providerName ? ' with ' + state.providerName : ''} at ${state.locationKey}:\n${formatDates(dateStrings)}\n\nWhich date works for you?`
  state.instruction = 'Present the available dates and ask which one works. Ask ONLY for a date.'
  return { done: true, state }
}

async function handleNeedTime(state) {
  if (!state.date) return { done: true, state }

  const circuit = getCircuitState()
  if (circuit.state === 'OPEN') {
    state.step = 'ERROR'
    state.message = 'Our booking system is temporarily busy. Please try again in a moment or call (317) 763-1142.'
    return { done: true, state }
  }

  // "First available" / "any of them" — auto-pick from available times
  if (state.firstAvailable) {
    state.firstAvailable = false // consume the flag
    if (state.availableTimes?.length > 0) {
      state.time = state.availableTimes[0]
      // Fall through to reservation below
    }
  }

  // No time selected yet — fetch times (but don't re-fetch if we already have them)
  if (!state.time) {
    if (state.availableTimes?.length > 0) {
      // Already have times — just re-present them (prevents re-fetch loop)
      state.message = `Here are the open times on ${state.date}:\n${formatTimes(state.availableTimes)}\n\nWhich time works for you?`
      state.instruction = 'Present the available times and ask which one they want. If they say "any", "first available", "earliest", or similar, pass { firstAvailable: true }. Ask ONLY for a time.'
      return { done: true, state }
    }

    // First time seeing this date — fetch times from Boulevard
    const result = await createCartWithItem(state.locationKey, state.serviceItemId, state.boulevardProviderId)
    if (result.staffMismatch) {
      state.step = 'ERROR'
      state.message = 'This provider does not offer this service at this location.'
      return { done: true, state }
    }

    const cart = result.cart
    const times = await cart.getBookableTimes({ date: state.date })
    const timeStrings = (times || []).map(t => t.startTime)

    if (timeStrings.length === 0) {
      const prevDate = state.date
      state.date = null
      state.step = 'NEED_DATE'
      state.message = `No times available on ${prevDate}. Please pick another date.`
      state.instruction = 'Ask them to pick a different date.'
      return { done: true, state }
    }

    state.availableTimes = timeStrings
    state.message = `Times available on ${state.date}${state.providerName ? ' with ' + state.providerName : ''}:\n${formatTimes(timeStrings)}\n\nWhich time works for you?`
    state.instruction = 'Present the available times and ask which one they want. If they say "any", "first available", "earliest", or similar, pass { firstAvailable: true }. Ask ONLY for a time.'
    return { done: true, state }
  }

  // User picked a time — create cart and reserve
  const cartResult = await createCartWithItem(state.locationKey, state.serviceItemId, state.boulevardProviderId)
  if (cartResult.staffMismatch) {
    state.step = 'ERROR'
    state.message = 'This provider does not offer this service at this location.'
    return { done: true, state }
  }

  const cart = cartResult.cart
  const times = await cart.getBookableTimes({ date: state.date })

  // Fuzzy match: exact, starts-with, hour-only, or match against available times index
  let match = (times || []).find(t =>
    t.startTime === state.time ||
    t.startTime.startsWith(state.time + ':') ||
    t.startTime === state.time + ':00'
  )

  // If no exact match, try matching just the hour portion (e.g., "9" → any 9:xx slot)
  if (!match) {
    const hourStr = state.time.split(':')[0]
    match = (times || []).find(t => t.startTime.split(':')[0] === hourStr)
  }

  if (!match) {
    // Time not available — show alternatives
    const alternatives = (times || []).slice(0, 8).map(t => t.startTime)
    const requestedTime = state.time
    state.time = null
    state.availableTimes = alternatives
    if (alternatives.length === 0) {
      state.step = 'NEED_DATE'
      state.date = null
      state.message = 'No times available on this date. Please pick another date.'
      state.instruction = 'Ask them to pick a different date.'
    } else {
      state.message = `${formatTime(requestedTime)} isn't available. Here are the open times for ${state.date}:\n${formatTimes(alternatives)}\n\nWhich time works?`
      state.instruction = 'Present the available times and ask which one they want. If they say "any", "first available", or similar, pass { firstAvailable: true }. Ask ONLY for a time.'
    }
    return { done: true, state }
  }

  const reserved = await cart.reserveBookableItems(match)
  state.cartId = reserved.id
  state.cartExpiresAt = reserved.expiresAt || null
  state.startTime = match.startTime // Use the actual matched time, not the user's input
  state.time = match.startTime
  state.availableTimes = null // Clear — no longer needed
  state.serviceSummary = cartResult.item?.name || state.serviceName
  state.step = 'NEED_PHONE'
  state.message = `Reserved ${formatTime(state.startTime)} on ${state.date}${state.providerName ? ' with ' + state.providerName : ''} at ${state.locationKey}. To confirm, I'll send a quick verification code to your phone.`
  state.instruction = 'Ask ONLY for their phone number. Mention it is used only for a one-time verification code and is not stored. Do NOT ask for name, email, or anything else yet.'
  return { done: true, state }
}

function handleNeedPhone(state) {
  if (!state.phone) {
    state.instruction = 'Ask ONLY for their phone number. Mention it is used only for a one-time verification code and is not stored. Do NOT ask for name, email, or anything else.'
    return { done: true, state }
  }

  // Phone provided — advance to sending code
  state.step = 'NEED_CODE'
  return { done: false, state }
}

async function handleNeedCode(state) {
  // Send verification code via Boulevard's OTP (same as website booking)
  if (!state.codeId) {
    const phone = toE164(state.phone)
    console.log('[chat] sending Boulevard OTP to', phone.replace(/\d(?=\d{4})/g, '*'))

    try {
      const cart = await blvd.carts.get(state.cartId)
      const codeId = await cart.sendOwnershipCodeBySms(phone)
      console.log('[chat] Boulevard OTP sent, codeId:', codeId)
      state.codeId = codeId
      state.codeSentAt = Date.now()
      state.smsSendCount = (state.smsSendCount || 0) + 1
      state.message = 'Verification code sent! Check your texts and enter the 6-digit code.'
      state.instruction = 'Ask ONLY for the 6-digit verification code. If they say they did not receive it, pass { resend: true }. If they still cannot receive it after a resend, pass { skipVerification: true }.'
      return { done: true, state }
    } catch (err) {
      console.error('[chat] Boulevard OTP send failed:', err.message)
      // If OTP fails, skip verification and proceed to collect client info
      state.phoneVerified = false
      state.step = 'NEED_CLIENT_INFO'
      state.message = "I wasn't able to send a verification code, but let's finish your booking. I need your first name, last name, and email address."
      state.instruction = 'Ask for first name, last name, and email. These three fields only.'
      return { done: true, state }
    }
  }

  // Verify the code the user provided via Boulevard's takeOwnershipByCode
  if (state.verificationCode) {
    try {
      let cart = await blvd.carts.get(state.cartId)
      cart = await cart.takeOwnershipByCode(state.codeId, parseInt(state.verificationCode, 10))

      // Boulevard clears the reserved time after ownership — re-reserve it
      if (state.date && state.startTime) {
        const times = await cart.getBookableTimes({ date: state.date })
        const match = (times || []).find(t => t.startTime === state.startTime)
        if (match) {
          cart = await cart.reserveBookableItems(match)
          state.cartId = cart.id
          console.log('[chat] Re-reserved time slot after ownership')
        } else {
          console.warn('[chat] Could not re-reserve: time slot no longer available')
          state.step = 'NEED_TIME'
          state.time = null
          state.startTime = null
          state.message = 'Phone verified, but your time slot was taken. Let me find available times again.'
          state.instruction = 'Tell the user their time was taken and show new available times.'
          return { done: false, state }
        }
      }

      // Check if Boulevard linked client info (returning client)
      const clientInfo = cart.clientInformation
      state.phoneVerified = true
      state.ownershipVerified = true
      if (clientInfo?.firstName && clientInfo?.email) {
        // Returning client — skip collecting info
        state.firstName = state.firstName || clientInfo.firstName
        state.lastName = state.lastName || clientInfo.lastName || ''
        state.email = state.email || clientInfo.email
        state.step = 'CHECKOUT'
        state.message = `Phone verified! Welcome back, ${clientInfo.firstName}. Let me confirm your booking.`
        return { done: false, state }
      }

      state.step = 'NEED_CLIENT_INFO'
      state.message = 'Phone verified! To finish your booking, I need your first name, last name, and email address.'
      state.instruction = 'Ask for first name, last name, and email. These three fields only.'
      return { done: true, state }
    } catch (err) {
      console.error('[chat] Boulevard OTP verify failed:', err.message)
      // Wrong code
      state.retryCount = (state.retryCount || 0) + 1
      if (state.retryCount >= 3) {
        state.phoneVerified = false
        state.step = 'NEED_CLIENT_INFO'
        state.message = "Let's skip the code and finish your booking. I need your first name, last name, and email address."
        state.instruction = 'Ask for first name, last name, and email. These three fields only.'
        return { done: true, state }
      }
      state.verificationCode = null
      state.message = "That code didn't match. Please check and try again, or say \"resend\" for a new code."
      state.instruction = 'Ask for the verification code again. Mention they can say "resend" for a new code, or skip verification if they cannot receive texts.'
      return { done: true, state }
    }
  }

  // Still waiting for the user to enter their code
  state.instruction = 'Ask ONLY for the 6-digit verification code. If they cannot receive it, pass { skipVerification: true }.'
  return { done: true, state }
}

function handleNeedClientInfo(state) {
  if (!state.firstName || !state.email) {
    state.instruction = 'Ask for first name, last name, and email address. These three fields only.'
    return { done: true, state }
  }

  state.step = 'CHECKOUT'
  return { done: false, state }
}

async function handleCheckout(state) {
  try {
    let cart = await blvd.carts.get(state.cartId)

    // Set client info — needed for new clients or when ownership was skipped.
    // Even for returning clients (ownershipVerified), explicitly set to ensure
    // checkout has the required fields.
    cart = await cart.update({
      clientInformation: {
        firstName: state.firstName,
        lastName: state.lastName || '',
        email: state.email,
        phoneNumber: state.phone ? toE164(state.phone) : undefined,
      },
    })

    // Try SDK checkout first
    let checkoutResult
    try {
      checkoutResult = await cart.checkout()
    } catch (sdkErr) {
      const sdkMsg = sdkErr.message || ''
      // If payment-related and no payment required, this is a free service —
      // the SDK sometimes requires a payment method even for $0 services.
      // We can't use Admin API from chat, so just surface the error.
      console.error('[chat] checkout SDK error:', sdkMsg)
      throw sdkErr
    }

    state.step = 'COMPLETED'
    state.appointmentId = checkoutResult?.appointments?.[0]?.appointmentId || null
    state.message = `Booking confirmed! ${state.firstName}, you're all set for ${state.serviceName || 'your appointment'}${state.providerName ? ' with ' + state.providerName : ''} on ${state.date} at ${formatTime(state.startTime)} at ${state.locationKey}. See you then!`
    return { done: true, state }
  } catch (err) {
    const msg = err.message || ''
    console.error('[chat] checkout error:', msg)
    if (msg.includes('expired') || msg.includes('Expired')) {
      state.cartId = null
      state.codeId = null
      state.verificationCode = null
      state.phoneVerified = false
      state.ownershipVerified = false
      state.step = 'NEED_TIME'
      state.message = 'Your reservation expired. Let me find available times again.'
      state.time = null
      return { done: false, state }
    }
    state.step = 'ERROR'
    state.message = `Couldn't complete the booking. Please try again or book at reluxemedspa.com/book/ or call (317) 763-1142.`
    return { done: true, state }
  }
}

// ── Helper Functions ──

async function resolveProvider(name) {
  const sb = getServiceClient()
  const q = name.toLowerCase().trim()

  const { data: staff, error } = await sb
    .from('staff')
    .select('name, title, boulevard_provider_id, boulevard_service_map, locations')
    .eq('status', 'published')
    .not('boulevard_provider_id', 'is', null)
    .or('allow_online_booking.is.null,allow_online_booking.eq.true')

  if (error || !staff?.length) return null

  const matches = staff.filter(s => {
    const full = (s.name || '').toLowerCase()
    const first = full.split(' ')[0]
    return full === q || first === q || full.includes(q)
  })

  if (matches.length === 0) return null

  const s = matches[0]
  const serviceMap = s.boulevard_service_map || {}
  const services = Object.keys(serviceMap).map(slug => ({
    slug,
    name: SERVICE_NAMES[slug] || slug,
  }))

  // Derive BOOKABLE locations from boulevard_service_map (not staff.locations).
  // staff.locations is where they work; boulevard_service_map is where they can be booked.
  // e.g., Jane works at both locations but only offers massage at Westfield.
  const bookableLocations = new Set()
  for (const locMap of Object.values(serviceMap)) {
    for (const loc of Object.keys(locMap || {})) {
      if (loc === 'westfield' || loc === 'carmel') bookableLocations.add(loc)
    }
  }

  const serviceDetails = {}
  for (const [slug, locMap] of Object.entries(serviceMap)) {
    serviceDetails[slug] = {}
    for (const [loc, itemId] of Object.entries(locMap)) {
      serviceDetails[slug][loc] = itemId
    }
  }

  return {
    name: s.name,
    title: s.title,
    boulevardProviderId: s.boulevard_provider_id,
    services,
    locations: [...bookableLocations],
    serviceDetails,
  }
}

// Check which locations offer a given service (by looking at all providers' service maps)
async function getServiceLocations(serviceSlug) {
  const sb = getServiceClient()
  const { data: staff, error } = await sb
    .from('staff')
    .select('boulevard_service_map')
    .eq('status', 'published')
    .not('boulevard_provider_id', 'is', null)
    .or('allow_online_booking.is.null,allow_online_booking.eq.true')

  if (error || !staff?.length) return ['westfield', 'carmel'] // fail open

  const locs = new Set()
  for (const s of staff) {
    const map = s.boulevard_service_map || {}
    if (map[serviceSlug]) {
      for (const loc of Object.keys(map[serviceSlug])) {
        locs.add(loc)
      }
    }
  }

  return [...locs]
}

async function resolveProviders(locationKey, serviceSlug) {
  const sb = getServiceClient()
  const { data: staff, error } = await sb
    .from('staff')
    .select('name, title, boulevard_provider_id, boulevard_service_map, locations')
    .eq('status', 'published')
    .not('boulevard_provider_id', 'is', null)
    .or('allow_online_booking.is.null,allow_online_booking.eq.true')

  if (error || !staff?.length) return []

  return staff
    .filter(s => {
      const map = s.boulevard_service_map || {}
      if (!map[serviceSlug]?.[locationKey]) return false
      const locs = Array.isArray(s.locations) ? s.locations : []
      return locs.some(l => {
        const locSlug = (l.slug || l.title || '').toLowerCase()
        return locSlug.includes(locationKey)
      })
    })
    .map(s => ({
      name: s.name,
      title: s.title,
      boulevardProviderId: s.boulevard_provider_id,
      serviceItemId: s.boulevard_service_map[serviceSlug][locationKey],
    }))
}

function formatDates(dates) {
  return dates.slice(0, 7).map(d => {
    const dt = new Date(d + 'T12:00:00')
    return `- ${dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Indiana/Indianapolis' })}`
  }).join('\n')
}

function formatTimes(times) {
  // Pick ~5 times spread across the day
  if (times.length <= 5) {
    return times.map(t => formatTime(t)).join(', ')
  }
  const picks = []
  const step = Math.floor(times.length / 5)
  for (let i = 0; i < times.length && picks.length < 5; i += step) {
    picks.push(times[i])
  }
  return picks.map(t => formatTime(t)).join(', ')
}

function formatTime(t) {
  if (!t || !t.includes(':')) return t || ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

// Normalize various time formats to HH:MM (24h)
// Handles: "12", "2pm", "2:30pm", "14:30", "9am", "9:00 AM", etc.
function normalizeTime(raw) {
  if (!raw) return raw
  const s = raw.trim().toLowerCase().replace(/\s+/g, '')

  // Already HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(s)) return s.padStart(5, '0')

  // Hour only with am/pm: "2pm", "9am"
  const ampm1 = s.match(/^(\d{1,2})(am|pm)$/)
  if (ampm1) {
    let h = parseInt(ampm1[1], 10)
    if (ampm1[2] === 'pm' && h < 12) h += 12
    if (ampm1[2] === 'am' && h === 12) h = 0
    return `${h.toString().padStart(2, '0')}:00`
  }

  // HH:MM with am/pm: "2:30pm", "9:00am"
  const ampm2 = s.match(/^(\d{1,2}):(\d{2})(am|pm)$/)
  if (ampm2) {
    let h = parseInt(ampm2[1], 10)
    if (ampm2[3] === 'pm' && h < 12) h += 12
    if (ampm2[3] === 'am' && h === 12) h = 0
    return `${h.toString().padStart(2, '0')}:${ampm2[2]}`
  }

  // Bare number: "12" → "12:00", "9" → "09:00"
  const bare = s.match(/^(\d{1,2})$/)
  if (bare) {
    const h = parseInt(bare[1], 10)
    if (h >= 0 && h <= 23) return `${h.toString().padStart(2, '0')}:00`
  }

  // Can't parse — return as-is, fuzzy match will handle it
  return raw.trim()
}

// Resolve natural language dates to YYYY-MM-DD
// Handles: "2026-03-08" (pass-through), "Friday", "this Friday", "tomorrow",
// "next Thursday", "March 8", "March 8th", "3/8"
function resolveDate(input) {
  if (!input) return input
  const s = input.trim()

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  const now = new Date()
  // Use Indianapolis timezone
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Indiana/Indianapolis' })
  const today = new Date(todayStr + 'T12:00:00')

  const lower = s.toLowerCase().replace(/^(this|next)\s+/, '')
  const isNext = s.toLowerCase().startsWith('next ')

  // "tomorrow"
  if (lower === 'tomorrow') {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  // Day of week: "friday", "this friday", "next friday"
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayIdx = days.indexOf(lower)
  if (dayIdx >= 0) {
    const currentDay = today.getDay()
    let daysAhead = dayIdx - currentDay
    if (daysAhead <= 0) daysAhead += 7
    if (isNext && daysAhead <= 7) daysAhead += 7
    const d = new Date(today)
    d.setDate(d.getDate() + daysAhead)
    return d.toISOString().split('T')[0]
  }

  // "March 8", "March 8th", "Mar 8"
  const monthDay = s.match(/^(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?$/i)
  if (monthDay) {
    const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december']
    const monthAbbr = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
    const mName = monthDay[1].toLowerCase()
    let mIdx = monthNames.indexOf(mName)
    if (mIdx < 0) mIdx = monthAbbr.indexOf(mName.slice(0, 3))
    if (mIdx >= 0) {
      const day = parseInt(monthDay[2], 10)
      let year = today.getFullYear()
      const candidate = new Date(year, mIdx, day)
      if (candidate < today) year++
      return `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  // "3/8" or "3/8/2026"
  const slashDate = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (slashDate) {
    const m = parseInt(slashDate[1], 10)
    const d = parseInt(slashDate[2], 10)
    let y = slashDate[3] ? parseInt(slashDate[3], 10) : today.getFullYear()
    if (y < 100) y += 2000
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  // Can't parse — return as-is (Claude should have sent YYYY-MM-DD)
  return s
}

// Convert phone to E.164 format for Boulevard API (matches website booking)
function toE164(value) {
  const digits = (value || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`
  return `+${digits}`
}

function buildResponse(state) {
  const bookingState = { ...state }
  // Remove transient fields from persisted state
  delete bookingState.message
  delete bookingState.instruction

  return {
    step: state.step,
    message: state.message || '',
    instruction: state.instruction || null,
    context: {
      provider: state.providerName || null,
      service: state.serviceName || null,
      location: state.locationKey || null,
      date: state.date || null,
      time: state.startTime || null,
    },
    bookingState,
  }
}
