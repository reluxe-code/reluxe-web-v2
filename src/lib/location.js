// src/lib/location.js
export const LOCATIONS = {
  westfield: { id: 'cf34bcaa-6702-46c6-9f5f-43be8943cc58', label: 'Westfield' },
  carmel:    { id: '3ce18260-2e1f-4beb-8fcf-341bc85a682c', label: 'Carmel' },
};

const COOKIE = 'reluxeLocation';
const MAX_AGE = 60 * 60 * 24 * 180;

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function writeCookie(name, value, maxAge = MAX_AGE) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

export function getStoredLocationKey() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const loc = params.get('loc');
    if (loc && LOCATIONS[loc]) {
      writeCookie(COOKIE, loc);
      try { localStorage.setItem(COOKIE, loc); } catch {}
      return loc;
    }
  }
  const ck = readCookie(COOKIE);
  if (ck && LOCATIONS[ck]) return ck;
  if (typeof window !== 'undefined') {
    try {
      const ls = localStorage.getItem(COOKIE);
      if (ls && LOCATIONS[ls]) return ls;
    } catch {}
  }
  return null;
}

export function setStoredLocationKey(k) {
  if (!LOCATIONS[k]) return;
  writeCookie(COOKIE, k);
  try { localStorage.setItem(COOKIE, k); } catch {}
}
