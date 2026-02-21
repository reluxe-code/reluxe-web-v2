import { useState } from 'react';
import { motion } from 'framer-motion';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { TAB_SLUGS, FEATURED_PICKS, SLUG_TO_TAB, getInfo } from '@/data/serviceGridData';
import { useMember } from '@/context/MemberContext';
import { useLocationPref } from '@/context/LocationContext';

const TAB_NAMES = ['Featured', ...Object.keys(TAB_SLUGS)];

const BADGE_COLORS = {
  Injectables:   { bg: `${colors.violet}12`, text: colors.violet, border: `${colors.violet}25` },
  Facials:       { bg: `${colors.rose}10`, text: colors.rose, border: `${colors.rose}20` },
  Lasers:        { bg: `${colors.fuchsia}12`, text: colors.fuchsia, border: `${colors.fuchsia}25` },
  'Wow Results': { bg: '#f59e0b12', text: '#d97706', border: '#f59e0b25' },
  Massage:       { bg: '#10b98112', text: '#059669', border: '#10b98125' },
};

const GRADIENT_MAP = {
  Injectables: `linear-gradient(135deg, ${colors.violet}, ${colors.fuchsia})`,
  Facials: `linear-gradient(135deg, ${colors.rose}, ${colors.fuchsia})`,
  Lasers: `linear-gradient(135deg, ${colors.fuchsia}, ${colors.violet})`,
  'Wow Results': `linear-gradient(135deg, #f59e0b, #d97706)`,
  Massage: `linear-gradient(135deg, #10b981, #059669)`,
};

function ServiceCard({ svc, fonts, index, onBook }) {
  const tab = SLUG_TO_TAB[svc.slug] || 'Other';
  const info = getInfo(svc.slug);
  const badge = BADGE_COLORS[tab] || BADGE_COLORS.Injectables;

  return (
    <motion.div
      className="group rounded-2xl overflow-hidden flex flex-col"
      style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.03 }}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', transition: { duration: 0.2 } }}
    >
      {/* Top gradient accent */}
      <div style={{ height: 4, background: GRADIENT_MAP[tab] || gradients.primary }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Category badge */}
        <span
          className="inline-block self-start rounded-full px-2.5 py-0.5 mb-2"
          style={{
            fontFamily: fonts.body,
            fontSize: '0.625rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: badge.text,
            background: badge.bg,
            border: `1px solid ${badge.border}`,
          }}
        >
          {tab}
        </span>

        {/* Title */}
        <h3 style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 700, color: colors.heading, lineHeight: 1.3, marginBottom: '0.5rem' }}>
          {svc.name}
        </h3>

        {/* Description */}
        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, lineHeight: 1.6, marginBottom: '0.75rem' }}>
          {info.desc}
        </p>

        {/* Benefit pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {info.pills.map((pill) => (
            <span
              key={pill}
              className="rounded-full px-2 py-0.5"
              style={{
                fontFamily: fonts.body,
                fontSize: '0.625rem',
                fontWeight: 500,
                color: colors.heading,
                backgroundColor: colors.cream,
                border: `1px solid ${colors.stone}`,
              }}
            >
              {pill}
            </span>
          ))}
        </div>

        {/* Ideal For */}
        <div className="rounded-r-lg mb-4 py-1.5 pl-2.5" style={{ borderLeft: `2px solid ${colors.violet}`, background: `${colors.violet}06` }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.125rem' }}>
            Ideal For
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.body, lineHeight: 1.4 }}>
            {info.bestFor}
          </p>
        </div>

        <div className="mt-auto" />

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onBook?.()}
            className="rounded-full transition-all duration-200 hover:brightness-110"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '0.5rem 1.25rem',
              background: gradients.primary,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Book Now
          </button>
          <a
            href={`/beta/services/${svc.slug}`}
            className="rounded-full transition-all duration-200 hover:bg-gray-50"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '0.5rem 1.25rem',
              color: colors.heading,
              border: `1px solid ${colors.stone}`,
              textDecoration: 'none',
            }}
          >
            Learn More
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Filterable service card grid with Featured/category tabs.
 *
 * @param {Object[]} services  – array of { slug, name }
 * @param {Object}   fonts     – from BetaLayout render prop
 * @param {string}   [label]   – small label above heading
 * @param {string}   [heading] – section heading
 * @param {string}   [bg]      – section background color
 */
export default function ServiceCardGrid({ services, fonts, label, heading, bg }) {
  const [activeTab, setActiveTab] = useState('Featured');
  const { openBookingModal } = useMember();
  const { locationKey } = useLocationPref();

  const filtered = (() => {
    if (activeTab === 'Featured') {
      const picks = Object.values(FEATURED_PICKS);
      return services.filter((s) => picks.includes(s.slug));
    }
    const tabSlugs = TAB_SLUGS[activeTab] || [];
    return services.filter((s) => tabSlugs.includes(s.slug));
  })();

  return (
    <section style={{ backgroundColor: bg || colors.cream }}>
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          {label && (
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>{label}</p>
          )}
          {heading && (
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
              {heading}
            </h2>
          )}
        </motion.div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TAB_NAMES.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="rounded-full transition-colors duration-200"
              style={{
                fontFamily: fonts.body,
                fontSize: '0.8125rem',
                fontWeight: 600,
                padding: '0.5rem 1.25rem',
                background: activeTab === tab ? gradients.primary : 'transparent',
                color: activeTab === tab ? '#fff' : colors.body,
                border: activeTab === tab ? 'none' : `1px solid ${colors.stone}`,
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.muted }}>
              No services available in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((svc, i) => (
              <ServiceCard key={svc.slug} svc={svc} fonts={fonts} index={i} onBook={() => openBookingModal(locationKey || 'westfield')} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
