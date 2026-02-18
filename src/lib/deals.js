// src/lib/deals.js
// Isomorphic fetch of RELUXE deals from Supabase; caches (SSR + browser)

import { getServiceClient, supabase } from '@/lib/supabase';

const CACHE_KEY = 'reluxe:deals:v2';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

// ---------- date helpers ----------
const isActive = (deal) => {
  if (!deal.start_date || !deal.end_date) return true;
  const today = new Date();
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const s = new Date(deal.start_date + 'T00:00:00').getTime();
  const e = new Date(deal.end_date + 'T00:00:00').getTime();
  return s <= t && t <= e;
};

// ---------- normalizer (matches old WP shape for downstream compat) ----------
const normalize = (rows) =>
  (Array.isArray(rows) ? rows : [])
    .filter(isActive)
    .map((d) => ({
      id: d.id,
      slug: d.slug,
      title: d.title || 'Special',
      subtitle: d.subtitle || '',
      price: d.price || null,
      compareAt: d.compare_at || null,
      tag: d.tag || null,
      image: d.image || null,
      link: d.cta_url || null,
      ctaText: d.cta_text || 'Learn more',
      start_date: d.start_date || null,
      end_date: d.end_date || null,
      locations: d.locations || [],
      raw: d,
    }));

// ---------- small caches ----------
let ssrCache = { ts: 0, data: [] };

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
async function fetchFromSupabase() {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from('deals')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Deals fetch failed: ${error.message}`);
  return normalize(data || []);
}

// Server use (getStaticProps / getServerSideProps / API route)
export async function getDealsSSR({ force = false } = {}) {
  if (!force && ssrCache.data.length && Date.now() - ssrCache.ts < CACHE_TTL_MS) {
    return ssrCache.data;
  }
  const data = await fetchFromSupabase();
  ssrCache = { ts: Date.now(), data };
  return data;
}

// Client use (hooks/components)
export async function getDealsClient({ force = false } = {}) {
  if (!force) {
    const cached = getCachedClient();
    if (cached) return cached;
  }

  // Query Supabase directly from the browser (anon key, RLS enforced)
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to load deals');
  const normalized = normalize(data || []);
  setCachedClient(normalized);
  return normalized;
}

export function clearDealsClientCache() {
  try {
    getLS()?.removeItem(CACHE_KEY);
  } catch {}
}
