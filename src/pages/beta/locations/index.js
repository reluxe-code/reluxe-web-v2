import { useState } from 'react';
import { motion } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { getServiceClient } from '@/lib/supabase';
import { toWPStaffShape } from '@/lib/staff-helpers';
import { getTestimonialsSSR } from '@/lib/testimonials';
import { LOCATIONS } from '@/data/locations';
import GravityBookButton from '@/components/beta/GravityBookButton';

/* ─── grain texture ─── */
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const firstVisitSteps = [
  { icon: '📍', title: 'Find Us', detail: 'Free parking right out front at both locations. No meters, no garages, no stress.' },
  { icon: '🛋️', title: 'Check In', detail: "Grab a complimentary beverage and settle into the lounge. We'll come get you when your suite is ready." },
  { icon: '💬', title: 'Consult', detail: 'Your provider will discuss your goals, answer every question, and build a custom plan. Zero pressure.' },
  { icon: '✨', title: 'Treatment', detail: "Relax in your private suite. Most treatments take 15–45 minutes. You'll leave feeling incredible." },
];

/* ─── components ─── */

function LocationCard({ loc, staticLoc, staff, fonts, index, fontKey }) {
  const f = loc.locationFields || {};
  const hours = f.hours || {};
  const gallery = (f.gallery || []).slice(0, 4);
  const faqs = (f.faqs || []).slice(0, 4);
  const amenities = staticLoc?.neighborhoods || [];
  const isCarmel = String(loc.slug).includes('carmel');

  const locGradient = isCarmel
    ? 'linear-gradient(135deg, #C026D3, #9333EA, #5B21B6)'
    : 'linear-gradient(135deg, #7C3AED, #5B21B6, #1E1B4B)';

  const tagline = isCarmel ? 'The Expansion' : 'The Original';
  const description = isCarmel
    ? 'Same obsessive standards. New energy. Partnered with House of Health for a next-level wellness experience.'
    : 'Where it all started. Full treatment menu, salt room, infrared sauna, and the team that built RELUXE from the ground up.';

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabel = (d) => d.charAt(0).toUpperCase() + d.slice(1);

  return (
    <motion.div
      className="rounded-3xl overflow-hidden"
      style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
    >
      {/* Gradient header */}
      <div className="relative" style={{ minHeight: 280, background: locGradient, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        {loc.featuredImage?.node?.sourceUrl && (
          <img src={loc.featuredImage.node.sourceUrl} alt={loc.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
        )}
        <div className="relative z-10 p-8 lg:p-10 flex flex-col justify-end h-full" style={{ minHeight: 280 }}>
          <span className="inline-block rounded-full px-4 py-1.5 mb-4 self-start" style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
            {tagline}
          </span>
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.05, marginBottom: '0.75rem' }}>
            {f.city || loc.title}
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '28rem' }}>
            {description}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="p-8 lg:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          {/* Contact */}
          <div>
            <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>Contact</h3>
            {f.fullAddress && (
              <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 500, color: colors.heading, lineHeight: 1.5, marginBottom: '0.5rem' }}>
                {f.fullAddress}
              </p>
            )}
            {(f.phone || staticLoc?.phone) && (
              <a href={`tel:${f.phone || staticLoc?.phone}`} style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.violet, textDecoration: 'none' }}>
                {f.phone || staticLoc?.phone}
              </a>
            )}
          </div>

          {/* Hours */}
          <div>
            <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>Hours</h3>
            {typeof hours === 'object' && !Array.isArray(hours) && Object.keys(hours).length > 0 ? (
              dayOrder.filter(d => hours[d]).map((d) => (
                <div key={d} className="flex justify-between mb-1.5">
                  <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>{dayLabel(d)}</span>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500, color: colors.heading }}>{hours[d]}</span>
                </div>
              ))
            ) : (
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>Call for current hours</p>
            )}
          </div>
        </div>

        {/* Nearby / Neighborhoods */}
        {amenities.length > 0 && (
          <div className="mb-8">
            <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>Nearby</h3>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <span key={a} className="rounded-full px-3 py-1.5" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.heading, backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Staff at this location */}
        {staff.length > 0 && (
          <div className="mb-8">
            <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>Team at This Location</h3>
            <div className="flex flex-wrap gap-3">
              {staff.slice(0, 8).map((s) => {
                const imgUrl = s?.featuredImage?.node?.sourceUrl;
                const name = s.name || s.title;
                return (
                  <a key={s.slug} href={`/beta/team/${s.slug}`} className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-200 hover:shadow-md" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, textDecoration: 'none' }}>
                    <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 28, height: 28, background: `${colors.violet}10` }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, color: colors.violet }}>{(name || '?')[0]}</span>
                        </div>
                      )}
                    </div>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.heading }}>{name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Gallery thumbnails */}
        {gallery.length > 0 && (
          <div className="mb-8">
            <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>Gallery</h3>
            <div className="grid grid-cols-4 gap-2">
              {gallery.map((g, i) => (
                <div key={i} className="rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <img src={g.url?.sourceUrl || g.url} alt={g.url?.altText || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <div className="mb-8">
            <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>FAQ</h3>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-xl p-4" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading, marginBottom: '0.375rem' }}>{faq.question}</p>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, lineHeight: 1.5 }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <GravityBookButton fontKey={fontKey} size="hero" />
          {(staticLoc?.mapUrl) && (
            <a href={staticLoc.mapUrl} target="_blank" rel="noopener noreferrer" className="rounded-full transition-all duration-200 hover:shadow-md" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: 'transparent', color: colors.violet, border: `1.5px solid ${colors.violet}`, textDecoration: 'none', display: 'inline-block' }}>
              Get Directions
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── page ─── */

function LocationsPage({ fontKey, fonts, locationData, staffByLocation, testimonials }) {
  return (
    <>
      {/* Hero */}
      <section className="relative" style={{ backgroundColor: colors.ink, paddingTop: 120 }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '50%', background: `radial-gradient(ellipse, ${colors.violet}08, transparent 70%)`, pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-6 pb-16 lg:pb-24 text-center relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Two Locations. One Standard.</p>
            <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, color: colors.white, marginBottom: '1rem' }}>
              Come{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Find Us</span>
            </h1>
            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.7, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', margin: '0 auto' }}>
              Two luxury locations in the heart of Hamilton County. Same obsessive standards, same premium experience at both.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Location Cards */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28 space-y-8">
          {locationData.map((loc, i) => {
            const staticLoc = LOCATIONS.find(l => l.key === loc.slug) || {};
            const staff = staffByLocation[loc.slug] || [];
            return (
              <LocationCard key={loc.slug} loc={loc} staticLoc={staticLoc} staff={staff} fonts={fonts} fontKey={fontKey} index={i} />
            );
          })}
        </div>
      </section>

      {/* Your First Visit */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>New Here?</p>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.75rem' }}>
              Your First Visit
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body, maxWidth: '28rem', margin: '0 auto' }}>
              No awkward waiting rooms. No clipboards. Here&rsquo;s what to expect.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {firstVisitSteps.map((step, i) => (
              <motion.div key={step.title} className="rounded-2xl p-6 text-center" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                <div className="text-3xl mb-4">{step.icon}</div>
                <div className="flex items-center justify-center rounded-full mx-auto mb-3" style={{ width: 28, height: 28, background: `${colors.violet}10` }}>
                  <span style={{ fontFamily: fonts.display, fontSize: '0.75rem', fontWeight: 700, color: colors.violet }}>{i + 1}</span>
                </div>
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.heading, marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5 }}>{step.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Serving Hamilton County */}
      <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Serving Hamilton County &amp; Beyond</p>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white, marginBottom: '1rem' }}>
              Luxury Aesthetics, Close to Home
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', margin: '0 auto 2.5rem' }}>
              Whether you&rsquo;re coming from Noblesville, Fishers, Zionsville, or downtown Indianapolis &mdash; we&rsquo;re worth the drive.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Westfield', 'Carmel', 'Fishers', 'Noblesville', 'Zionsville', 'Indianapolis', 'Brownsburg', 'Avon'].map((city) => (
                <span key={city} className="rounded-full px-4 py-2" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.white, backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.1)' }}>
                  {city}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* While You're Here */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>While You&rsquo;re Here</p>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '1rem' }}>
                Make a Day of It
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body, maxWidth: '28rem', marginBottom: '2rem' }}>
                Both locations are surrounded by great shopping, dining, and coffee spots. Turn your appointment into a self-care day.
              </p>
              <GravityBookButton fontKey={fontKey} size="hero" />
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Grand Junction Plaza', type: 'Outdoor Events', location: 'Westfield' },
                { name: 'Midtown Carmel', type: 'Shopping & Dining', location: 'Carmel' },
                { name: 'Indie Coffee Roasters', type: 'Coffee', location: 'Carmel' },
                { name: 'The Bridgewater Club', type: 'Dining', location: 'Westfield' },
              ].map((spot, i) => (
                <motion.div key={spot.name} className="rounded-xl p-5" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.06 }}>
                  <span className="inline-block rounded-full px-2.5 py-1 mb-3" style={{ fontFamily: fonts.body, fontSize: '0.6rem', fontWeight: 600, color: colors.violet, background: `${colors.violet}08`, border: `1px solid ${colors.violet}15`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {spot.type}
                  </span>
                  <h4 style={{ fontFamily: fonts.display, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>{spot.name}</h4>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>Near {spot.location}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Ready to Visit?</h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Pick your location and book online in 60 seconds.</p>
          <div className="flex justify-center">
            <GravityBookButton fontKey={fontKey} size="hero" />
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── wrapper + data fetching ─── */

export default function BetaLocationsIndex({ locationData, staffByLocation, testimonials }) {
  return (
    <BetaLayout title="Locations" description="Visit RELUXE Med Spa in Westfield or Carmel, Indiana. Two luxury locations, one obsessive standard. Hours, directions, and booking.">
      {({ fontKey, fonts }) => <LocationsPage fontKey={fontKey} fonts={fonts} locationData={locationData} staffByLocation={staffByLocation} testimonials={testimonials} />}
    </BetaLayout>
  );
}

export async function getStaticProps() {
  const sb = getServiceClient();

  const [{ data: locRows }, { data: staffRows }] = await Promise.all([
    sb.from('locations').select('*').order('slug'),
    sb.from('staff').select('*').eq('status', 'published').order('sort_order').order('name'),
  ]);

  // Transform locations
  const locationData = (locRows || []).map((loc) => ({
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
      locationMap: (loc.lat && loc.lng) ? { latitude: loc.lat, longitude: loc.lng } : null,
      hours: loc.hours || {},
      faqs: Array.isArray(loc.faqs) ? loc.faqs : [],
      gallery: Array.isArray(loc.gallery)
        ? loc.gallery.map(g => ({ url: { sourceUrl: g.url, altText: g.alt || '' } }))
        : [],
    },
  }));

  // Group staff by location
  const allStaffWP = (staffRows || []).map(toWPStaffShape);
  const staffByLocation = {};
  locationData.forEach((loc) => {
    staffByLocation[loc.slug] = allStaffWP.filter((s) => {
      const locs = s?.staffFields?.location || [];
      const arr = Array.isArray(locs) ? locs : [locs];
      return arr.some(l => String(l?.slug || '').toLowerCase() === loc.slug);
    });
  });

  const testimonials = await getTestimonialsSSR({ limit: 20 });

  return {
    props: { locationData, staffByLocation, testimonials },
    revalidate: 3600,
  };
}

BetaLocationsIndex.getLayout = (page) => page;
