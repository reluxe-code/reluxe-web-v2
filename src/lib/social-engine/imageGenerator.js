// src/lib/social-engine/imageGenerator.js
// Generates branded Instagram Story images using Sharp + SVG templates.
// Composites logo, time-slot cards, and CTA over a background photo.
// Stores results in Supabase Storage `media` bucket.

import sharp from 'sharp'
import { getServiceClient } from '@/lib/supabase'

const WIDTH = 1080
const HEIGHT = 1920
const LOGO_URL = 'https://reluxemedspa.com/images/logo/logo.png'

// ── Style definitions ──
const STYLES = {
  rose: {
    label: 'Rose',
    gradientStart: '#ec4899',
    gradientEnd: '#a855f7',
    cardBg: 'rgba(15,5,15,0.70)',
    cardBorder: 'rgba(236,72,153,0.25)',
    overlayColor: 'rgba(0,0,0,0.20)',
    textColor: '#ffffff',
    subTextColor: 'rgba(255,255,255,0.65)',
    ctaBg: 'rgba(0,0,0,0.60)',
    ctaBorder: 'rgba(236,72,153,0.3)',
    accentColor: '#ec4899',
  },
  gold: {
    label: 'Gold',
    gradientStart: '#f59e0b',
    gradientEnd: '#ef4444',
    cardBg: 'rgba(15,10,5,0.70)',
    cardBorder: 'rgba(245,158,11,0.25)',
    overlayColor: 'rgba(0,0,0,0.20)',
    textColor: '#ffffff',
    subTextColor: 'rgba(255,255,255,0.65)',
    ctaBg: 'rgba(0,0,0,0.60)',
    ctaBorder: 'rgba(245,158,11,0.3)',
    accentColor: '#f59e0b',
  },
  frost: {
    label: 'Frost',
    gradientStart: '#06b6d4',
    gradientEnd: '#6366f1',
    cardBg: 'rgba(5,10,20,0.70)',
    cardBorder: 'rgba(6,182,212,0.25)',
    overlayColor: 'rgba(0,0,0,0.20)',
    textColor: '#ffffff',
    subTextColor: 'rgba(255,255,255,0.65)',
    ctaBg: 'rgba(0,0,0,0.60)',
    ctaBorder: 'rgba(6,182,212,0.3)',
    accentColor: '#06b6d4',
  },
  clean: {
    label: 'Clean',
    gradientStart: '#18181b',
    gradientEnd: '#3f3f46',
    cardBg: 'rgba(255,255,255,0.88)',
    cardBorder: 'rgba(0,0,0,0.08)',
    overlayColor: 'rgba(0,0,0,0.25)',
    textColor: '#18181b',
    subTextColor: 'rgba(40,40,40,0.65)',
    ctaBg: 'rgba(0,0,0,0.65)',
    ctaBorder: 'rgba(255,255,255,0.1)',
    accentColor: '#18181b',
  },
}

// ── Layout constants ──
const CARD_W = 460
const CARD_H = 240
const CARD_RX = 20
const GAP = 30
const PADDING = 60
const CTA_Y = 1700
// Cards sit right above CTA — calculated from bottom up
const GRID_BOTTOM = CTA_Y - 85       // space between cards and CTA pill
const GRID_TOP = GRID_BOTTOM - (CARD_H * 2) - GAP  // top of 2×2 grid

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Build a single time-slot card SVG fragment.
 */
function buildCard(x, y, dateLabel, timeLabel, style, gradId) {
  const cx = x + CARD_W / 2

  // Accent bar at top of card
  const barW = 80
  const barH = 4
  const barX = cx - barW / 2
  const barY = y + 20

  return `
    <rect x="${x}" y="${y}" width="${CARD_W}" height="${CARD_H}" rx="${CARD_RX}"
          fill="${style.cardBg}" stroke="${style.cardBorder}" stroke-width="1" />
    <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="2" fill="url(#${gradId})" />
    <text x="${cx}" y="${y + 65}" text-anchor="middle"
          font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
          font-size="28" font-weight="400" fill="${style.subTextColor}">${esc(dateLabel)}</text>
    <text x="${cx}" y="${y + 145}" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="74" font-weight="bold" fill="${style.textColor}">${esc(timeLabel)}</text>
    <rect x="${cx - 90}" y="${y + 180}" width="180" height="${barH}" rx="2" fill="url(#${gradId})" opacity="0.4" />
  `
}

/**
 * Build the full SVG overlay.
 */
function buildOverlaySvg({ timeSlots, keyword, styleName = 'rose', selectedDate, providerName, serviceName }) {
  const style = STYLES[styleName] || STYLES.rose

  const dateLabel = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'Today'

  const slots = timeSlots.slice(0, 4)

  // Grid positions (2×2)
  const positions = [
    { x: PADDING, y: GRID_TOP },
    { x: PADDING + CARD_W + GAP, y: GRID_TOP },
    { x: PADDING, y: GRID_TOP + CARD_H + GAP },
    { x: PADDING + CARD_W + GAP, y: GRID_TOP + CARD_H + GAP },
  ]

  const cards = slots.map((slot, i) => {
    const pos = positions[i]
    const time = slot.label || slot.startTime || ''
    return buildCard(pos.x, pos.y, dateLabel, time, style, 'accent_grad')
  }).join('')

  const ctaKeyword = esc(keyword.toUpperCase())
  const ctaLine1 = `Comment`
  const ctaLine2 = ctaKeyword
  const ctaLine3 = `to book`

  // Provider + service display
  const providerDisplay = esc(providerName || '')
  const serviceDisplay = esc(serviceName || '')

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="accent_grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${style.gradientStart}" />
      <stop offset="100%" stop-color="${style.gradientEnd}" />
    </linearGradient>
    <linearGradient id="top_fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0.50)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </linearGradient>
    <linearGradient id="bottom_fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.70)" />
    </linearGradient>
  </defs>

  <!-- Light overlay -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${style.overlayColor}" />

  <!-- Top fade for logo/text readability -->
  <rect x="0" y="0" width="${WIDTH}" height="500" fill="url(#top_fade)" />

  <!-- Bottom fade for cards/CTA readability -->
  <rect x="0" y="750" width="${WIDTH}" height="${HEIGHT - 750}" fill="url(#bottom_fade)" />

  <!-- Logo is composited separately via Sharp -->

  <!-- Header: "OPENINGS AVAILABLE" -->
  <text x="${WIDTH / 2}" y="470" text-anchor="middle"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="26" font-weight="600" letter-spacing="8"
        fill="rgba(255,255,255,0.75)">OPENINGS AVAILABLE</text>

  <!-- Accent line under header -->
  <rect x="${WIDTH / 2 - 40}" y="490" width="80" height="3" rx="1.5" fill="url(#accent_grad)" />

  <!-- Provider name -->
  ${providerDisplay ? `
  <text x="${WIDTH / 2}" y="570" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="52" font-weight="bold" fill="#ffffff">${providerDisplay}</text>
  ` : ''}

  <!-- Service name -->
  ${serviceDisplay ? `
  <text x="${WIDTH / 2}" y="${providerDisplay ? 630 : 570}" text-anchor="middle"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="32" font-weight="400" fill="rgba(255,255,255,0.70)">${serviceDisplay}</text>
  ` : ''}

  <!-- Thin divider -->
  <rect x="${WIDTH / 2 - 60}" y="${providerDisplay ? 670 : 610}" width="120" height="1" fill="rgba(255,255,255,0.15)" />

  <!-- Date -->
  <text x="${WIDTH / 2}" y="${providerDisplay ? 730 : 670}" text-anchor="middle"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="28" fill="rgba(255,255,255,0.55)">${esc(dateLabel)}</text>

  <!-- Time slot cards (2×2 grid) -->
  ${cards}

  <!-- CTA background -->
  <rect x="${PADDING}" y="${CTA_Y - 58}" width="${WIDTH - PADDING * 2}" height="85" rx="42"
        fill="${style.ctaBg}" stroke="${style.ctaBorder}" stroke-width="1" />

  <!-- CTA text -->
  <text x="${WIDTH / 2}" y="${CTA_Y + 2}" text-anchor="middle"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="42" font-weight="700" fill="#ffffff">
    <tspan>${ctaLine1} </tspan><tspan font-style="italic" fill="${style.accentColor}">${ctaLine2}</tspan><tspan> ${ctaLine3}</tspan>
  </text>

  <!-- Footer -->
  <text x="${WIDTH / 2}" y="${HEIGHT - 80}"
        text-anchor="middle"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="20" letter-spacing="3" fill="rgba(255,255,255,0.30)">RELUXEMEDSPA.COM</text>
</svg>`
}

/**
 * Fetch an image as a Sharp buffer.
 */
async function fetchImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Generate an Instagram Story image.
 */
export async function generateStoryImage({ backgroundUrl, timeSlots, keyword, style = 'rose', providerName, serviceName }) {
  // 1. Prepare background (1080×1920)
  let bgBuffer
  if (backgroundUrl) {
    const raw = await fetchImage(backgroundUrl)
    bgBuffer = await sharp(raw)
      .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
      .png()
      .toBuffer()
  } else {
    bgBuffer = await sharp({
      create: { width: WIDTH, height: HEIGHT, channels: 4, background: { r: 25, g: 18, b: 22, alpha: 1 } },
    }).png().toBuffer()
  }

  // 2. Fetch + resize logo
  let logoComposite = null
  try {
    const logoRaw = await fetchImage(LOGO_URL)
    const logoResized = await sharp(logoRaw)
      .resize({ width: 240, withoutEnlargement: true })
      .png()
      .toBuffer()
    const logoMeta = await sharp(logoResized).metadata()
    const logoLeft = Math.round((WIDTH - logoMeta.width) / 2)
    logoComposite = { input: logoResized, top: 120, left: logoLeft }
  } catch (err) {
    console.warn('[social-engine/imageGenerator] Logo fetch failed:', err.message)
  }

  // 3. Build SVG overlay
  const selectedDate = timeSlots[0]?.date || new Date().toISOString().slice(0, 10)
  const svgOverlay = buildOverlaySvg({
    timeSlots,
    keyword: keyword.toUpperCase(),
    styleName: style,
    selectedDate,
    providerName,
    serviceName,
  })

  // 4. Composite: background → SVG overlay → logo
  const layers = [
    { input: Buffer.from(svgOverlay), top: 0, left: 0 },
  ]
  if (logoComposite) layers.push(logoComposite)

  const composited = await sharp(bgBuffer)
    .composite(layers)
    .png({ quality: 90 })
    .toBuffer()

  // 5. Upload to Supabase Storage
  const db = getServiceClient()
  const fileName = `social-engine/${Date.now()}-${Math.random().toString(36).slice(2)}.png`

  const { error: uploadError } = await db.storage
    .from('media')
    .upload(fileName, composited, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadError) {
    console.error('[social-engine/imageGenerator] Upload error:', uploadError.message)
    throw uploadError
  }

  const { data: urlData } = db.storage.from('media').getPublicUrl(fileName)

  return {
    imageUrl: urlData?.publicUrl || '',
    imagePath: fileName,
  }
}

export { STYLES }
