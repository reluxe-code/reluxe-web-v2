// src/lib/staff-helpers.js
// Maps Supabase staff rows to the WP GraphQL shape
// so StaffCard, team/index, team/[slug], and locations/[slug] all work unchanged.

/**
 * Convert a flat Supabase staff row into the nested WP GraphQL shape.
 * This avoids changing every downstream component that reads staffFields.
 */
export function toWPStaffShape(row) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.name || '',
    name: row.name || '',
    featuredImage: row.featured_image
      ? { node: { sourceUrl: row.featured_image } }
      : null,
    staffFields: {
      stafftitle: row.title || '',
      staffTitle: row.title || '',
      staffbookingurl: row.booking_url || null,
      stafffunfact: row.fun_fact || null,
      videoIntro: row.video_intro || null,
      staffBio: row.bio || '',
      role: row.role || '',
      location: Array.isArray(row.locations) ? row.locations : [],
      specialties: Array.isArray(row.specialties) ? row.specialties : [],
      credentials: Array.isArray(row.credentials)
        ? row.credentials.map((c) => ({ credentialItem: c.credentialItem || c }))
        : [],
      availability: Array.isArray(row.availability) ? row.availability : [],
      socialProfiles: Array.isArray(row.social_profiles) ? row.social_profiles : [],
      transparentbg: row.transparent_bg
        ? { sourceUrl: row.transparent_bg, mediaItemUrl: row.transparent_bg }
        : null,
    },
    // Keep raw row accessible if needed
    _raw: row,
  }
}
