// src/pages/api/cron/generate-products.js
// Daily cron — generates 3 skincare product pages via Claude AI.
// Each product is from a different brand we carry.
// Attempts to scrape images from official brand websites.
// Products are saved as active=false with staggered published_at,
// then the publish-products cron flips them live on schedule.

import Anthropic from '@anthropic-ai/sdk'
import { getServiceClient } from '@/lib/supabase'

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[''®™©]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function getEasternOffset() {
  const now = new Date()
  const year = now.getFullYear()
  const marchStart = new Date(year, 2, 1)
  const marchSunday = 14 - marchStart.getDay()
  const dstStart = new Date(year, 2, marchSunday, 2)
  const novStart = new Date(year, 10, 1)
  const novSunday = novStart.getDay() === 0 ? 1 : 8 - novStart.getDay()
  const dstEnd = new Date(year, 10, novSunday, 2)
  return now >= dstStart && now < dstEnd ? 4 : 5
}

function scheduledTime(baseHourUTC, minOffset = 0, maxOffset = 59) {
  const now = new Date()
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), baseHourUTC, randomInt(minOffset, maxOffset), 0))
  if (d <= now) d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString()
}

// ── Brand website product page patterns ──────────────────────────────────────

const BRAND_SCRAPE_CONFIG = {
  colorescience: { domain: 'colorescience.com', shopify: true },
  'skinbetter-science': { domain: 'skinbetter.com', shopify: false },
  skinceuticals: { domain: 'skinceuticals.com', shopify: false },
  hydrinity: { domain: 'hydrinity.com', shopify: true },
  eltamd: { domain: 'eltamd.com', shopify: false },
  universkin: { domain: 'universkin.com', shopify: false },
  alastin: { domain: 'alastin.com', shopify: false },
}

async function scrapeProductImages(brandSlug, productName) {
  const config = BRAND_SCRAPE_CONFIG[brandSlug]
  if (!config) return []

  const productSlug = slugify(productName)

  try {
    // Try Shopify JSON API first (most reliable)
    if (config.shopify) {
      const url = `https://${config.domain}/products/${productSlug}.json`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RELUXE/1.0)' },
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        const data = await res.json()
        const images = (data.product?.images || [])
          .slice(0, 3)
          .map((img) => img.src)
        if (images.length > 0) return images
      }
    }

    // Fallback: Try to fetch the HTML product page and extract og:image
    const htmlUrl = `https://${config.domain}/products/${productSlug}`
    const res = await fetch(htmlUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RELUXE/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const html = await res.text()
      const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i)
      if (ogMatch) return [ogMatch[1]]
    }
  } catch (err) {
    console.log(`[generate-products] Image scrape failed for ${brandSlug}/${productSlug}: ${err.message}`)
  }

  return []
}

async function uploadImageToStorage(db, imageUrl, productSlug) {
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RELUXE/1.0)' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const buffer = Buffer.from(await res.arrayBuffer())
    const path = `products/${Date.now()}-${productSlug}.${ext}`

    const { error } = await db.storage.from('media').upload(path, buffer, {
      contentType,
      upsert: false,
    })

    if (error) {
      console.log(`[generate-products] Storage upload failed: ${error.message}`)
      return null
    }

    const { data: { publicUrl } } = db.storage.from('media').getPublicUrl(path)
    return publicUrl
  } catch (err) {
    console.log(`[generate-products] Image download/upload failed: ${err.message}`)
    return null
  }
}

// ── Product content generation ───────────────────────────────────────────────

const RELUXE_PRODUCT_CONTEXT = `
You are writing product pages for RELUXE Med Spa, a luxury med spa in Indiana (Carmel & Westfield).
We carry premium medical-grade skincare brands: SkinBetter Science, SkinCeuticals, Hydrinity,
Colorescience, EltaMD, Universkin, and Alastin.

Key brand details:
- SkinBetter Science: Known for AlphaRet (retinoid+AHA combo), Trio Moisture Treatment, Alto Defense. Premium anti-aging.
- SkinCeuticals: Known for C E Ferulic, HA Intensifier, Triple Lipid Restore. Science-backed formulas.
- Hydrinity: Known for HA Boosters, Facial Optimization System. Hydration-focused clinical skincare.
- Colorescience: Known for mineral sunscreens (Sunforgettable), Total Eye, Even Up. SPF experts.
- EltaMD: Known for UV Clear SPF 46, UV Sport. Dermatologist-recommended sunscreens.
- Universkin: Known for custom P-Serum formulations. Personalized skincare.
- Alastin: Known for Restorative Skin Complex, TransFORM Body. Post-procedure recovery.

RELUXE offers free SkinIQ analysis to match products to patients.
VIP Members save 10-15% on all skincare purchases.
Products can be purchased in-clinic or online (varies by brand).

IMPORTANT RULES:
- Write honest, expert-level product descriptions — never generic marketing fluff
- Include real ingredient names and what they do
- Be specific about skin types and concerns this product addresses
- Include practical how-to-use instructions
- Mention how the product pairs with RELUXE treatments
- Focus on SEO keywords someone in Indiana would search for
- Never make medical claims — use "helps", "may", "designed to"
`.trim()

async function generateProductContent(anthropic, brand, existingProductNames) {
  const prompt = `You are creating a NEW skincare product page for ${brand.name} products sold at RELUXE Med Spa.

These products from ${brand.name} already exist — DO NOT create any of these:
${existingProductNames.join(', ') || 'None yet'}

Pick a REAL, actual ${brand.name} product that exists in their current product line. It should be a product that a med spa would actually carry and sell. Do NOT invent fictional products.

Output ONLY valid JSON (no markdown, no code fences):
{
  "name": "Product Name (exact official name)",
  "subtitle": "One-line benefit statement (under 60 chars)",
  "short_description": "One compelling sentence for product cards",
  "description": "2-3 paragraphs. Clinical-grade description covering what it does, key technology/formulation, expected results, and who it's best for. Be specific about ingredients and mechanisms. Include the product size if known.",
  "category": "anti-aging|sun-protection|hydration|brightening|acne|body",
  "size": "Product size (e.g., '50ml / 1.7 fl oz') — use actual product size",
  "price": null,
  "key_ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3", "Ingredient 4"],
  "skin_types": ["normal", "dry", "combination", "oily", "sensitive"],
  "concerns": ["fine-lines", "texture", "dullness", "dark-spots", "acne", "sun-protection", "hydration"],
  "how_to_use": "Step-by-step application instructions. Be specific about when to apply (AM/PM), how much to use, and where in the routine this product goes.",
  "pro_tip": "A practical clinician tip about how to get the most from this product. Mention pairing with a RELUXE treatment if relevant.",
  "faq": [
    { "q": "Question about the product", "a": "Detailed, helpful answer" },
    { "q": "Another question", "a": "Answer" },
    { "q": "Third question", "a": "Answer" },
    { "q": "Fourth question", "a": "Answer" }
  ],
  "related_services": ["service-slug-1", "service-slug-2"],
  "seo_title": "Product Name by Brand | Buy at RELUXE Med Spa Indiana",
  "seo_description": "Under 160 chars. Include product name, key benefit, and 'RELUXE Med Spa Carmel & Westfield Indiana'."
}

Pick skin_types and concerns ONLY from these allowed values:
- skin_types: normal, dry, combination, oily, sensitive
- concerns: fine-lines, texture, dullness, dark-spots, melasma, acne, oiliness, redness, rosacea, sensitivity, dryness, barrier-damage, post-procedure, puffiness, dark-circles, sun-protection, firmness, post-inflammatory, blue-light

Pick related_services from: tox, botox, filler, morpheus8, skinpen, facials, hydrafacial, glo2facial, peels, ipl, opus, co2, clearlift, evolvex, prp, sculptra, skiniq`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
    system: RELUXE_PRODUCT_CONTEXT,
  })

  const text = response.content[0].text.trim()
  const cleaned = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '')
  return JSON.parse(cleaned)
}

// ── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.authorization
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

  const db = getServiceClient()
  const anthropic = new Anthropic({ apiKey })

  // Get active brands
  const { data: brands } = await db
    .from('brands')
    .select('id, slug, name, website')
    .eq('active', true)
    .order('sort_order')

  if (!brands || brands.length === 0) {
    return res.status(200).json({ ok: true, message: 'No active brands found' })
  }

  // Get existing products per brand (to avoid duplicates)
  const { data: existingProducts } = await db
    .from('products')
    .select('name, slug, brand_id')

  const existingByBrand = {}
  for (const p of existingProducts || []) {
    if (!existingByBrand[p.brand_id]) existingByBrand[p.brand_id] = []
    existingByBrand[p.brand_id].push(p.name)
  }
  const existingSlugs = new Set((existingProducts || []).map((p) => p.slug))

  // Pick 3 different brands (rotate through, avoiding same brand twice)
  const shuffled = [...brands].sort(() => Math.random() - 0.5)
  const selectedBrands = shuffled.slice(0, Math.min(3, shuffled.length))

  // Calculate staggered publish times
  const offset = getEasternOffset()
  const publishTimes = [
    scheduledTime(8 + offset, 0, 59),   // Morning 8-9am ET
    scheduledTime(13 + offset, 0, 59),  // Afternoon 1-2pm ET
    scheduledTime(18 + offset, 0, 59),  // Evening 6-7pm ET
  ]

  const results = []

  for (let i = 0; i < selectedBrands.length; i++) {
    const brand = selectedBrands[i]
    const brandProducts = existingByBrand[brand.id] || []

    try {
      // Generate product content
      const product = await generateProductContent(anthropic, brand, brandProducts)

      const slug = slugify(product.name)

      // Check for duplicate slug
      if (existingSlugs.has(slug)) {
        console.log(`[generate-products] Skipping duplicate slug: ${slug}`)
        results.push({ brand: brand.slug, error: `Duplicate slug: ${slug}` })
        continue
      }

      // Attempt to scrape images from official site
      let imageUrl = null
      let gallery = []

      const scrapedImages = await scrapeProductImages(brand.slug, product.name)

      if (scrapedImages.length > 0) {
        // Upload primary image to Supabase Storage
        const primaryUrl = await uploadImageToStorage(db, scrapedImages[0], slug)
        if (primaryUrl) imageUrl = primaryUrl

        // Upload gallery images
        for (let gi = 1; gi < scrapedImages.length; gi++) {
          const galUrl = await uploadImageToStorage(db, scrapedImages[gi], `${slug}-${gi}`)
          if (galUrl) gallery.push(galUrl)
        }
      }

      const row = {
        brand_id: brand.id,
        slug,
        name: product.name,
        subtitle: product.subtitle,
        description: product.description,
        short_description: product.short_description,
        category: product.category,
        image_url: imageUrl,
        gallery: gallery.length > 0 ? gallery : [],
        price: product.price || null,
        size: product.size,
        key_ingredients: product.key_ingredients || [],
        skin_types: product.skin_types || [],
        concerns: product.concerns || [],
        how_to_use: product.how_to_use,
        pro_tip: product.pro_tip,
        faq: product.faq || [],
        related_services: product.related_services || [],
        staff_picks: null,
        purchase_type: null, // Inherit from brand
        is_bestseller: false,
        is_new: true,
        active: false, // Starts inactive, publish cron activates it
        sort_order: 999, // Auto-generated products go to end
        seo_title: product.seo_title,
        seo_description: product.seo_description,
        published_at: publishTimes[i],
      }

      const { data, error } = await db.from('products').insert(row).select('id, slug').single()

      if (error) {
        console.error(`[generate-products] Insert error for ${brand.slug}:`, error.message)
        results.push({ brand: brand.slug, error: error.message })
      } else {
        existingSlugs.add(slug)
        results.push({
          brand: brand.slug,
          slug,
          id: data.id,
          publishAt: publishTimes[i],
          images: scrapedImages.length,
        })
        console.log(`[generate-products] Created ${brand.slug}/${slug} (publishes ${publishTimes[i]})`)
      }
    } catch (err) {
      console.error(`[generate-products] Error generating for ${brand.slug}:`, err.message)
      results.push({ brand: brand.slug, error: err.message })
    }
  }

  return res.status(200).json({
    ok: true,
    generated: results.filter((r) => !r.error).length,
    results,
  })
}
