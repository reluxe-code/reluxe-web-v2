import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import GravityBookButton from '@/components/beta/GravityBookButton';

const footerLinks = {
  Treatments: [
    { label: 'Botox & Tox', href: '/services/tox' },
    { label: 'Dermal Fillers', href: '/services/filler' },
    { label: 'Morpheus8', href: '/services/morpheus8' },
    { label: 'Laser Hair Removal', href: '/services/laser-hair-removal' },
    { label: 'Facials & Peels', href: '/services/facials' },
    { label: 'Skincare', href: '/skincare' },
    { label: 'All Services', href: '/services' },
  ],
  Locations: [
    { label: 'Carmel', href: '/locations/carmel' },
    { label: 'Westfield', href: '/locations/westfield' },
    { label: 'All Locations', href: '/locations' },
  ],
  Company: [
    { label: 'About RELUXE', href: '/about' },
    { label: 'Our Team', href: '/team' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Contact', href: '/contact' },
  ],
  Resources: [
    { label: 'Pricing', href: '/pricing' },
    { label: 'Memberships', href: '/memberships' },
    { label: 'Refer & Earn $25', href: '/referral' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Results', href: '/results' },
    { label: 'Inspiration', href: '/inspiration' },
    { label: 'Stories', href: '/stories' },
  ],
};

export default function BetaFooter({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <footer style={{ backgroundColor: colors.ink }}>
      <div style={{ height: '2px', background: gradients.primary }} />

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        {/* Top row: Brand + CTA */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <a href="/" className="inline-block flex-shrink-0">
              <img
                src="/images/logo/logo.png"
                alt="RELUXE Med Spa"
                style={{ height: 44, width: 'auto' }}
              />
            </a>
            <p
              className="max-w-sm"
              style={{
                fontFamily: fonts.body,
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                color: 'rgba(250,248,245,0.5)',
              }}
            >
              Indiana&apos;s premier med spa. Expert providers, honest advice, and results that speak for themselves.
            </p>
          </div>

          <div className="flex items-center gap-5">
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
            <div className="hidden lg:block" style={{ width: 1, height: 24, backgroundColor: 'rgba(250,248,245,0.1)' }} />
            <GravityBookButton fontKey={fontKey} size="nav" />
            <a
              href="tel:3177631142"
              className="transition-colors duration-200 hover:text-white"
              style={{
                fontFamily: fonts.body,
                fontSize: '0.875rem',
                color: 'rgba(250,248,245,0.55)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              (317) 763-1142
            </a>
          </div>
        </div>

        {/* Link columns — full width, 2-col lists under each heading */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
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
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors duration-200 hover:text-white"
                      style={{
                        fontFamily: fonts.body,
                        fontSize: '0.8125rem',
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
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
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
              { label: 'Site Directory', href: '/sitemap' },
              { label: 'Privacy', href: '/privacy-policy' },
              { label: 'Terms', href: '/terms' },
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
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: '0.75rem',
              color: 'rgba(250,248,245,0.2)',
            }}
          >
            Made with {'<3'} by{' '}
            <a
              href="https://goodlookingco.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-white"
              style={{ color: 'rgba(250,248,245,0.3)', textDecoration: 'none' }}
            >
              Ridiculously Good Looking Co.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
