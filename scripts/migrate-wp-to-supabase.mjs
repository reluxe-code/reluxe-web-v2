#!/usr/bin/env node
/**
 * migrate-wp-to-supabase.mjs
 *
 * One-time migration script: pulls ALL content from WordPress (REST + GraphQL)
 * and inserts it into Supabase (database + storage).
 *
 * Usage:
 *   node scripts/migrate-wp-to-supabase.mjs
 *
 * Requires these env vars (set in .env.local or export them):
 *   WP_API                        – WordPress REST API base (e.g. https://…/wp-json/wp/v2)
 *   NEXT_PUBLIC_SUPABASE_URL      – Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY     – Supabase service role key
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Load .env.local if present
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const envFile = readFileSync(envPath, 'utf8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* no .env.local */ }

const WP_API = process.env.WP_API_ENDPOINT || process.env.WP_API
const WP_BASE = WP_API ? WP_API.replace(/\/wp-json\/wp\/v2\/?$/, '') : null
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!WP_API) { console.error('Missing WP_API env var'); process.exit(1) }
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing Supabase env vars'); process.exit(1) }

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

const report = { blog: 0, deals: 0, staff: 0, testimonials: 0, locations: 0, categories: 0, media: 0, errors: [] }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

/** Paginate WordPress REST API */
async function fetchAllWPRest(endpoint, perPage = 100) {
  const all = []
  let page = 1
  while (true) {
    const sep = endpoint.includes('?') ? '&' : '?'
    const url = `${endpoint}${sep}per_page=${perPage}&page=${page}`
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) break
      const items = await res.json()
      if (!Array.isArray(items) || items.length === 0) break
      all.push(...items)
      if (items.length < perPage) break
      page++
    } catch { break }
  }
  return all
}

/** Simple GraphQL fetcher */
async function gqlQuery(query, variables = {}) {
  const res = await fetch(`${WP_BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`GraphQL error: HTTP ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`)
  return json.data
}

/** Download a file and upload to Supabase Storage */
async function migrateMedia(sourceUrl, storagePath) {
  if (!sourceUrl) return null
  try {
    const res = await fetch(sourceUrl)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'image/jpeg'

    const { error } = await sb.storage.from('media').upload(storagePath, buffer, {
      contentType,
      upsert: true,
    })
    if (error) {
      report.errors.push(`Storage upload failed for ${storagePath}: ${error.message}`)
      return null
    }
    report.media++
    const { data } = sb.storage.from('media').getPublicUrl(storagePath)
    return data?.publicUrl || null
  } catch (e) {
    report.errors.push(`Media download failed for ${sourceUrl}: ${e.message}`)
    return null
  }
}

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ---------------------------------------------------------------------------
// 1. BLOG POSTS
// ---------------------------------------------------------------------------

async function migrateBlogPosts() {
  console.log('\n📝 Migrating blog posts...')
  const posts = await fetchAllWPRest(`${WP_API}/posts?_embed&_fields=id,slug,title,excerpt,content,date,modified,status,categories,_embedded`)

  for (const post of posts) {
    try {
      const featuredUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
      const newImage = featuredUrl
        ? await migrateMedia(featuredUrl, `blog/${post.slug}-featured.jpg`)
        : null

      // Rewrite any inline WP images in content
      let content = post.content?.rendered || ''
      if (WP_BASE) {
        content = content.replace(
          new RegExp(WP_BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/wp-content/uploads/', 'g'),
          `${SUPABASE_URL}/storage/v1/object/public/media/blog/inline/`
        )
      }

      const { error } = await sb.from('blog_posts').upsert({
        slug: post.slug,
        title: (post.title?.rendered || '').replace(/<[^>]+>/g, ''),
        excerpt: (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim(),
        content,
        featured_image: newImage,
        status: post.status === 'publish' ? 'published' : 'draft',
        published_at: post.date,
        updated_at: post.modified || post.date,
      }, { onConflict: 'slug' })

      if (error) {
        report.errors.push(`Blog upsert failed (${post.slug}): ${error.message}`)
      } else {
        report.blog++
      }
    } catch (e) {
      report.errors.push(`Blog post migration error (${post.slug}): ${e.message}`)
    }
  }
  console.log(`  ✅ ${report.blog} blog posts migrated`)
}

// ---------------------------------------------------------------------------
// 2. CATEGORIES
// ---------------------------------------------------------------------------

async function migrateCategories() {
  console.log('\n📂 Migrating categories...')
  const cats = await fetchAllWPRest(`${WP_API}/categories?_fields=id,name,slug,count`)

  for (const cat of cats) {
    if (cat.slug === 'uncategorized') continue
    const { error } = await sb.from('categories').upsert({
      name: cat.name,
      slug: cat.slug,
    }, { onConflict: 'slug' })
    if (error) {
      report.errors.push(`Category upsert failed (${cat.slug}): ${error.message}`)
    } else {
      report.categories++
    }
  }
  console.log(`  ✅ ${report.categories} categories migrated`)
}

// ---------------------------------------------------------------------------
// 3. DEALS / MONTHLY SPECIALS
// ---------------------------------------------------------------------------

async function migrateDeals() {
  console.log('\n🏷️  Migrating deals...')
  const specials = await fetchAllWPRest(
    `${WP_API}/monthly_special?per_page=50&orderby=date&order=desc&acf_format=standard&_fields=id,slug,status,date,modified,title,acf`
  )

  for (const item of specials) {
    try {
      const acf = item.acf || {}
      const imageUrl = acf.image?.url || acf.hero?.url || acf.photo?.url || acf.media?.url || null
      const newImage = imageUrl
        ? await migrateMedia(imageUrl, `deals/${item.slug}-image.jpg`)
        : null

      const { error } = await sb.from('deals').upsert({
        slug: item.slug,
        title: (item.title?.rendered || acf.headline || 'Special').replace(/<[^>]+>/g, ''),
        subtitle: acf.subtitle || '',
        price: acf.price || null,
        compare_at: acf.compare_at || acf.compareAt || null,
        tag: acf.tag || acf.badge || null,
        image: newImage,
        cta_url: acf.cta_url || acf.url || null,
        cta_text: acf.cta_text || 'Learn more',
        start_date: acf.start_date ? formatACFDate(acf.start_date) : null,
        end_date: acf.end_date ? formatACFDate(acf.end_date) : null,
        locations: parseLocations(acf),
        status: item.status === 'publish' ? 'published' : 'draft',
      }, { onConflict: 'slug' })

      if (error) {
        report.errors.push(`Deal upsert failed (${item.slug}): ${error.message}`)
      } else {
        report.deals++
      }
    } catch (e) {
      report.errors.push(`Deal migration error (${item.slug}): ${e.message}`)
    }
  }
  console.log(`  ✅ ${report.deals} deals migrated`)
}

function formatACFDate(d) {
  const s = String(d).trim()
  if (s.length !== 8) return null
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

function parseLocations(acf) {
  const raw = acf.locations || acf.location || acf.location_slugs || []
  const arr = Array.isArray(raw) ? raw : [raw]
  return arr
    .map(x => typeof x === 'string' ? x : (x?.slug ?? x?.value?.slug ?? x?.value ?? ''))
    .map(s => String(s).trim().toLowerCase())
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// 4. STAFF
// ---------------------------------------------------------------------------

async function migrateStaff() {
  console.log('\n👩‍⚕️ Migrating staff...')

  // Paginate through all staff via GraphQL
  let after = null
  const allStaff = []

  for (;;) {
    const data = await gqlQuery(`
      query GetAllStaff($first: Int!, $after: String) {
        staffs(first: $first, after: $after, where: { orderby: { field: TITLE, order: ASC } }) {
          pageInfo { hasNextPage endCursor }
          nodes {
            slug
            title
            featuredImage { node { sourceUrl } }
            staffFields {
              stafftitle
              staffbookingurl
              stafffunfact
              videoIntro
              staffBio
              role
              location {
                ... on Location { title slug }
              }
              availability { day hours }
              credentials { credentialItem }
              specialties { specialty }
              socialProfiles { label url }
              transparentbg { sourceUrl mediaItemUrl }
            }
          }
        }
      }
    `, { first: 100, after })

    const page = data?.staffs
    if (page?.nodes?.length) allStaff.push(...page.nodes)
    if (!page?.pageInfo?.hasNextPage) break
    after = page.pageInfo.endCursor
  }

  for (const person of allStaff) {
    try {
      const f = person.staffFields || {}
      const featuredUrl = person.featuredImage?.node?.sourceUrl || null
      const transparentUrl = f.transparentbg?.sourceUrl || f.transparentbg?.mediaItemUrl || null

      const newFeatured = featuredUrl
        ? await migrateMedia(featuredUrl, `staff/${person.slug}-featured.jpg`)
        : null
      const newTransparent = transparentUrl
        ? await migrateMedia(transparentUrl, `staff/${person.slug}-transparent.png`)
        : null

      // Normalize locations
      const rawLocs = Array.isArray(f.location) ? f.location : (f.location ? [f.location] : [])
      const locations = rawLocs.map(l => ({ slug: l?.slug || '', title: l?.title || '' })).filter(l => l.slug)

      const { error } = await sb.from('staff').upsert({
        slug: person.slug,
        name: person.title || '',
        title: f.stafftitle || '',
        bio: f.staffBio || '',
        featured_image: newFeatured,
        transparent_bg: newTransparent,
        booking_url: f.staffbookingurl || null,
        fun_fact: f.stafffunfact || null,
        video_intro: f.videoIntro || null,
        role: f.role || null,
        locations,
        specialties: (f.specialties || []).filter(s => s?.specialty),
        credentials: (f.credentials || []).filter(c => c?.credentialItem),
        availability: (f.availability || []).filter(a => a?.day),
        social_profiles: (f.socialProfiles || []).filter(s => s?.url),
        status: 'published',
      }, { onConflict: 'slug' })

      if (error) {
        report.errors.push(`Staff upsert failed (${person.slug}): ${error.message}`)
      } else {
        report.staff++
      }
    } catch (e) {
      report.errors.push(`Staff migration error (${person.slug}): ${e.message}`)
    }
  }
  console.log(`  ✅ ${report.staff} staff members migrated`)
}

// ---------------------------------------------------------------------------
// 5. TESTIMONIALS
// ---------------------------------------------------------------------------

async function migrateTestimonials() {
  console.log('\n⭐ Migrating testimonials...')

  const data = await gqlQuery(`
    query {
      testimonials(where: { status: PUBLISH }, first: 200) {
        nodes {
          testimonialFields {
            authorName
            quote
            rating
            staff {
              ... on Staff { title }
            }
          }
        }
      }
    }
  `)

  const nodes = data?.testimonials?.nodes || []
  for (const node of nodes) {
    const tf = node.testimonialFields || {}
    if (!tf.quote) continue

    const { error } = await sb.from('testimonials').insert({
      author_name: tf.authorName || 'Anonymous',
      quote: tf.quote,
      rating: tf.rating || 5,
      staff_name: tf.staff?.title || null,
      status: 'published',
    })

    if (error) {
      report.errors.push(`Testimonial insert failed: ${error.message}`)
    } else {
      report.testimonials++
    }
  }
  console.log(`  ✅ ${report.testimonials} testimonials migrated`)
}

// ---------------------------------------------------------------------------
// 6. LOCATIONS
// ---------------------------------------------------------------------------

async function migrateLocations() {
  console.log('\n📍 Migrating locations...')

  const data = await gqlQuery(`
    query {
      locations(first: 100) {
        nodes {
          title
          slug
          featuredImage { node { sourceUrl } }
          locationFields {
            fullAddress
            city
            state
            zip
            phone
            email
            directionssouth
            directionsnorth
            directions465
            locationMap { latitude longitude }
            hours { sunday monday tuesday wednesday thursday friday saturday }
            faqs { question answer }
            gallery { url { sourceUrl altText } }
          }
        }
      }
    }
  `)

  const nodes = data?.locations?.nodes || []
  for (const loc of nodes) {
    try {
      const f = loc.locationFields || {}
      const featuredUrl = loc.featuredImage?.node?.sourceUrl || null
      const newFeatured = featuredUrl
        ? await migrateMedia(featuredUrl, `locations/${loc.slug}-featured.jpg`)
        : null

      // Migrate gallery images
      const gallery = []
      const rawGallery = f.gallery || []
      for (let i = 0; i < rawGallery.length; i++) {
        const item = rawGallery[i]
        const srcUrl = item?.url?.sourceUrl || null
        if (!srcUrl) continue
        const newUrl = await migrateMedia(srcUrl, `locations/${loc.slug}-gallery-${i}.jpg`)
        gallery.push({
          url: newUrl || srcUrl,
          alt: item?.url?.altText || `Gallery image ${i + 1}`,
        })
      }

      // Normalize hours
      const rawHours = f.hours || []
      const hours = Array.isArray(rawHours) ? (rawHours[0] || {}) : rawHours

      const { error } = await sb.from('locations').upsert({
        slug: loc.slug,
        name: loc.title || '',
        featured_image: newFeatured,
        full_address: f.fullAddress || null,
        city: f.city || null,
        state: f.state || 'IN',
        zip: f.zip || null,
        phone: f.phone || null,
        email: f.email || null,
        directions_south: f.directionssouth || null,
        directions_north: f.directionsnorth || null,
        directions_465: f.directions465 || null,
        lat: f.locationMap?.latitude || null,
        lng: f.locationMap?.longitude || null,
        hours,
        faqs: (f.faqs || []).filter(faq => faq?.question),
        gallery,
      }, { onConflict: 'slug' })

      if (error) {
        report.errors.push(`Location upsert failed (${loc.slug}): ${error.message}`)
      } else {
        report.locations++
      }
    } catch (e) {
      report.errors.push(`Location migration error (${loc.slug}): ${e.message}`)
    }
  }
  console.log(`  ✅ ${report.locations} locations migrated`)
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
  console.log('🚀 Starting WordPress → Supabase migration')
  console.log(`   WordPress: ${WP_API}`)
  console.log(`   Supabase:  ${SUPABASE_URL}`)
  console.log('')

  await migrateCategories()
  await migrateBlogPosts()
  await migrateDeals()
  await migrateStaff()
  await migrateTestimonials()
  await migrateLocations()

  console.log('\n' + '='.repeat(50))
  console.log('📊 Migration Report')
  console.log('='.repeat(50))
  console.log(`  Blog posts:    ${report.blog}`)
  console.log(`  Categories:    ${report.categories}`)
  console.log(`  Deals:         ${report.deals}`)
  console.log(`  Staff:         ${report.staff}`)
  console.log(`  Testimonials:  ${report.testimonials}`)
  console.log(`  Locations:     ${report.locations}`)
  console.log(`  Media files:   ${report.media}`)

  if (report.errors.length) {
    console.log(`\n⚠️  ${report.errors.length} error(s):`)
    report.errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`))
  } else {
    console.log('\n✅ Zero errors — migration complete!')
  }
}

main().catch((e) => {
  console.error('💥 Migration failed:', e)
  process.exit(1)
})
