// src/pages/api/google-reviews.js
// GET — returns combined Google review data for both RELUXE locations
// Fetches from Google Places API, caches server-side for 24 hours

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// Hardcode place search queries — auto-discover Place IDs on first call
const LOCATIONS = [
  { key: 'westfield', query: 'RELUXE Med Spa 514 E State Road 32 Westfield IN' },
  { key: 'carmel', query: 'RELUXE Med Spa 10485 N Pennsylvania St Carmel IN' },
]

// In-memory cache (survives across warm serverless invocations)
let cache = { data: null, expiresAt: 0 }
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

async function fetchPlaceReviews(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'reviews')
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url.toString())
  const json = await res.json()

  if (json.status !== 'OK' || !json.result?.reviews) return []

  return json.result.reviews.map((r) => ({
    authorName: r.author_name,
    rating: r.rating,
    text: r.text,
    time: r.time,
    relativeTime: r.relative_time_description,
    profilePhotoUrl: r.profile_photo_url || null,
    authorUrl: r.author_url || null,
  }))
}

async function fetchPlaceData(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json')
  url.searchParams.set('input', query)
  url.searchParams.set('inputtype', 'textquery')
  url.searchParams.set('fields', 'place_id,name,rating,user_ratings_total')
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url.toString())
  const json = await res.json()

  if (json.status !== 'OK' || !json.candidates?.length) return null

  const place = json.candidates[0]
  return {
    placeId: place.place_id,
    name: place.name,
    rating: place.rating || 0,
    reviewCount: place.user_ratings_total || 0,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  // Return cache if fresh
  if (cache.data && Date.now() < cache.expiresAt) {
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
    return res.json(cache.data)
  }

  if (!API_KEY) {
    // Fallback: return static data if no API key configured
    const fallback = {
      combined: { rating: 5.0, reviewCount: 300, reviewUrl: 'https://www.google.com/search?q=RELUXE+Med+Spa+reviews' },
      locations: [],
      reviews: [],
      cached: false,
    }
    return res.json(fallback)
  }

  try {
    const results = await Promise.all(
      LOCATIONS.map(async (loc) => {
        const data = await fetchPlaceData(loc.query)
        if (!data) return null
        const reviews = await fetchPlaceReviews(data.placeId)
        return {
          key: loc.key,
          ...data,
          reviews,
          reviewUrl: `https://search.google.com/local/reviews?placeid=${data.placeId}`,
          writeReviewUrl: `https://search.google.com/local/writereview?placeid=${data.placeId}`,
        }
      })
    )

    const validResults = results.filter(Boolean)

    // Combine ratings (weighted average by review count)
    const totalReviews = validResults.reduce((s, r) => s + r.reviewCount, 0)
    const weightedRating =
      totalReviews > 0
        ? validResults.reduce((s, r) => s + r.rating * r.reviewCount, 0) / totalReviews
        : 5.0

    // Use the first location's review URL for the combined link, or a search fallback
    const primaryReviewUrl =
      validResults[0]?.reviewUrl ||
      'https://www.google.com/search?q=RELUXE+Med+Spa+reviews'

    // Interleave reviews from both locations
    const grouped = {}
    validResults.forEach((loc) => {
      ;(loc.reviews || []).forEach((r) => {
        if (!grouped[loc.key]) grouped[loc.key] = []
        grouped[loc.key].push({ ...r, locationKey: loc.key, locationName: loc.name })
      })
    })
    const keys = Object.keys(grouped)
    const interleaved = []
    const maxLen = Math.max(0, ...keys.map((k) => grouped[k].length))
    for (let i = 0; i < maxLen; i++) {
      keys.forEach((k) => {
        if (grouped[k][i]) interleaved.push(grouped[k][i])
      })
    }

    const payload = {
      combined: {
        rating: Math.round(weightedRating * 10) / 10,
        reviewCount: totalReviews,
        reviewUrl: primaryReviewUrl,
      },
      locations: validResults.map((r) => ({
        key: r.key,
        name: r.name,
        rating: r.rating,
        reviewCount: r.reviewCount,
        reviewUrl: r.reviewUrl,
        writeReviewUrl: r.writeReviewUrl,
      })),
      reviews: interleaved,
      cached: true,
      fetchedAt: new Date().toISOString(),
    }

    // Cache the result
    cache = { data: payload, expiresAt: Date.now() + CACHE_TTL }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
    return res.json(payload)
  } catch (err) {
    console.error('[google-reviews]', err.message)
    // Return fallback on error
    return res.json({
      combined: { rating: 5.0, reviewCount: 300, reviewUrl: 'https://www.google.com/search?q=RELUXE+Med+Spa+reviews' },
      locations: [],
      reviews: [],
      cached: false,
    })
  }
}
