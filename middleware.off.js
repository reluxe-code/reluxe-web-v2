import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/book', '/book/:path*'],
};

export function middleware(req) {
  const url = req.nextUrl;
  const parts = url.pathname.split('/').filter(Boolean); // ['book','skinpen',...]
  const rest = parts.slice(1).join('/');                 // 'skinpen'

  const dest = url.clone();
  if (rest) {
    dest.pathname = `/services/${rest}`;
  } else {
    dest.pathname = '/services';
  }
  dest.searchParams.set('book', '1');

  const res = NextResponse.redirect(dest, 307);
  res.cookies.set('reluxe_open_blvd', '1', { path: '/', maxAge: 60 });
  return res;
}
