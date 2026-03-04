import { motion } from 'framer-motion';
import Link from 'next/link';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import ScarcityBadge from '@/components/booking/ScarcityBadge';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ── book_service variant ── */
function BookServiceCTA({ content, service, fonts, onBook, onConsult, locationKey }) {
  const style = content.style || 'gradient';
  const heading = content.heading || `Ready for ${service.name}?`;
  const body = content.body || 'Book a free consultation. No pressure, just expert advice.';
  const primaryLabel = content.primaryLabel || 'Book Now';
  const secondaryLabel = content.secondaryLabel || 'Free Consult';

  if (style === 'gradient') {
    return (
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center relative">
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
            {heading}
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto' }}>
            {body}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={onBook} className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', backgroundColor: '#fff', color: colors.ink, border: 'none', cursor: 'pointer' }}>
              {primaryLabel}
            </button>
            <button onClick={onConsult} className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              {secondaryLabel}
            </button>
          </div>
          <div className="flex justify-center mt-3">
            <ScarcityBadge locationKey={locationKey} variant="inline" fonts={fonts} />
          </div>
        </div>
      </section>
    );
  }

  if (style === 'card') {
    return (
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            className="rounded-2xl p-8 md:p-10 text-center"
            style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>
              {heading}
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, marginBottom: '1.5rem', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>
              {body}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={onBook} className="rounded-full transition-shadow hover:shadow-[0_0_24px_rgba(124,58,237,0.3)]" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                {primaryLabel}
              </button>
              <button onClick={onConsult} className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', color: colors.violet, background: 'transparent', border: `1.5px solid ${colors.violet}30`, cursor: 'pointer' }}>
                {secondaryLabel}
              </button>
            </div>
            <div className="flex justify-center mt-3">
              <ScarcityBadge locationKey={locationKey} variant="inline" fonts={fonts} />
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // minimal
  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
          <div>
            <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>
              {heading}
            </h3>
            <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>
              {body}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onBook} className="rounded-full transition-shadow hover:shadow-[0_0_24px_rgba(124,58,237,0.3)]" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, padding: '0.625rem 1.5rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
              {primaryLabel}
            </button>
            <button onClick={onConsult} className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, padding: '0.625rem 1.5rem', color: colors.violet, background: 'transparent', border: `1.5px solid ${colors.violet}30`, cursor: 'pointer' }}>
              {secondaryLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── book_consult variant ── */
function BookConsultCTA({ content, service, fonts, onConsult, locationKey }) {
  const heading = content.heading || 'Not sure where to start?';
  const body = content.body || `Book a complimentary consultation and let our experts create a plan just for you.`;
  const buttonLabel = content.buttonLabel || 'Free Consultation';
  const style = content.style || 'card';

  if (style === 'gradient') {
    return (
      <section style={{ background: `linear-gradient(135deg, ${colors.violet}08, ${colors.fuchsia}06)` }}>
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Complimentary</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: colors.heading, marginBottom: '0.75rem' }}>
            {heading}
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: colors.body, marginBottom: '1.5rem', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>
            {body}
          </p>
          <button onClick={onConsult} className="rounded-full transition-shadow hover:shadow-[0_0_24px_rgba(124,58,237,0.3)]" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
            {buttonLabel}
          </button>
        </div>
      </section>
    );
  }

  // card (default)
  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          className="rounded-2xl p-8 text-center"
          style={{ background: `linear-gradient(135deg, ${colors.violet}06, ${colors.fuchsia}04)`, border: `1px solid ${colors.violet}15` }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full p-3" style={{ background: `${colors.violet}10` }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>
            {heading}
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, marginBottom: '1.5rem', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>
            {body}
          </p>
          <button onClick={onConsult} className="rounded-full transition-shadow hover:shadow-[0_0_24px_rgba(124,58,237,0.3)]" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
            {buttonLabel}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ── book_provider variant ── */
function BookProviderCTA({ content, service, fonts, onBook, staff }) {
  const providerSlug = content.providerSlug || '';
  const heading = content.heading || '';
  const body = content.body || '';
  const buttonLabel = content.buttonLabel || 'Book Now';

  // Find provider from staff data
  const provider = (staff || []).find((p) => p.href === `/team/${providerSlug}` || p.name?.toLowerCase().includes(providerSlug.toLowerCase()));
  if (!provider && !providerSlug) return null;

  const name = provider?.name || providerSlug;
  const title = provider?.title || '';
  const headshotUrl = provider?.headshotUrl || null;
  const bio = body || provider?.bio || '';
  const specialties = provider?.specialties || [];
  const displayHeading = heading || `Book with ${name}`;

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          className="rounded-2xl overflow-hidden flex flex-col sm:flex-row"
          style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Provider photo */}
          <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
            {headshotUrl ? (
              <img src={headshotUrl} alt={name} className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}12)` }} />
            )}
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <h3 style={{ fontFamily: fonts.display, fontSize: '1.375rem', fontWeight: 700, color: colors.heading, marginBottom: '0.25rem' }}>
              {displayHeading}
            </h3>
            {title && (
              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.violet, marginBottom: '0.5rem' }}>{title}</p>
            )}
            {bio && (
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {bio}
              </p>
            )}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {specialties.slice(0, 5).map((sp, j) => (
                  <span key={j} className="rounded-full px-2.5 py-1" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: colors.heading, backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
                    {sp}
                  </span>
                ))}
              </div>
            )}
            <div>
              <button onClick={onBook} className="rounded-full transition-shadow hover:shadow-[0_0_24px_rgba(124,58,237,0.3)]" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                {buttonLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── decision_helper variant ── */
function DecisionHelperCTA({ content, service, fonts }) {
  const heading = content.heading || 'Which treatment is right for you?';
  const body = content.body || 'Choose what matters most to you and we\'ll point you in the right direction.';
  const options = content.options || [];

  if (!options.length) return null;

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Find Your Match</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.5rem' }}>
            {heading}
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: colors.body, maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>
            {body}
          </p>
        </motion.div>

        <div className={`grid gap-4 ${options.length <= 2 ? 'sm:grid-cols-2 max-w-2xl mx-auto' : options.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {options.map((opt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={opt.serviceSlug ? `/services/${opt.serviceSlug}` : '#'}
                className="block rounded-2xl p-6 h-full transition-all duration-200 hover:shadow-lg group"
                style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, textDecoration: 'none' }}
              >
                <div className="rounded-full w-10 h-10 flex items-center justify-center mb-4" style={{ background: `${colors.violet}10` }}>
                  <span style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.violet }}>{i + 1}</span>
                </div>
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.heading, marginBottom: '0.375rem' }}>
                  {opt.label}
                </h3>
                {opt.description && (
                  <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {opt.description}
                  </p>
                )}
                {opt.serviceLabel && (
                  <span className="inline-flex items-center gap-1" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet }}>
                    {opt.serviceLabel}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-0.5 transition-transform">
                      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Main export ── */
export function CTABlock({ content, variant, service, fonts, onBook, onConsult, staff, locationKey }) {
  switch (variant) {
    case 'book_consult':
      return <BookConsultCTA content={content} service={service} fonts={fonts} onConsult={onConsult} locationKey={locationKey} />;
    case 'book_provider':
      return <BookProviderCTA content={content} service={service} fonts={fonts} onBook={onBook} staff={staff} />;
    case 'decision_helper':
      return <DecisionHelperCTA content={content} service={service} fonts={fonts} />;
    case 'book_service':
    default:
      return <BookServiceCTA content={content} service={service} fonts={fonts} onBook={onBook} onConsult={onConsult} locationKey={locationKey} />;
  }
}
