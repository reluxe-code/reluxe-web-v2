// src/lib/blvd.js
const base = process.env.BLVD_API_BASE;
const key  = process.env.BLVD_API_KEY;
const biz  = process.env.BLVD_BUSINESS_ID;

function toQS(q) {
  if (!q) return '';
  const s = new URLSearchParams(q);
  return s.toString() ? `?${s}` : '';
}

export async function blvd({ path, query, init } = {}) {
  const res = await fetch(`${base}${path}${toQS(query)}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'X-Boulevard-Business-Id': biz,
      ...(init && init.headers ? init.headers : {})
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`BLVD ${path} ${res.status}: ${text}`);
  }
  return res.json();
}
