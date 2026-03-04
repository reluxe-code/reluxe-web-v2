// next-sitemap.config.js
// Comprehensive sitemap for Google Search Console
// Fetches real lastmod dates from Supabase at build time

const { createClient } = require('@supabase/supabase-js');

const SITE_URL = 'https://reluxemedspa.com';

// ---------------------------------------------------------------------------
// Supabase client (build-time only, for lastmod dates)
// ---------------------------------------------------------------------------
let _sb = null;
function getSupabase() {
  if (_sb) return _sb;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) _sb = createClient(url, key);
  return _sb;
}

// ---------------------------------------------------------------------------
// Date cache — fetched once, reused across all transform() calls
// ---------------------------------------------------------------------------
let _dates = null;
async function getDateCache() {
  if (_dates) return _dates;
  _dates = {};
  const sb = getSupabase();
  if (!sb) return _dates;

  try {
    const [staff, blog, inspiration, brands, products, locations, cmsServices, serviceCategories] = await Promise.all([
      sb.from('staff').select('slug, updated_at').eq('status', 'published'),
      sb.from('blog_posts').select('slug, updated_at, published_at').eq('status', 'published'),
      sb.from('inspiration_articles').select('slug, updated_at').eq('status', 'published'),
      sb.from('brands').select('slug, updated_at').eq('active', true),
      sb.from('products').select('slug, updated_at, brands!inner(slug)').eq('active', true),
      sb.from('locations').select('slug, updated_at'),
      sb.from('cms_services').select('slug, updated_at').eq('status', 'published'),
      sb.from('service_categories').select('slug, updated_at').eq('active', true),
    ]);

    for (const r of staff.data || []) _dates[`/team/${r.slug}`] = r.updated_at;
    for (const r of blog.data || []) _dates[`/blog/${r.slug}`] = r.updated_at || r.published_at;
    for (const r of inspiration.data || []) _dates[`/inspiration/${r.slug}`] = r.updated_at;
    for (const r of brands.data || []) _dates[`/skincare/${r.slug}`] = r.updated_at;
    for (const r of products.data || []) {
      const bs = r.brands?.slug;
      if (bs) _dates[`/skincare/${bs}/${r.slug}`] = r.updated_at;
    }
    for (const r of locations.data || []) _dates[`/locations/${r.slug}`] = r.updated_at;
    for (const r of cmsServices.data || []) _dates[`/services/${r.slug}`] = r.updated_at;
    for (const r of serviceCategories.data || []) _dates[`/services/collections/${r.slug}`] = r.updated_at;

    console.log(`[next-sitemap] Loaded ${Object.keys(_dates).length} lastmod dates from Supabase`);
  } catch (err) {
    console.warn('[next-sitemap] Supabase date fetch failed:', err.message);
  }

  return _dates;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  sitemapSize: 7000,

  // ── Exclusions ──────────────────────────────────────────────────────────
  exclude: [
    // Error pages
    '/404', '/500', '/_error',
    // Auth / private
    '/profile', '/profile/**',
    '/admin', '/admin/**',
    '/dashboard', '/dashboard/**',
    '/app', '/app/**',
    // API
    '/api/**',
    // Booking flows (not indexable)
    '/start', '/start/**',
    '/book', '/book/**',
    '/today', '/today_v1',
    '/reveal',
    '/search',
    // Referral / capture
    '/referral', '/referral/**',
    '/r', '/r/**',
    '/capture', '/capture/**',
    // Preview / beta / shop
    '/beta', '/beta/**',
    '/preview', '/preview/**',
    '/shop', '/shop/**', '/shop',
    // Blog (removed from site)
    '/blog', '/blog/**',
    // Utility
    '/sitemap',
  ],

  // ── robots.txt ──────────────────────────────────────────────────────────
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile/',
          '/dashboard/',
          '/app/',
          '/start/',
          '/book/',
          '/today',
          '/today_v1',
          '/reveal',
          '/search',
          '/referral/',
          '/r/',
          '/capture/',
          '/beta/',
          '/preview/',
          '/shop/',
          '/sitemap',
        ],
      },
    ],
  },

  // ── Per-path transform ──────────────────────────────────────────────────
  transform: async (config, path) => {
    const dates = await getDateCache();

    let priority = 0.5;
    let changefreq = 'monthly';

    // Homepage
    if (path === '/') {
      priority = 1.0; changefreq = 'daily';
    }
    // ── Services ──
    else if (path === '/services') { priority = 0.95; changefreq = 'weekly'; }
    else if (/^\/services\/collections\/[^/]+$/.test(path)) { priority = 0.88; changefreq = 'weekly'; }
    else if (/^\/services\/[^/]+$/.test(path)) { priority = 0.9; changefreq = 'weekly'; }
    else if (/^\/services\/[^/]+\/[^/]+$/.test(path)) { priority = 0.85; changefreq = 'monthly'; }
    // ── Locations ──
    else if (path === '/locations') { priority = 0.9; changefreq = 'weekly'; }
    else if (path.startsWith('/locations/')) { priority = 0.9; changefreq = 'monthly'; }
    // ── Team ──
    else if (path === '/team') { priority = 0.85; changefreq = 'weekly'; }
    else if (path.startsWith('/team/')) { priority = 0.8; changefreq = 'monthly'; }
    // ── Pricing / commercial ──
    else if (path === '/pricing') { priority = 0.9; changefreq = 'weekly'; }
    else if (path === '/memberships') { priority = 0.85; changefreq = 'monthly'; }
    else if (path === '/gift-cards') { priority = 0.75; changefreq = 'monthly'; }
    else if (path === '/rewards') { priority = 0.7; changefreq = 'monthly'; }
    // ── Deals ──
    else if (path === '/hot-deals' || path === '/deals' || path === '/specials') { priority = 0.9; changefreq = 'daily'; }
    else if (path.startsWith('/hot-deals/')) { priority = 0.85; changefreq = 'daily'; }
    else if (path === '/flash-sales' || path === '/black-friday') { priority = 0.8; changefreq = 'daily'; }
    // ── Reviews / results ──
    else if (path === '/reviews') { priority = 0.85; changefreq = 'weekly'; }
    else if (path === '/results') { priority = 0.85; changefreq = 'weekly'; }
    // ── Info pages ──
    else if (path === '/about') { priority = 0.8; changefreq = 'monthly'; }
    else if (path === '/faqs') { priority = 0.8; changefreq = 'monthly'; }
    else if (path === '/contact') { priority = 0.8; changefreq = 'monthly'; }
    // ── Blog ──
    else if (path === '/blog') { priority = 0.85; changefreq = 'weekly'; }
    else if (path.startsWith('/blog/')) { priority = 0.75; changefreq = 'monthly'; }
    // ── Inspiration ──
    else if (path === '/inspiration') { priority = 0.85; changefreq = 'weekly'; }
    else if (path.startsWith('/inspiration/')) { priority = 0.8; changefreq = 'monthly'; }
    // ── Skincare ──
    else if (path === '/skincare') { priority = 0.85; changefreq = 'weekly'; }
    else if (/^\/skincare\/[^/]+$/.test(path)) { priority = 0.8; changefreq = 'weekly'; }
    else if (/^\/skincare\/[^/]+\/[^/]+$/.test(path)) { priority = 0.75; changefreq = 'monthly'; }
    // ── Learn (educational hub) ──
    else if (path === '/learn') { priority = 0.85; changefreq = 'weekly'; }
    // ── Best Med Spa (geo authority pages) ──
    else if (path.startsWith('/best-med-spa/')) { priority = 0.85; changefreq = 'monthly'; }
    // ── Conditions ──
    else if (path === '/conditions') { priority = 0.85; changefreq = 'monthly'; }
    else if (path.startsWith('/conditions/')) { priority = 0.8; changefreq = 'monthly'; }
    // ── Events ──
    else if (path === '/events') { priority = 0.8; changefreq = 'monthly'; }
    else if (path.startsWith('/events/')) { priority = 0.7; changefreq = 'monthly'; }
    // ── Weddings / men / special pages ──
    else if (path === '/wedding' || path === '/weddings') { priority = 0.8; changefreq = 'monthly'; }
    else if (path === '/men') { priority = 0.8; changefreq = 'monthly'; }
    else if (path === '/spafinder') { priority = 0.7; changefreq = 'monthly'; }
    else if (path === '/cherry-financing' || path === '/book-cherry-offer') { priority = 0.65; changefreq = 'monthly'; }
    else if (path === '/affiliations') { priority = 0.6; changefreq = 'monthly'; }
    // ── Reluxe Way (content hub) ──
    else if (path === '/reluxe-way') { priority = 0.75; changefreq = 'monthly'; }
    else if (path.startsWith('/reluxe-way/')) { priority = 0.7; changefreq = 'monthly'; }
    // ── Landing pages (lower priority — paid traffic destinations) ──
    else if (path.startsWith('/landing/')) { priority = 0.5; changefreq = 'monthly'; }
    // ── Partners ──
    else if (path.startsWith('/partners/')) { priority = 0.6; changefreq = 'monthly'; }
    // ── Legal / policy pages ──
    else if (['/terms', '/privacy-policy', '/cookie-policy', '/hipaa-notice',
              '/legal', '/accessibility', '/return-policy', '/shipping-policy',
              '/gift-card-terms', '/membership-terms', '/event-terms',
              '/media-consent', '/messaging-terms', '/package-voucher-policy',
    ].includes(path)) {
      priority = 0.3; changefreq = 'yearly';
    }
    // ── Legacy markdown blog ──
    else if (path.startsWith('/posts/')) { priority = 0.4; changefreq = 'yearly'; }
    else if (path.startsWith('/category/')) { priority = 0.3; changefreq = 'monthly'; }
    else if (path.startsWith('/tag/')) { priority = 0.3; changefreq = 'monthly'; }

    // Use real lastmod from Supabase when available, otherwise build date
    const lastmod = dates[path]
      ? new Date(dates[path]).toISOString()
      : new Date().toISOString();

    return { loc: path, changefreq, priority, lastmod };
  },

  // ── Additional paths not auto-discovered ────────────────────────────────
  additionalPaths: async () => [
    { loc: '/weddings', changefreq: 'monthly', priority: 0.8, lastmod: new Date().toISOString() },
  ],
};
