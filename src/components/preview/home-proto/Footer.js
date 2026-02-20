import { colors, gradients, fontPairings, typeScale } from '../tokens';

const footerLinks = {
  Treatments: [
    { label: 'Botox & Tox', href: '/services/tox' },
    { label: 'Dermal Fillers', href: '/services/filler' },
    { label: 'Morpheus8', href: '/services/morpheus8' },
    { label: 'Laser Hair Removal', href: '/services/laser-hair-removal' },
    { label: 'Facials & Peels', href: '/services/facials' },
    { label: 'All Services', href: '/services' },
  ],
  Locations: [
    { label: 'Westfield', href: '/locations/westfield' },
    { label: 'Carmel', href: '/locations/carmel' },
  ],
  Company: [
    { label: 'About RELUXE', href: '/about' },
    { label: 'Our Team', href: '/team' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
  ],
};

export default function Footer({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <footer style={{ backgroundColor: colors.ink }}>
      {/* Top bar — gradient accent */}
      <div style={{ height: '2px', background: gradients.primary }} />

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <span
              className="block mb-4"
              style={{
                fontFamily: fonts.display,
                fontSize: '1.75rem',
                fontWeight: 700,
                color: colors.white,
                letterSpacing: '0.06em',
              }}
            >
              RELUXE
            </span>
            <p
              className="mb-6 max-w-xs"
              style={{
                fontFamily: fonts.body,
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                color: 'rgba(250,248,245,0.5)',
              }}
            >
              Indiana&apos;s premier med spa. Expert providers, honest advice, and results that speak for themselves.
            </p>

            {/* Social icons — placeholder circles */}
            <div className="flex items-center gap-3">
              {['IG', 'FB', 'TK'].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/10"
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid rgba(250,248,245,0.12)',
                    textDecoration: 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'rgba(250,248,245,0.4)',
                    }}
                  >
                    {platform}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="lg:col-span-2">
              <p
                className="mb-4"
                style={{
                  fontFamily: fonts.body,
                  ...typeScale.label,
                  color: 'rgba(250,248,245,0.35)',
                }}
              >
                {heading}
              </p>
              <ul className="space-y-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors duration-200 hover:text-white"
                      style={{
                        fontFamily: fonts.body,
                        fontSize: '0.875rem',
                        color: 'rgba(250,248,245,0.55)',
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact / CTA column */}
          <div className="lg:col-span-2">
            <p
              className="mb-4"
              style={{
                fontFamily: fonts.body,
                ...typeScale.label,
                color: 'rgba(250,248,245,0.35)',
              }}
            >
              Get Started
            </p>
            <button
              className="w-full rounded-full mb-4 transition-shadow duration-200 hover:shadow-[0_0_24px_rgba(124,58,237,0.3)]"
              style={{
                background: gradients.primary,
                color: '#fff',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontFamily: fonts.body,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Book Now
            </button>
            <a
              href="tel:3171234567"
              className="block transition-colors duration-200 hover:text-white"
              style={{
                fontFamily: fonts.body,
                fontSize: '0.875rem',
                color: 'rgba(250,248,245,0.55)',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              (317) 399-4578
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(250,248,245,0.06)' }}
        >
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: '0.8125rem',
              color: 'rgba(250,248,245,0.25)',
            }}
          >
            &copy; 2026 RELUXE Med Spa. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Accessibility'].map((item) => (
              <a
                key={item}
                href="#"
                className="transition-colors duration-200 hover:text-white"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.8125rem',
                  color: 'rgba(250,248,245,0.25)',
                  textDecoration: 'none',
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
