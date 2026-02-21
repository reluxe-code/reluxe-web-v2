import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import GravityBookButton from '@/components/beta/GravityBookButton';

const footerLinks = {
  Treatments: [
    { label: 'Botox & Tox', href: '/beta/services/tox' },
    { label: 'Dermal Fillers', href: '/beta/services/filler' },
    { label: 'Morpheus8', href: '/beta/services/morpheus8' },
    { label: 'Laser Hair Removal', href: '/beta/services/laser-hair-removal' },
    { label: 'Facials & Peels', href: '/beta/services/facials' },
    { label: 'All Services', href: '/beta/services' },
  ],
  Locations: [
    { label: 'Carmel', href: '/beta/locations/carmel' },
    { label: 'Westfield', href: '/beta/locations/westfield' },
    { label: 'All Locations', href: '/beta/locations' },
  ],
  Company: [
    { label: 'About RELUXE', href: '/beta/about' },
    { label: 'Our Team', href: '/beta/team' },
    { label: 'Reviews', href: '/beta/reviews' },
    { label: 'Contact', href: '/beta/contact' },
  ],
  Resources: [
    { label: 'Pricing', href: '/beta/pricing' },
    { label: 'Memberships', href: '/beta/memberships' },
    { label: 'Refer & Earn $25', href: '/referral' },
    { label: 'FAQs', href: '/beta/faqs' },
    { label: 'Results', href: '/beta/results' },
    { label: 'Inspiration', href: '/beta/inspiration' },
  ],
};

export default function BetaFooter({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <footer style={{ backgroundColor: colors.ink }}>
      <div style={{ height: '2px', background: gradients.primary }} />

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <a href="/beta" className="inline-block mb-4">
              <img
                src="/images/logo/logo.png"
                alt="RELUXE Med Spa"
                style={{ height: 44, width: 'auto' }}
              />
            </a>
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

            <div className="flex items-center gap-3">
              {[
                { label: 'IG', href: 'https://www.instagram.com/reluxemedspa' },
                { label: 'FB', href: 'https://www.facebook.com/reluxemedspa' },
                { label: 'TK', href: 'https://www.tiktok.com/@reluxemedspa' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
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
                    {social.label}
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
            <div className="mb-4">
              <GravityBookButton fontKey={fontKey} size="nav" />
            </div>
            <a
              href="tel:3177631142"
              className="block transition-colors duration-200 hover:text-white"
              style={{
                fontFamily: fonts.body,
                fontSize: '0.875rem',
                color: 'rgba(250,248,245,0.55)',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              (317) 763-1142
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
            {[
              { label: 'Privacy', href: '/privacy-policy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Accessibility', href: '/accessibility' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors duration-200 hover:text-white"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.8125rem',
                  color: 'rgba(250,248,245,0.25)',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
