import { motion } from 'framer-motion';
import { colors, gradients } from '@/components/preview/tokens';
import ScarcityBadge from '@/components/booking/ScarcityBadge';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export function HeroBlock({ s, fonts, onBook, onConsult, locationKey }) {
  return (
    <section className="relative" style={{ backgroundColor: colors.ink, paddingTop: 80, paddingBottom: 0 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: `radial-gradient(ellipse at right, ${colors.violet}0c, transparent 70%)`, pointerEvents: 'none' }} />
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ paddingTop: 24, paddingBottom: 32 }}>
          {/* Breadcrumb */}
          <a href="/services" className="inline-flex items-center gap-1.5 mb-3 transition-colors duration-200" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(250,248,245,0.35)', textDecoration: 'none' }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            All Services
          </a>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="max-w-2xl">
              <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.1, color: colors.white, marginBottom: '0.5rem' }}>
                {s.name}
              </h1>
              {s.tagline && (
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.45)', maxWidth: '32rem' }}>
                  {s.tagline}
                </p>
              )}
              {/* Cherry financing callout */}
              <a
                href="/cherry-financing"
                className="inline-flex items-center gap-1.5 mt-3 transition-opacity duration-200 hover:opacity-80"
                style={{ textDecoration: 'none' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(250,248,245,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(250,248,245,0.3)' }}>
                  0% APR financing available
                </span>
              </a>
            </div>

            <div className="shrink-0 pb-1">
              <div className="flex flex-wrap gap-2">
                <button onClick={onBook} className="rounded-full transition-shadow duration-200 hover:shadow-[0_0_24px_rgba(124,58,237,0.3)]" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.625rem 1.75rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Book Now
                </button>
                <button onClick={onConsult} className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.625rem 1.75rem', color: 'rgba(250,248,245,0.55)', background: 'transparent', border: '1.5px solid rgba(250,248,245,0.12)', cursor: 'pointer' }}>
                  Free Consult
                </button>
              </div>
              <div className="mt-2">
                <ScarcityBadge locationKey={locationKey || 'westfield'} variant="inline" fonts={fonts} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
