import { motion } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { getServicesList } from '@/data/servicesList';
import { getServiceClient } from '@/lib/supabase';
import { toWPStaffShape } from '@/lib/staff-helpers';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

function SectionBlock({ title, subtitle, links, fonts, delay = 0, columns = 2 }) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="p-6 pb-3" style={{ borderBottom: `1px solid ${colors.stone}` }}>
        <h2 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading, marginBottom: '0.25rem' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted }}>{subtitle}</p>
        )}
      </div>
      <div className="p-6">
        <div className={`grid grid-cols-1 ${columns >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : columns >= 2 ? 'sm:grid-cols-2' : ''} gap-x-8 gap-y-2`}>
          {links.map((link, i) => (
            <a
              key={link.href + i}
              href={link.href}
              className="group flex items-center gap-2 py-1.5 transition-colors duration-150"
              style={{ textDecoration: 'none' }}
            >
              <span
                className="flex-shrink-0 rounded-full transition-all duration-150 group-hover:scale-110"
                style={{ width: 6, height: 6, backgroundColor: `${colors.violet}40` }}
              />
              <span
                className="transition-colors duration-150 group-hover:text-violet-600"
                style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500, color: colors.body }}
              >
                {link.label}
              </span>
              {link.badge && (
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{ fontFamily: fonts.body, fontSize: '0.5625rem', fontWeight: 600, color: colors.violet, backgroundColor: `${colors.violet}08`, border: `1px solid ${colors.violet}15` }}
                >
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SitemapPage({ fonts, services, staff }) {
  const serviceLinks = services.map(s => ({
    label: s.name,
    href: `/services/${s.slug}`,
    ...(s.badge ? { badge: s.badge } : {}),
  }));

  const staffLinks = staff.map(s => ({
    label: s.name || s.title,
    href: `/team/${s.slug}`,
  }));

  return (
    <>
      {/* Hero */}
      <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>
              Everything in One Place
            </p>
            <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
              Site{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Directory
              </span>
            </h1>
            <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '28rem', margin: '0 auto' }}>
              Quick links to every page, treatment, provider, and resource on our site.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-5xl mx-auto px-6 py-16 lg:py-24 space-y-6">

          {/* Main Pages */}
          <SectionBlock
            title="Main Pages"
            fonts={fonts}
            delay={0}
            columns={2}
            links={[
              { label: 'Home', href: '/' },
              { label: 'About RELUXE', href: '/about' },
              { label: 'All Services', href: '/services' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Our Team', href: '/team' },
              { label: 'Locations', href: '/locations' },
              { label: 'Patient Reviews', href: '/reviews' },
              { label: 'Before & After Results', href: '/results' },
              { label: 'FAQs', href: '/faqs' },
              { label: 'Contact Us', href: '/contact' },
            ]}
          />

          {/* Treatments */}
          <SectionBlock
            title="Treatments & Services"
            subtitle={`${serviceLinks.length} treatments available at both locations`}
            fonts={fonts}
            delay={0.05}
            columns={3}
            links={serviceLinks}
          />

          {/* Locations */}
          <SectionBlock
            title="Locations"
            subtitle="Two luxury med spa locations in Hamilton County"
            fonts={fonts}
            delay={0.1}
            columns={2}
            links={[
              { label: 'All Locations', href: '/locations' },
              { label: 'Westfield, IN', href: '/locations/westfield', badge: 'The Original' },
              { label: 'Carmel, IN', href: '/locations/carmel', badge: 'The Expansion' },
            ]}
          />

          {/* Team */}
          <SectionBlock
            title="Our Providers"
            subtitle={`${staffLinks.length} expert providers across both locations`}
            fonts={fonts}
            delay={0.15}
            columns={3}
            links={[
              { label: 'All Team Members', href: '/team' },
              ...staffLinks,
            ]}
          />

          {/* Membership & Rewards */}
          <SectionBlock
            title="Membership & Value"
            fonts={fonts}
            delay={0.2}
            columns={2}
            links={[
              { label: 'VIP Memberships', href: '/memberships' },
              { label: 'RELUXE Rewards', href: '/rewards' },
              { label: 'Gift Cards', href: '/gift-cards' },
              { label: 'Financing Options', href: '/pricing' },
              { label: "This Month's Deals", href: '/deals', badge: 'Hot' },
            ]}
          />

          {/* Resources */}
          <SectionBlock
            title="Resources & Inspiration"
            fonts={fonts}
            delay={0.25}
            columns={2}
            links={[
              { label: 'Inspiration & Guides', href: '/inspiration' },
              { label: 'Book an Appointment', href: '/today' },
              { label: 'Refer & Earn $25', href: '/referral' },
              { label: 'Privacy Policy', href: '/privacy-policy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Accessibility', href: '/accessibility' },
            ]}
          />
        </div>
      </section>
    </>
  );
}

export default function SitemapPageWrapper({ services, staff }) {
  return (
    <BetaLayout
      title="Site Directory — All Pages, Treatments & Providers"
      description="Complete directory of all pages at RELUXE Med Spa. Browse treatments, providers, locations, and resources. Westfield & Carmel, Indiana."
      canonical="https://reluxemedspa.com/sitemap"
    >
      {({ fonts }) => <SitemapPage fonts={fonts} services={services} staff={staff} />}
    </BetaLayout>
  );
}

export async function getStaticProps() {
  let services = [];
  try {
    const all = await getServicesList();
    services = (all || []).filter(s => s.indexable !== false).map(s => ({
      slug: s.slug,
      name: s.name,
    }));
  } catch {}

  let staff = [];
  try {
    const sb = getServiceClient();
    const { data } = await sb
      .from('staff')
      .select('*')
      .eq('status', 'published')
      .order('sort_order')
      .order('name');
    staff = (data || []).map(toWPStaffShape).map(s => ({
      slug: s.slug,
      name: s.name || s.title,
      title: s.title,
    }));
  } catch {}

  return {
    props: { services, staff },
    revalidate: 3600,
  };
}

SitemapPageWrapper.getLayout = (page) => page;
