// src/pages/api/cron/generate-inspiration.js
// Daily cron — generates 3 inspiration articles via Claude AI.
// Categories: skincare, treatments/conditions, local/seasonal.
// Articles are saved as 'scheduled' with staggered published_at times
// (morning, afternoon, evening) and random minute offsets.
// A separate cron (publish-inspiration) flips them to 'published' on time.

import Anthropic from '@anthropic-ai/sdk'
import { getServiceClient } from '@/lib/supabase'

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

/** Build a Date for today in America/Indiana/Indianapolis at the given hour + random minute offset */
function scheduledTime(baseHourUTC, minOffset = 0, maxOffset = 59) {
  const now = new Date()
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), baseHourUTC, randomInt(minOffset, maxOffset), 0))
  // If somehow we're past this time already (e.g. late cron), push to next day
  if (d <= now) d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString()
}

// EST/EDT offset: Indiana is UTC-5 (EST) or UTC-4 (EDT)
function getEasternOffset() {
  // Simple DST check: March second Sunday through November first Sunday
  const now = new Date()
  const year = now.getFullYear()
  // Second Sunday in March
  const marchStart = new Date(year, 2, 1)
  const marchSunday = 14 - marchStart.getDay()
  const dstStart = new Date(year, 2, marchSunday, 2)
  // First Sunday in November
  const novStart = new Date(year, 10, 1)
  const novSunday = novStart.getDay() === 0 ? 1 : 8 - novStart.getDay()
  const dstEnd = new Date(year, 10, novSunday, 2)
  return now >= dstStart && now < dstEnd ? 4 : 5
}

// ── Gradients (rotate through for visual variety) ────────────────────────────

const GRADIENTS = [
  'linear-gradient(135deg, #7C3AED, #5B21B6)',
  'linear-gradient(135deg, #C026D3, #9333EA)',
  'linear-gradient(135deg, #E11D73, #C026D3)',
  'linear-gradient(135deg, #2563EB, #7C3AED)',
  'linear-gradient(135deg, #059669, #2563EB)',
  'linear-gradient(135deg, #D97706, #E11D73)',
  'linear-gradient(135deg, #7C3AED, #E11D73)',
  'linear-gradient(135deg, #0891B2, #7C3AED)',
]

// ── RELUXE Context for the AI prompt ─────────────────────────────────────────

const RELUXE_CONTEXT = `
RELUXE Med Spa is a family-owned, 5-star med spa in Hamilton County, Indiana with two locations:
- Westfield: 514 E State Road 32, Westfield, IN 46074
- Carmel: 10485 N Pennsylvania St, Suite 150, Carmel, IN 46280
Phone: (317) 763-1142

SERVICES WE OFFER:
- Neurotoxins: Botox, Dysport, Jeuveau, Daxxify (wrinkle smoothing)
- Dermal Fillers: Juvederm, Restylane, RHA, Versa (lips, cheeks, jawline)
- Biostimulators: Sculptra (collagen building)
- Facial Balancing (comprehensive injectable plans)
- Morpheus8 (RF microneedling, skin tightening)
- EvolveX (body contouring, skin tightening)
- Laser Hair Removal
- IPL Photofacial (sun damage, redness)
- ClearLift (non-ablative laser)
- ClearSkin (acne laser)
- Opus Plasma (fractional resurfacing)
- CO2 Laser (deep resurfacing)
- SkinPen Microneedling
- HydraFacial
- Glo2Facial
- Chemical Peels & MicroPeels
- PRP (platelet-rich plasma)
- Facials (custom)
- Massage
- Salt Room & Infrared Sauna (Westfield only)
- Dissolving (filler dissolving with hyalenex)
- SkinIQ Analysis
- Consultations (always free)

SKINCARE BRANDS WE CARRY:
- SkinBetter Science (AlphaRet, Trio Rebalancing Moisture Treatment, Alto Defense)
- SkinCeuticals (C E Ferulic, HA Intensifier, Triple Lipid Restore)
- Hydrinity (Restorative HA Booster, Facial Optimization System)
- Alastin (Restorative Skin Complex, TransFORM Body)
- EltaMD (UV Clear SPF 46, UV Sport, UV Daily)
- Colorescience (Sunforgettable, Total Eye)

NEARBY CITIES WE SERVE: Indianapolis, Fishers, Noblesville, Zionsville, Broad Ripple, Meridian-Kessler

KEY DIFFERENTIATORS:
- 5.0 star rating across hundreds of Google reviews
- Medical Director oversees all treatment plans
- Transparent pricing, no hidden fees
- VIP Membership saves 10-15% on everything
- Cherry financing available (0% APR)
- Not a franchise — locally owned
`.trim()

// ── Article Generation ───────────────────────────────────────────────────────

const CATEGORIES = [
  {
    key: 'skincare',
    label: 'Skin Tips',
    businessGoal: 'brand_authority',
    author: 'RELUXE Aesthetics Team',
    prompt: `Write an article about SKINCARE — routines, ingredients, product recommendations, seasonal skin tips, or ingredient education. Reference our specific brands (SkinBetter Science, SkinCeuticals, Hydrinity, Alastin, EltaMD, Colorescience) when relevant. Focus on what someone in Indiana searching for skincare advice would look for.`,
  },
  {
    key: 'treatments',
    label: 'Treatment Guides',
    businessGoal: 'booking_frequency',
    author: 'RELUXE Clinical Team',
    prompt: `Write an article about a TREATMENT or CONDITION — explaining how a med spa treatment works, comparing treatments, addressing a skin/body concern, or guiding someone through what to expect. Reference our specific services. Focus on what someone in Indiana considering med spa treatments would search for.`,
  },
  {
    key: 'local',
    label: 'Indiana Living',
    businessGoal: 'brand_authority',
    author: 'RELUXE Team',
    prompt: `Write an article connecting BEAUTY/WELLNESS to something LOCAL or SEASONAL — Indiana weather, upcoming seasons, local events, holidays, weekend plans, or timely topics. Tie skincare or treatment advice to what's happening right now in Indiana. Make it feel relevant to someone living in the Indianapolis/Hamilton County area.`,
  },
]

async function generateArticle(anthropic, category, existingSlugs) {
  const today = new Date()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const month = monthNames[today.getMonth()]
  const year = today.getFullYear()
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]

  const systemPrompt = `You are a senior med spa content writer for RELUXE Med Spa. Write SEO-optimized inspiration articles that are warm, expert, and conversational — never salesy or corporate. Use short paragraphs, direct language, and practical advice. Every article should feel like a knowledgeable friend giving you the real answer.

${RELUXE_CONTEXT}

TODAY: ${dayOfWeek}, ${month} ${today.getDate()}, ${year}

CRITICAL RULES:
- Write for SEO: use target keywords naturally in the title, first paragraph, and headings
- Target keywords someone in Indiana would search for (e.g., "best botox carmel indiana", "skincare routine for winter", "med spa near me")
- Every article MUST end with a CTA block
- Articles should be 600-900 words (4-6 min read)
- Be specific and actionable — no fluff
- Reference RELUXE services and products by name when relevant
- Never make medical claims — use "may", "can help", "designed to"
- Include 3-5 H2 headings for scannability
- NEVER repeat a topic that already exists. Here are existing slugs to avoid duplicating: ${existingSlugs.slice(-30).join(', ')}`

  const userPrompt = `${category.prompt}

Generate a unique, timely article. Output ONLY valid JSON in this exact format — no markdown, no code fences:
{
  "title": "Article title (50-70 chars, include a target keyword)",
  "excerpt": "One compelling sentence that makes someone want to read (under 160 chars)",
  "read_time": "X min read",
  "body": [
    { "type": "p", "text": "Opening paragraph that hooks the reader and includes the target keyword naturally." },
    { "type": "h2", "text": "First Section Heading" },
    { "type": "p", "text": "Section content..." },
    { "type": "h2", "text": "Second Section Heading" },
    { "type": "p", "text": "More content..." },
    { "type": "list", "items": ["Point 1", "Point 2", "Point 3"], "ordered": false },
    { "type": "h2", "text": "Third Section Heading" },
    { "type": "p", "text": "Practical advice..." },
    { "type": "callout", "text": "Pro tip or key takeaway", "variant": "tip" },
    { "type": "p", "text": "Closing paragraph..." },
    { "type": "cta", "text": "CTA button text (e.g., Book a Free Consultation)" }
  ],
  "related_services": ["slug1", "slug2"]
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const text = response.content[0].text.trim()
  // Parse JSON — strip any accidental markdown fencing
  const cleaned = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '')
  return JSON.parse(cleaned)
}

// ── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Cron auth — fail-closed
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.authorization
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const db = getServiceClient()
  const anthropic = new Anthropic({ apiKey })

  // Get existing slugs to avoid duplication
  const { data: existing } = await db
    .from('inspiration_articles')
    .select('slug')
    .order('created_at', { ascending: false })
    .limit(60)
  const existingSlugs = (existing || []).map((r) => r.slug)

  // Calculate staggered publish times (Eastern Time)
  const offset = getEasternOffset()
  // Morning: 8-10am ET → 12-14 UTC (EST) or 12-14 UTC (EDT)
  const morningUTC = 8 + offset
  // Afternoon: 1-3pm ET
  const afternoonUTC = 13 + offset
  // Evening: 6-8pm ET
  const eveningUTC = 18 + offset

  const publishTimes = [
    scheduledTime(morningUTC, 0, 59),     // Morning window
    scheduledTime(afternoonUTC, 0, 59),   // Afternoon window
    scheduledTime(eveningUTC, 0, 59),     // Evening window
  ]

  const results = []

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i]
    try {
      const article = await generateArticle(anthropic, cat, existingSlugs)

      // Build slug with date prefix for uniqueness
      const datePrefix = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const slug = `${datePrefix}-${slugify(article.title)}`

      // Check for duplicate slug
      if (existingSlugs.includes(slug)) {
        console.log(`[generate-inspiration] Skipping duplicate slug: ${slug}`)
        continue
      }

      const row = {
        slug,
        title: article.title,
        excerpt: article.excerpt,
        category: cat.label,
        business_goal: cat.businessGoal,
        read_time: article.read_time || '5 min read',
        gradient: GRADIENTS[randomInt(0, GRADIENTS.length - 1)],
        author: cat.author,
        body: article.body,
        related_services: article.related_services || [],
        status: 'scheduled',
        featured: false,
        sort_order: 0, // Will be ordered by published_at on publish
        published_at: publishTimes[i],
      }

      const { data, error } = await db.from('inspiration_articles').insert(row).select('id, slug').single()

      if (error) {
        console.error(`[generate-inspiration] Insert error for ${cat.key}:`, error.message)
        results.push({ category: cat.key, error: error.message })
      } else {
        existingSlugs.push(slug)
        results.push({ category: cat.key, slug, id: data.id, publishAt: publishTimes[i] })
        console.log(`[generate-inspiration] Created ${cat.key}: ${slug} (publishes ${publishTimes[i]})`)
      }
    } catch (err) {
      console.error(`[generate-inspiration] Error generating ${cat.key}:`, err.message)
      results.push({ category: cat.key, error: err.message })
    }
  }

  return res.status(200).json({
    ok: true,
    generated: results.filter((r) => !r.error).length,
    results,
  })
}
