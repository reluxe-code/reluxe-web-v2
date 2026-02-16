// src/lib/deals.js
// Isomorphic fetch of RELUXE deals from WP; caches (SSR + browser)

const WP_BASE = 'https://wordpress-74434-5742908.cloudwaysapps.com/cms';
const ENDPOINT =
  `${WP_BASE}/wp-json/wp/v2/monthly_special` +
  '?per_page=50&orderby=date&order=desc' +
  '&acf_format=standard' +
  '&_fields=id,link,slug,status,date,modified,title,acf';

const CACHE_KEY = 'reluxe:deals:v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

// ---------- dates ----------
const yyyymmddToDate = (s) => {
  if (!s) return null;
  const str = String(s).trim();
  if (str.length !== 8) return null;

  const y = Number(str.slice(0, 4));
  const m = Number(str.slice(4, 6)) - 1;
  const d = Number(str.slice(6, 8));

  const dt = new Date(Date.UTC(y, m, d, 12, 0, 0));
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const isActive = (acf) => {
  const start = yyyymmddToDate(acf?.start_date);
  const end = yyyymmddToDate(acf?.end_date);

  // If dates aren’t set, treat as active
  if (!start || !end) return true;

  const today = new Date();
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const s = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()).getTime();
  const e = new Date(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()).getTime();

  return s <= t && t <= e;
};

// ---------- normalizer ----------
const normalize = (items) =>
  (Array.isArray(items) ? items : [])
    .filter((it) => it?.status === 'publish')
    .map((it) => ({ ...it, acf: it?.acf || {} }))
    .filter((it) => isActive(it.acf))
    .map((it) => {
      const a = it.acf || {};
      const image =
        a?.image?.url ||
        a?.hero?.url ||
        a?.photo?.url ||
        a?.media?.url ||
        null;

      return {
        id: it.id,
        slug: it.slug,
        title: it.title?.rendered || a?.headline || 'Special',
        subtitle: a?.subtitle || '',
        price: a?.price || null,
        compareAt: a?.compare_at || a?.compareAt || null,
        tag: a?.tag || a?.badge || null,
        image,
        link: a?.cta_url || a?.url || it.link || null,
        ctaText: a?.cta_text || 'Learn more',
        start_date: a?.start_date || null,
        end_date: a?.end_date || null,
        raw: it, // keep raw if needed
      };
    });

// ---------- small caches ----------
let ssrCache = { ts: 0, data: [] }; // node process memory

const getLS = () =>
  typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;

function getCachedClient() {
  try {
    const ls = getLS();
    if (!ls) return null;
    const raw = ls.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.ts || !parsed?.data) return null;

    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function setCachedClient(data) {
  try {
    const ls = getLS();
    if (!ls) return;
    ls.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

// ---------- fetchers ----------
async function fetchFromWP() {
  const res = await fetch(ENDPOINT, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Deals fetch failed: HTTP ${res.status}`);
  }

  const items = await res.json();
  return normalize(items);
}

// Server use (getStaticProps / getServerSideProps / API route)
export async function getDealsSSR({ force = false } = {}) {
  if (!force && ssrCache.data.length && Date.now() - ssrCache.ts < CACHE_TTL_MS) {
    return ssrCache.data;
  }

  const data = await fetchFromWP();
  ssrCache = { ts: Date.now(), data };
  return data;
}

// Client use (hooks/components). Hits /api/deals so CORS & keys stay server-side
export async function getDealsClient({ force = false } = {}) {
  if (!force) {
    const cached = getCachedClient();
    if (cached) return cached;
  }

  const res = await fetch('/api/deals');
  if (!res.ok) throw new Error('Failed to load deals');

  const data = await res.json();
  setCachedClient(data);
  return data;
}

export function clearDealsClientCache() {
  try {
    getLS()?.removeItem(CACHE_KEY);
  } catch {}
}
