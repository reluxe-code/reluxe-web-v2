// lib/ga.js
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export function pageview(url) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', GA_ID, { page_path: url });
}

export function gaEvent(name, params = {}) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, sanitize(params));
}

export function setUserProps(props = {}) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('set', 'user_properties', sanitize(props));
}

function sanitize(obj) {
  const out = {};
  Object.keys(obj || {}).forEach(k => {
    const v = obj[k];
    if (v === undefined || v === null) return;
    out[k] = typeof v === 'string' ? v.slice(0,100) : v;
  });
  return out;
}
