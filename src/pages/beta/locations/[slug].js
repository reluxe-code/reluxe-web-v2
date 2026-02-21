import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import ServiceCardGrid from '@/components/beta/ServiceCardGrid';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { getServiceClient } from '@/lib/supabase';
import { toWPStaffShape } from '@/lib/staff-helpers';
import { getTestimonialsSSR } from '@/lib/testimonials';
import { LOCATIONS } from '@/data/locations';
import { isAvailableAtLocation } from '@/data/locationAvailability';
import { getServicesList } from '@/data/servicesList';
import GravityBookButton from '@/components/beta/GravityBookButton';
import ScarcityBadge from '@/components/booking/ScarcityBadge';
import MemberPageWidget from '@/components/beta/MemberPageWidget';
import ProviderAvailabilityPicker from '@/components/booking/ProviderAvailabilityPicker';
import BookingChoiceCard from '@/components/booking/BookingChoiceCard';
import { categorizeProvider } from '@/lib/provider-roles';
import { getBundlesForProvider, TREATMENT_BUNDLES } from '@/data/treatmentBundles';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const privacyName = (n) => {
  if (!n) return 'Patient';
  return n.includes(' ') ? n.split(' ')[0] + ' ' + n.split(' ').pop()[0] + '.' : n;
};

const SPECIALTY_MAP = [
  { key: /tox|botox|jeuveau|xeomin|dysport/i, title: 'Tox', slug: 'tox' },
  { key: /filler|lip|facial balanc/i, title: 'Dermal Fillers', slug: 'filler' },
  { key: /sculptra/i, title: 'Sculptra', slug: 'sculptra' },
  { key: /morpheus/i, title: 'Morpheus8', slug: 'morpheus8' },
  { key: /skinpen|microneed/i, title: 'Microneedling', slug: 'microneedling' },
  { key: /ipl|photofacial/i, title: 'IPL Photofacial', slug: 'ipl' },
  { key: /laser hair/i, title: 'Laser Hair Removal', slug: 'laser-hair-removal' },
  { key: /hydrafacial/i, title: 'HydraFacial', slug: 'hydrafacial' },
  { key: /glo2/i, title: 'Glo2Facial', slug: 'glo2facial' },
  { key: /facial|peel/i, title: 'Facials & Peels', slug: 'facials' },
  { key: /massage/i, title: 'Massage', slug: 'massage' },
];

function specialtyToServices(specialties = []) {
  const seen = new Set();
  const items = [];
  specialties.forEach((sObj) => {
    const name = (sObj?.specialty || '').trim();
    if (!name) return;
    const match = SPECIALTY_MAP.find((m) => m.key.test(name));
    if (match && !seen.has(match.slug)) {
      seen.add(match.slug);
      items.push(match);
    }
  });
  return items;
}

function normalizeMoneyValue(v) {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v >= 1000 ? v / 100 : v;
  if (typeof v === 'string') {
    const source = String(v);
    const n = Number(source.replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(n)) return null;
    if (source.includes('.')) return n;
    return n >= 1000 ? n / 100 : n;
  }
  if (typeof v === 'object') {
    const raw = v.amount ?? v.value ?? v.cents ?? v.centAmount ?? null;
    if (raw == null) return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    if (v.cents != null || v.centAmount != null) return n / 100;
    return n >= 1000 ? n / 100 : n;
  }
  return null;
}

function formatCurrency(n) {
  if (n == null || !Number.isFinite(n)) return null;
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isConsultationLike(name = '') {
  const text = String(name || '').toLowerCase();
  return /consult|not sure where to start|get started|reveal/.test(text);
}

function formatPriceRange(price, name = '') {
  if (!price) return isConsultationLike(name) ? 'FREE' : 'Varies';
  const min = normalizeMoneyValue(price.min ?? price.minPrice ?? price.minimum ?? price);
  const max = normalizeMoneyValue(price.max ?? price.maxPrice ?? price.maximum ?? price);
  const consultation = isConsultationLike(name);
  if (min == null && max == null) return consultation ? 'FREE' : 'Varies';
  if ((min ?? 0) === 0 && (max ?? 0) === 0) return consultation ? 'FREE' : 'Varies';
  if (min != null && max != null) {
    if (Math.abs(min - max) < 0.01) return formatCurrency(min);
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }
  if (min === 0) return consultation ? 'FREE' : 'Varies';
  if (min != null) return `${formatCurrency(min)}+`;
  if (max === 0) return consultation ? 'FREE' : 'Varies';
  return `Up to ${formatCurrency(max)}`;
}

function providerTrack(person) {
  const category = categorizeProvider(person);
  if (category === 'Injectors') return 'injector';
  if (category === 'Massage Therapists') return 'massage';
  if (category === 'Aestheticians') return 'aesthetician';
  return null;
}

function providerRoleText(person) {
  return String(
    person?.staffFields?.staffTitle ||
      person?.staffFields?.stafftitle ||
      person?.staffFields?.role ||
      person?.staff_title ||
      person?.staffTitle ||
      person?.role ||
      ''
  ).toLowerCase();
}

function isBookableProvider(person) {
  if (!person?.boulevardProviderId) return false;
  const roleText = providerRoleText(person);
  const hasProviderRole = /(injector|nurse|np|rn|aesthetician|esthetician|massage|lmt)/i.test(roleText);
  const hasSupportOnlyRole = /(front\s*desk|reception|admin|administrator|office|director|manager|coordinator|assistant|concierge|operations|support)/i.test(roleText);
  if (hasProviderRole) return true;
  if (hasSupportOnlyRole) return false;
  return Boolean(providerTrack(person));
}

/* ─── page ─── */
function LocationDetailPage({ fontKey, fonts, location, staff, services, testimonials, globalBundles }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [entryPath, setEntryPath] = useState(null);
  const [concernBundleId, setConcernBundleId] = useState(null);
  const [concernShowAllCategories, setConcernShowAllCategories] = useState(false);
  const [concernService, setConcernService] = useState(null);
  const [concernProviderSlug, setConcernProviderSlug] = useState(null);
  const [providerChoiceSlug, setProviderChoiceSlug] = useState(null);
  const [startChoice, setStartChoice] = useState(null);
  const [startProviderSlug, setStartProviderSlug] = useState(null);
  const [allOptionsService, setAllOptionsService] = useState(null);
  const [allOptionsProviderSlug, setAllOptionsProviderSlug] = useState(null);
  const f = location.locationFields || {};
  const slug = String(location.slug || '').toLowerCase();
  const isCarmel = slug === 'carmel';
  const staticLoc = LOCATIONS.find(l => l.key === slug) || {};
  const cityName = f.city || location.title?.replace('RELUXE Med Spa ', '') || slug;
  const tagline = isCarmel ? 'Newest Location' : 'The Flagship';

  const rawHours = f.hours || {};
  const hours = Array.isArray(rawHours) ? (rawHours[0] || {}) : rawHours;
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabel = (d) => d.charAt(0).toUpperCase() + d.slice(1);

  const faqs = f.faqs?.length ? f.faqs : [
    { question: 'Do you accept walk-ins?', answer: 'Appointments are preferred; walk-ins are accommodated when the schedule allows.' },
    { question: "I'm new — can I do a consult first?", answer: 'Yes! We offer free consults to map goals and dosing. If appropriate, treatment can be done the same day.' },
    { question: 'Is parking easy?', answer: 'Both locations have convenient, free parking on-site.' },
    { question: 'Who performs treatments?', answer: 'NP and RN injectors for injectables; licensed aestheticians for skin and lasers; licensed massage therapists for massage.' },
  ];

  const filteredServices = (services || []).filter(s => isAvailableAtLocation(s.slug, slug));
  const otherSlug = isCarmel ? 'westfield' : 'carmel';
  const otherCity = isCarmel ? 'Westfield' : 'Carmel';

  const locationProviders = (staff || []).filter(isBookableProvider);
  const bookingLocation = [{ key: slug, label: cityName }];
  const providersWithServices = useMemo(() => (
    locationProviders.map((p) => {
      const serviceList = specialtyToServices(p?.staffFields?.specialties || []);
      return {
        provider: p,
        serviceList,
        serviceSlugs: new Set(serviceList.map((s) => s.slug)),
      };
    })
  ), [locationProviders]);
  const normalizedBundles = useMemo(() => {
    const source = Array.isArray(globalBundles) && globalBundles.length > 0 ? globalBundles : TREATMENT_BUNDLES;
    return source.map((b) => ({
      ...b,
      items: b.items || (b.slugs || []).map((slugItem) => ({ slug: slugItem, label: slugItem })),
    }));
  }, [globalBundles]);
  const getStartedBundle = useMemo(
    () => normalizedBundles.find((b) => /not-sure|get-started|start/i.test(`${b.id} ${b.title}`)) || null,
    [normalizedBundles]
  );
  const providersForService = useCallback((serviceSlug) => {
    if (!serviceSlug) return locationProviders;
    return providersWithServices.filter(({ serviceSlugs }) => serviceSlugs.has(serviceSlug)).map(({ provider }) => provider);
  }, [locationProviders, providersWithServices]);
  const concernBundle = useMemo(
    () => normalizedBundles.find((b) => b.id === concernBundleId) || null,
    [normalizedBundles, concernBundleId]
  );
  const concernProviders = useMemo(
    () => providersForService(concernService?.slug || null),
    [providersForService, concernService]
  );
  const allCategoryChoices = useMemo(() => {
    const map = new Map();
    providersWithServices.forEach(({ serviceList }) => {
      serviceList.forEach((svc) => {
        if (!map.has(svc.slug)) map.set(svc.slug, svc);
      });
    });
    return [...map.values()];
  }, [providersWithServices]);
  const startChoices = useMemo(() => {
    const fromBundle = (getStartedBundle?.items || []).map((it, idx) => ({
      id: `${it.slug || it.catalogId || 'consult'}-${idx}`,
      label: it.label || 'Consultation',
      slug: it.slug || null,
    }));
    if (fromBundle.length > 0) return fromBundle;
    return [{ id: 'consult-default', label: 'Consultation', slug: null }];
  }, [getStartedBundle]);
  const activeProviderSlug =
    (entryPath === 'concern' && concernProviderSlug) ||
    (entryPath === 'provider' && providerChoiceSlug) ||
    (entryPath === 'not-sure' && startProviderSlug) ||
    (entryPath === 'all-options' && allOptionsProviderSlug) ||
    null;
  const activeProvider = locationProviders.find((p) => p.slug === activeProviderSlug) || null;
  const activeProviderServices = activeProvider ? specialtyToServices(activeProvider?.staffFields?.specialties || []) : [];
  const activeProviderBundles = activeProvider
    ? getBundlesForProvider(
        activeProvider.boulevardServiceMap || {},
        slug,
        bookingLocation,
        activeProvider.treatmentBundles ?? null,
        globalBundles ?? null,
        categorizeProvider(activeProvider)
      )
    : [];
  const activeInitialService =
    (entryPath === 'concern' && (concernService?.slug || null)) ||
    (entryPath === 'not-sure' && (startChoice?.slug || null)) ||
    (entryPath === 'all-options' && (allOptionsService?.slug || null)) ||
    null;
  const activeInitialDate = null;
  const activeInitialCategory = entryPath === 'not-sure' ? 'consult' : null;
  const showWhiteDropIn = Boolean(
    entryPath
  );

  return (
    <>
      {/* Hero */}
      <section className="relative" style={{ backgroundColor: colors.ink }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '60%', height: '52%', background: `radial-gradient(ellipse at bottom left, ${colors.violet}10, transparent 70%)`, pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative" style={{ paddingTop: 'clamp(7rem, 12vw, 10rem)', paddingBottom: 'clamp(4rem, 8vw, 6rem)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-end">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 mb-3">
                <a href="/beta/locations" className="inline-flex items-center gap-1.5 transition-colors duration-200" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(250,248,245,0.5)', textDecoration: 'none' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  All Locations
                </a>
                <span className="rounded-full px-3 py-1" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)' }}>
                  {tagline}
                </span>
              </div>
              <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.1rem, 5.3vw, 4rem)', fontWeight: 700, lineHeight: 1.04, color: colors.white, marginBottom: '0.7rem', maxWidth: '38rem' }}>
                RELUXE{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{cityName}</span>
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
                {f.fullAddress && (
                  <span className="flex items-center gap-2" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: 'rgba(250,248,245,0.58)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {f.fullAddress}
                  </span>
                )}
                {(f.phone || staticLoc.phone) && (
                  <a href={`tel:${f.phone || staticLoc.phone}`} className="flex items-center gap-2 transition-colors duration-200 hover:text-white" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: 'rgba(250,248,245,0.58)', textDecoration: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    {f.phone || staticLoc.phone}
                  </a>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <GravityBookButton fontKey={fontKey} size="hero" />
                {staticLoc.mapUrl && (
                  <a href={staticLoc.mapUrl} target="_blank" rel="noopener noreferrer" className="rounded-full transition-all duration-200 hover:bg-white/10" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.8rem 1.9rem', color: 'rgba(250,248,245,0.66)', border: '1.5px solid rgba(250,248,245,0.15)', textDecoration: 'none', display: 'inline-block' }}>
                    Get Directions
                  </a>
                )}
                <ScarcityBadge locationKey={slug} variant="inline" fonts={fonts} />
              </div>
            </motion.div>

            {/* Member widget (right column — hidden when logged out) */}
            <motion.div className="relative" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
              <MemberPageWidget variant="location" fonts={fonts} locationKey={slug} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Intent Booking Flow */}
      <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '70%', height: '65%', background: `radial-gradient(ellipse, ${colors.violet}10, transparent 72%)`, pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-6 pt-0 pb-10 lg:pt-0 lg:pb-12 relative">
          <motion.div
            className="p-0"
            style={{ border: 'none', background: 'transparent' }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.5rem' }}>
              Find Your Match
            </p>
            <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.8rem, 4vw, 2.85rem)', fontWeight: 700, color: colors.white, marginBottom: '0.5rem' }}>
              Why Should I Visit RELUXE {cityName}?
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: '0.98rem', color: 'rgba(250,248,245,0.6)', marginBottom: '0.8rem', maxWidth: '44rem' }}>
              Start with one simple path and we will guide the rest.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
              {[
                { id: 'concern', label: 'I have a concern that I need help with', sub: "We'll guide you" },
                { id: 'provider', label: 'I have a provider I want to see', sub: "Let's get you booked" },
                { id: 'not-sure', label: "I don't know where to start", sub: "That's why we're here" },
                { id: 'all-options', label: 'I want to see all the options', sub: 'Show all categories first' },
              ].map((choice) => (
                <BookingChoiceCard
                  key={choice.id}
                  title={choice.label}
                  subtitle={choice.sub}
                  theme="dark"
                  selected={entryPath === choice.id}
                  fonts={fonts}
                  onClick={() => {
                    setEntryPath(choice.id);
                    setConcernBundleId(null);
                    setConcernShowAllCategories(false);
                    setConcernService(null);
                    setConcernProviderSlug(null);
                    setProviderChoiceSlug(null);
                    setStartChoice(null);
                    setStartProviderSlug(null);
                    setAllOptionsService(null);
                    setAllOptionsProviderSlug(null);
                  }}
                />
              ))}
            </div>
            {entryPath && (
              <div className="flex items-center justify-between gap-3 rounded-xl p-3" style={{ border: '1px solid rgba(250,248,245,0.12)', backgroundColor: 'rgba(250,248,245,0.04)' }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.85rem', color: 'rgba(250,248,245,0.75)', margin: 0 }}>
                  {activeProvider
                    ? <>Great. Finishing with <span style={{ color: colors.white, fontWeight: 700 }}>{activeProvider.name || activeProvider.title}</span>.</>
                    : 'Pick your path and we will guide the booking steps below.'}
                </p>
                <button
                  onClick={() => {
                    setEntryPath(null);
                    setConcernBundleId(null);
                    setConcernShowAllCategories(false);
                    setConcernService(null);
                    setConcernProviderSlug(null);
                    setProviderChoiceSlug(null);
                    setStartChoice(null);
                    setStartProviderSlug(null);
                    setAllOptionsService(null);
                    setAllOptionsProviderSlug(null);
                  }}
                  className="rounded-full px-3 py-1.5"
                  style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.white, border: '1px solid rgba(250,248,245,0.25)', backgroundColor: 'transparent', cursor: 'pointer' }}
                >
                  Start Over
                </button>
              </div>
            )}
          </motion.div>

          {showWhiteDropIn && (
            <motion.div
              className="mt-5 rounded-2xl p-4 lg:p-5"
              style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              {!activeProvider && entryPath === 'concern' && !concernBundle && (
                <>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                    Start with a treatment bundle.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {normalizedBundles.slice(0, 6).map((bundle) => (
                      <BookingChoiceCard
                        key={`concern-bundle-${bundle.id}`}
                        onClick={() => {
                          setConcernBundleId(bundle.id);
                          setConcernShowAllCategories(false);
                          setConcernService(null);
                          setConcernProviderSlug(null);
                        }}
                        title={bundle.title}
                        subtitle={bundle.description || ''}
                        fonts={fonts}
                      />
                    ))}
                  </div>
                </>
              )}
              {!activeProvider && entryPath === 'concern' && concernBundle && !concernService && !concernShowAllCategories && (
                <>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                    Choose a service in {concernBundle.title}.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(concernBundle.items || []).map((item, idx) => (
                      <BookingChoiceCard
                        key={`concern-item-${item.slug || idx}`}
                        onClick={() => {
                          setConcernService({ slug: item.slug || null, label: item.label || 'Service' });
                          setConcernShowAllCategories(false);
                          setConcernProviderSlug(null);
                        }}
                        title={item.label || 'Service'}
                        priceLabel={formatPriceRange(item.price, item.label)}
                        fonts={fonts}
                      />
                    ))}
                    <BookingChoiceCard
                      key="concern-something-else"
                      onClick={() => {
                        setConcernService(null);
                        setConcernShowAllCategories(true);
                        setConcernProviderSlug(null);
                      }}
                      title="Something else"
                      subtitle="Show all service categories"
                      fonts={fonts}
                    />
                  </div>
                </>
              )}
              {!activeProvider && entryPath === 'concern' && concernBundle && !concernService && concernShowAllCategories && (
                <>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                    Choose a category.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allCategoryChoices.map((svc) => (
                      <BookingChoiceCard
                        key={`concern-category-${svc.slug}`}
                        onClick={() => {
                          setConcernService({ slug: svc.slug, label: svc.title });
                          setConcernShowAllCategories(false);
                          setConcernProviderSlug(null);
                        }}
                        title={svc.title}
                        priceLabel={formatPriceRange(null, svc.title)}
                        fonts={fonts}
                      />
                    ))}
                  </div>
                </>
              )}
              {!activeProvider && entryPath === 'concern' && concernService && (
                <>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                    Choose your provider to continue.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {concernProviders.map((p) => (
                      <BookingChoiceCard
                        key={`concern-provider-${p.slug}`}
                        onClick={() => setConcernProviderSlug(p.slug)}
                        title={p.name || p.title}
                        subtitle={p?.staffFields?.staffTitle || p?.staffFields?.stafftitle || p?.staffFields?.role || 'Provider'}
                        fonts={fonts}
                      />
                    ))}
                  </div>
                </>
              )}
              {!activeProvider && entryPath === 'provider' && (
                <>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                    Choose your provider to continue.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {locationProviders.map((p) => (
                      <BookingChoiceCard
                        key={`provider-choice-${p.slug}`}
                        onClick={() => setProviderChoiceSlug(p.slug)}
                        title={p.name || p.title}
                        subtitle={p?.staffFields?.staffTitle || p?.staffFields?.stafftitle || p?.staffFields?.role || 'Provider'}
                        fonts={fonts}
                      />
                    ))}
                  </div>
                </>
              )}
              {!activeProvider && entryPath === 'all-options' && !allOptionsService && (
                <>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                    Choose a category to begin.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allCategoryChoices.map((svc) => (
                      <BookingChoiceCard
                        key={`all-options-category-${svc.slug}`}
                        onClick={() => {
                          setAllOptionsService(svc);
                          setAllOptionsProviderSlug(null);
                        }}
                        title={svc.title}
                        priceLabel={formatPriceRange(null, svc.title)}
                        fonts={fonts}
                      />
                    ))}
                  </div>
                </>
              )}
              {!activeProvider && entryPath === 'all-options' && allOptionsService && (
                <>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                    Choose your provider for {allOptionsService.title}.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {providersForService(allOptionsService.slug).map((p) => (
                      <BookingChoiceCard
                        key={`all-options-provider-${p.slug}`}
                        onClick={() => setAllOptionsProviderSlug(p.slug)}
                        title={p.name || p.title}
                        subtitle={p?.staffFields?.staffTitle || p?.staffFields?.stafftitle || p?.staffFields?.role || 'Provider'}
                        fonts={fonts}
                      />
                    ))}
                  </div>
                </>
              )}
              {!activeProvider && entryPath === 'not-sure' && !startChoice && (
                <>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                    Start with the Get Started bundle.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {startChoices.map((choice) => (
                      <button
                        key={`start-choice-${choice.id}`}
                        onClick={() => {
                          setStartChoice(choice);
                          setStartProviderSlug(null);
                        }}
                        className="rounded-xl p-4 text-left"
                        style={{ border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, cursor: 'pointer' }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p style={{ fontFamily: fonts.display, fontSize: '1.05rem', fontWeight: 600, color: colors.heading, margin: 0 }}>{choice.label}</p>
                          <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 700, color: colors.violet, whiteSpace: 'nowrap' }}>
                            {isConsultationLike(choice.label) ? 'FREE' : 'Varies'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {!activeProvider && entryPath === 'not-sure' && startChoice && (
                <>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                    Choose your provider to continue.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {providersForService(startChoice.slug).map((p) => (
                      <BookingChoiceCard
                        key={`start-provider-${p.slug}`}
                        onClick={() => setStartProviderSlug(p.slug)}
                        title={p.name || p.title}
                        subtitle={p?.staffFields?.staffTitle || p?.staffFields?.stafftitle || p?.staffFields?.role || 'Provider'}
                        fonts={fonts}
                      />
                    ))}
                  </div>
                </>
              )}
              {activeProvider && (
                <ProviderAvailabilityPicker
                  providerName={activeProvider.name || activeProvider.title}
                  boulevardProviderId={activeProvider.boulevardProviderId}
                  specialties={activeProviderServices}
                  locations={bookingLocation}
                  boulevardServiceMap={activeProvider.boulevardServiceMap || {}}
                  fontKey={fontKey}
                  fonts={fonts}
                  treatmentBundles={activeProviderBundles}
                  initialService={activeInitialService || undefined}
                  initialDate={activeInitialDate || undefined}
                  initialCategory={activeInitialCategory || undefined}
                />
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Hours + Contact + Details */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hours */}
            <motion.div className="rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '1rem' }}>Hours</h3>
              {Object.keys(hours).length > 0 ? dayOrder.filter(d => hours[d]).map((d) => (
                <div key={d} className="flex justify-between mb-2">
                  <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>{dayLabel(d)}</span>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500, color: hours[d] === 'Closed' ? colors.muted : colors.heading }}>{hours[d]}</span>
                </div>
              )) : (
                <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>Call for current hours</p>
              )}
            </motion.div>

            {/* Getting Here */}
            <motion.div className="rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.08 }}>
              <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '1rem' }}>Getting Here</h3>
              {staticLoc.existsNote && <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, marginBottom: '0.75rem' }}>{staticLoc.existsNote}</p>}
              {staticLoc.parking && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted }}>{staticLoc.parking}</p>}
              {staticLoc.hoursNote && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.violet, fontWeight: 500, marginTop: '0.5rem' }}>{staticLoc.hoursNote}</p>}
            </motion.div>

            {/* Quick Info */}
            <motion.div className="rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.16 }}>
              <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '1rem' }}>Nearby</h3>
              <div className="flex flex-wrap gap-1.5">
                {(staticLoc.neighborhoods || []).map((n) => (
                  <span key={n} className="rounded-full px-2.5 py-1" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: colors.heading, backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}>{n}</span>
                ))}
                {(staticLoc.landmarks || []).map((l) => (
                  <span key={l} className="rounded-full px-2.5 py-1" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: colors.violet, backgroundColor: `${colors.violet}06`, border: `1px solid ${colors.violet}15` }}>{l}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'First Visit Friendly',
                body: 'Not sure what to book? Start with a consult and we will build your exact plan.',
              },
              {
                title: 'Built Around Your Schedule',
                body: 'Book online, choose your provider, and see live openings by date and time.',
              },
              {
                title: 'Result-Driven Planning',
                body: 'We combine treatments thoughtfully so you can make progress month after month.',
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                className="rounded-2xl p-5"
                style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25 }}
              >
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.15rem', fontWeight: 600, color: colors.heading, marginBottom: '0.35rem' }}>
                  {card.title}
                </h3>
                <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, lineHeight: 1.55 }}>
                  {card.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* House of Health — Carmel only */}
      {isCarmel && (
        <section style={{ backgroundColor: colors.cream }}>
          <div className="max-w-5xl mx-auto px-6 py-16 lg:py-20">
            <motion.div className="rounded-2xl p-8 lg:p-10" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div className="inline-block rounded-full px-3 py-1 mb-4" style={{ background: `${colors.violet}08`, border: `1px solid ${colors.violet}15` }}>
                <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Partnership</span>
              </div>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, color: colors.heading, marginBottom: '0.75rem' }}>House of Health Collaboration</h2>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body, maxWidth: '36rem', marginBottom: '1.5rem' }}>
                Our Carmel location is partnered with House of Health, offering IV therapy, functional medicine, and holistic wellness alongside our aesthetic treatments. One destination, total wellness.
              </p>
              <div className="flex flex-wrap gap-2">
                {['IV Therapy', 'Functional Medicine', 'Wellness Consultations', 'Holistic Care'].map(t => (
                  <span key={t} className="rounded-full px-3 py-1.5" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.violet, background: `${colors.violet}08`, border: `1px solid ${colors.violet}15` }}>{t}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Meet the Team */}
      {staff.length > 0 && (
        <section style={{ backgroundColor: isCarmel ? '#fff' : colors.cream }}>
          <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
            <motion.div className="mb-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Team</p>
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: colors.heading }}>Meet the Team in {cityName}</h2>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {staff.map((s, i) => {
                const imgUrl = s?.featuredImage?.node?.sourceUrl;
                const name = s.name || s.title;
                const role = s?.staffFields?.staffTitle || s?.staffFields?.stafftitle || s?.staffFields?.role || '';
                return (
                  <motion.a key={s.slug} href={`/beta/team/${s.slug}`} className="group rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, textDecoration: 'none' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }} whileHover={{ y: -4 }}>
                    <div style={{ aspectRatio: '1/1', overflow: 'hidden', position: 'relative' }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} className="transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex items-center justify-center h-full" style={{ background: `linear-gradient(135deg, ${colors.violet}15, ${colors.fuchsia}08)` }}>
                          <span style={{ fontFamily: fonts.display, fontSize: '2.5rem', fontWeight: 700, color: colors.violet }}>{(name || '?')[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1.5">
                        <h3 style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 600, color: colors.heading }}>{name}</h3>
                        {s.boulevardProviderId && (
                          <ScarcityBadge locationKey={slug} staffProviderId={s.boulevardProviderId} variant="dot" fonts={fonts} />
                        )}
                      </div>
                      {role && <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.violet, fontWeight: 500 }}>{role}</p>}
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Services Available Here */}
      <ServiceCardGrid
        services={filteredServices}
        fonts={fonts}
        label={`${cityName.toUpperCase()} SERVICES`}
        heading={`Services Available at ${cityName}`}
      />
      {isCarmel && (
        <div className="max-w-7xl mx-auto px-6 -mt-8 mb-8">
          <motion.div className="rounded-xl py-3 px-4" style={{ borderLeft: `2px solid ${colors.violet}`, background: `${colors.violet}06` }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600, color: colors.violet }}>Looking for CO₂, Massage, HydraFacial, or Opus?</span>{' '}
              A handful of services are offered exclusively at Westfield.{' '}
              <a href="/beta/locations/westfield" style={{ color: colors.violet, fontWeight: 600, textDecoration: 'underline' }}>View Westfield services</a>.
            </p>
          </motion.div>
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section style={{ backgroundColor: colors.cream }}>
          <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
            <motion.div className="mb-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Real Reviews</p>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, color: colors.heading }}>What Patients Say About {cityName}</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.slice(0, 6).map((t, i) => (
                <motion.div key={t.id || i} className="rounded-2xl p-6" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(t.rating || 5)].map((_, j) => (
                      <span key={j} style={{ color: colors.violet, fontSize: '0.875rem' }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>
                    &ldquo;{(t.quote || '').length > 200 ? t.quote.slice(0, 200) + '...' : t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${colors.stone}` }}>
                    <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: `${colors.violet}10` }}>
                      <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet }}>{(t.author_name || '?')[0]}</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>{privacyName(t.author_name)}</p>
                      {t.provider && <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>Patient of {t.provider}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-4xl mx-auto px-6 py-16 lg:py-20">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>FAQ</p>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, color: colors.heading }}>Common Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04 }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex justify-between items-center p-5 text-left transition-colors duration-200" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: openFaq === i ? colors.violet : colors.heading, backgroundColor: openFaq === i ? `${colors.violet}04` : colors.cream, cursor: 'pointer', border: 'none' }}>
                  {faq.question}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: 12 }}><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="px-5 pb-5" style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, lineHeight: 1.6 }}>{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-location CTA */}
      <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        <div className="max-w-4xl mx-auto px-6 py-16 lg:py-20 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Other Location</p>
            <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
              Also Serving {otherCity}
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(250,248,245,0.5)', marginBottom: '2rem', maxWidth: '28rem', margin: '0 auto 2rem' }}>
              Same expert team, same premium experience. Visit our {otherCity} location too.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={`/beta/locations/${otherSlug}`} className="rounded-full transition-all duration-200 hover:shadow-lg" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: gradients.primary, color: '#fff', textDecoration: 'none', display: 'inline-block' }}>
                Visit {otherCity}
              </a>
              <GravityBookButton fontKey={fontKey} size="hero" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center relative">
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Ready to Visit {cityName}?</h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book online in 60 seconds.</p>
          <div className="flex justify-center">
            <GravityBookButton fontKey={fontKey} size="hero" />
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── wrapper + data ─── */

export default function BetaLocationDetail({ location, staff, services, testimonials, globalBundles }) {
  return (
    <BetaLayout
      title={`${location?.locationFields?.city || 'Location'} Location`}
      description={`Visit RELUXE Med Spa in ${location?.locationFields?.city || ''}. Hours, directions, team, services, and booking.`}
    >
      {({ fontKey, fonts }) => (
        <LocationDetailPage fontKey={fontKey} fonts={fonts} location={location} staff={staff} services={services} testimonials={testimonials} globalBundles={globalBundles} />
      )}
    </BetaLayout>
  );
}

export async function getStaticPaths() {
  const sb = getServiceClient();
  const { data } = await sb.from('locations').select('slug');
  const paths = (data || []).map(l => ({ params: { slug: l.slug } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const sb = getServiceClient();
  const pageSlug = String(params.slug || '').trim().toLowerCase();

  const [{ data: locRows }, { data: staffRows }, { data: configRow }] = await Promise.all([
    sb.from('locations').select('*').eq('slug', pageSlug).limit(1),
    sb.from('staff').select('*').eq('status', 'published').order('sort_order').order('name'),
    sb.from('site_config').select('value').eq('key', 'treatment_bundles').limit(1).single(),
  ]);

  const loc = locRows?.[0];
  if (!loc) return { notFound: true };

  const location = {
    title: loc.name || '',
    slug: loc.slug,
    featuredImage: loc.featured_image ? { node: { sourceUrl: loc.featured_image } } : null,
    locationFields: {
      fullAddress: loc.full_address || null,
      city: loc.city || null,
      state: loc.state || 'IN',
      zip: loc.zip || null,
      phone: loc.phone || null,
      email: loc.email || null,
      directionssouth: loc.directions_south || null,
      directionsnorth: loc.directions_north || null,
      directions465: loc.directions_465 || null,
      locationMap: (loc.lat && loc.lng) ? { latitude: loc.lat, longitude: loc.lng } : null,
      hours: loc.hours || {},
      faqs: Array.isArray(loc.faqs) ? loc.faqs : [],
      gallery: Array.isArray(loc.gallery)
        ? loc.gallery.map(g => ({ url: { sourceUrl: g.url, altText: g.alt || '' } }))
        : [],
    },
  };

  const allStaffWP = (staffRows || []).map(toWPStaffShape);
  const staff = allStaffWP.filter(s => {
    const locs = s?.staffFields?.location || [];
    const arr = Array.isArray(locs) ? locs : [locs];
    return arr.some(l => String(l?.slug || '').toLowerCase() === pageSlug);
  });

  let services = [];
  try {
    const all = await getServicesList();
    services = (all || []).map(s => ({ slug: s.slug, name: s.name })).filter(s => isAvailableAtLocation(s.slug, pageSlug));
  } catch {
    // Keep page render resilient if service list fails.
  }

  const testimonials = await getTestimonialsSSR({ location: pageSlug, limit: 20 });
  const globalBundles = configRow?.value || null;

  return {
    props: { location, staff, services, testimonials, globalBundles },
    revalidate: 3600,
  };
}

BetaLocationDetail.getLayout = (page) => page;
