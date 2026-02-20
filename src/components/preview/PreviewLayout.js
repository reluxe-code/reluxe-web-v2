import Head from 'next/head';
import { useRouter } from 'next/router';
import { fontPairings, colors } from './tokens';
import NavBar from './home-proto/NavBar';
import Footer from './home-proto/Footer';

const FONT_KEYS = ['bold', 'dramatic', 'modern'];

export default function PreviewLayout({ children, title }) {
  const router = useRouter();
  const fontKey = FONT_KEYS.includes(router.query.font) ? router.query.font : 'bold';
  const fonts = fontPairings[fontKey];

  return (
    <>
      <Head>
        <title>{title ? `${title} — RELUXE Prototype` : 'RELUXE Prototype'}</title>
        <meta name="robots" content="noindex, nofollow" />
        {Object.values(fontPairings).map((fp) => (
          <link key={fp.name} rel="stylesheet" href={fp.googleUrl} />
        ))}
      </Head>

      <div style={{ backgroundColor: '#fff' }}>
        {/* Prototype toolbar */}
        <div
          className="sticky top-0 z-50 border-b backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(26,26,26,0.92)',
            borderColor: 'rgba(250,248,245,0.08)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <a
                href="/preview"
                className="text-sm transition-colors hover:text-white"
                style={{ color: 'rgba(250,248,245,0.5)', fontFamily: fonts.body }}
              >
                &larr; Design System
              </a>
              <span style={{ color: 'rgba(250,248,245,0.15)' }}>|</span>
              <a
                href="/preview/home"
                className="text-sm transition-colors hover:text-white"
                style={{ color: 'rgba(250,248,245,0.5)', fontFamily: fonts.body, textDecoration: 'none' }}
              >
                Home
              </a>
              {[
                { label: 'Services', href: '/preview/services' },
                { label: 'Team', href: '/preview/team' },
                { label: 'Locations', href: '/preview/locations' },
                { label: 'Blog', href: '/preview/blog/post' },
                { label: 'Landing', href: '/preview/landing' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm transition-colors hover:text-white hidden sm:inline"
                  style={{
                    color: router.pathname === link.href ? colors.white : 'rgba(250,248,245,0.5)',
                    fontFamily: fonts.body,
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-xs"
                style={{ color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}
              >
                Font:
              </span>
              {FONT_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => router.push({ query: { ...router.query, font: key } }, undefined, { shallow: true })}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                  style={{
                    fontFamily: fontPairings[key].body,
                    backgroundColor: fontKey === key ? colors.violet : 'rgba(250,248,245,0.08)',
                    color: fontKey === key ? '#fff' : 'rgba(250,248,245,0.5)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {fontPairings[key].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <NavBar fontKey={fontKey} />
        {typeof children === 'function' ? children({ fontKey, fonts }) : children}
        <Footer fontKey={fontKey} />
      </div>
    </>
  );
}

PreviewLayout.useFontKey = function useFontKey() {
  const router = useRouter();
  return FONT_KEYS.includes(router.query.font) ? router.query.font : 'bold';
};
