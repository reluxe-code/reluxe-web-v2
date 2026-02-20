import { NextResponse } from 'next/server';

// Beta password — change this or move to env var
const BETA_PASSWORD = 'reluxe2026';
const BETA_COOKIE = 'reluxe_beta_access';

export const config = {
  matcher: ['/beta', '/beta/:path*'],
};

export function middleware(req) {
  const url = req.nextUrl;

  // Check if already authenticated
  const hasAccess = req.cookies.get(BETA_COOKIE)?.value === '1';

  // Handle password submission
  if (url.searchParams.get('beta_pw') === BETA_PASSWORD) {
    const dest = url.clone();
    dest.searchParams.delete('beta_pw');
    const res = NextResponse.redirect(dest);
    res.cookies.set(BETA_COOKIE, '1', { path: '/', maxAge: 60 * 60 * 24 * 30 }); // 30 days
    return res;
  }

  // If not authenticated, show password gate
  if (!hasAccess) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>RELUXE Beta</title>
          <meta name="robots" content="noindex, nofollow" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #1A1A1A;
              font-family: system-ui, -apple-system, sans-serif;
              color: #FAF8F5;
            }
            .gate {
              text-align: center;
              padding: 2rem;
              max-width: 400px;
              width: 100%;
            }
            .logo {
              font-size: 2rem;
              font-weight: 700;
              letter-spacing: 0.06em;
              margin-bottom: 0.5rem;
            }
            .subtitle {
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: #7C3AED;
              margin-bottom: 2rem;
            }
            form { display: flex; gap: 0.5rem; }
            input {
              flex: 1;
              padding: 0.875rem 1.25rem;
              border-radius: 9999px;
              border: 1px solid rgba(250,248,245,0.12);
              background: rgba(250,248,245,0.06);
              color: #FAF8F5;
              font-size: 0.9375rem;
              outline: none;
            }
            input:focus { border-color: #7C3AED; }
            button {
              padding: 0.875rem 1.75rem;
              border-radius: 9999px;
              border: none;
              background: linear-gradient(135deg, #7C3AED, #C026D3, #E11D73);
              color: #fff;
              font-size: 0.875rem;
              font-weight: 600;
              cursor: pointer;
            }
            .hint {
              margin-top: 1rem;
              font-size: 0.6875rem;
              color: rgba(250,248,245,0.25);
            }
          </style>
        </head>
        <body>
          <div class="gate">
            <div class="logo">RELUXE</div>
            <div class="subtitle">Beta Preview</div>
            <form method="GET">
              <input type="password" name="beta_pw" placeholder="Enter password" autofocus />
              <button type="submit">Enter</button>
            </form>
            <p class="hint">This is a private preview of the new site design.</p>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      }
    );
  }

  // Authenticated — add noindex header and continue
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}
