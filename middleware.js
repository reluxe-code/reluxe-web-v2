import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/beta', '/beta/:path*', '/experiments/:path*', '/preview/:path*'],
};

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

  return NextResponse.next();
}
