import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/beta',
    '/beta/:path*',
    '/experiments/:path*',
    '/preview/:path*',
    '/api/admin/:path*',
  ],
};

// Admin email whitelist (checked at edge for API routes)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (_) {
    return null;
  }
}

function extractSupabaseToken(req) {
  // Try Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Try Supabase auth cookie (sb-<ref>-auth-token)
  const cookies = req.cookies;
  for (const [name, cookie] of cookies) {
    if (name.startsWith('sb-') && name.endsWith('-auth-token')) {
      try {
        const parsed = JSON.parse(cookie.value);
        if (parsed?.access_token) return parsed.access_token;
        // Array format
        if (Array.isArray(parsed) && parsed[0]?.access_token) return parsed[0].access_token;
      } catch (_) {}
    }
  }

  // Try chunked cookies (sb-*-auth-token.0, .1, etc.)
  const chunkPrefix = [...cookies].find(([name]) =>
    name.startsWith('sb-') && name.endsWith('-auth-token.0')
  );
  if (chunkPrefix) {
    const base = chunkPrefix[0].replace('.0', '');
    const chunks = [...cookies]
      .filter(([name]) => name.startsWith(base + '.'))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, c]) => c.value)
      .join('');
    try {
      const parsed = JSON.parse(chunks);
      if (parsed?.access_token) return parsed.access_token;
    } catch (_) {}
  }

  return null;
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Beta pages were removed — redirect to equivalent non-beta URL
  if (pathname === '/beta' || pathname.startsWith('/beta/')) {
    const newPath = pathname.replace(/^\/beta/, '') || '/';
    const url = req.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.redirect(url, 301);
  }

  // Block experiments and preview pages from public access
  if (pathname.startsWith('/experiments/') || pathname.startsWith('/preview/')) {
    const url = req.nextUrl.clone();
    url.pathname = '/404';
    return NextResponse.rewrite(url);
  }

  // ── Admin API protection ──
  if (pathname.startsWith('/api/admin/')) {
    // Allow auth endpoints (login flow) through
    if (pathname.startsWith('/api/admin/auth/')) {
      return NextResponse.next();
    }

    // Allow Vercel cron requests (they include Authorization: Bearer <CRON_SECRET>)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get('authorization');
      if (authHeader === `Bearer ${cronSecret}`) {
        return NextResponse.next();
      }
    }

    const token = extractSupabaseToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Decode JWT to check email (token signature is verified by Supabase when
    // API routes call getServiceClient / auth.getUser — this is a fast pre-check)
    const payload = decodeJwtPayload(token);
    if (!payload?.email || !ADMIN_EMAILS.includes(payload.email.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check token expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}
