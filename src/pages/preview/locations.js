import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreviewLayout from '@/components/preview/PreviewLayout';
import { colors, fontPairings, typeScale, gradients } from '@/components/preview/tokens';

const locations = [
  {
    name: 'Westfield',
    tagline: 'The Original',
    description: 'Where it all started. Full treatment menu, salt room, infrared sauna, and the team that built RELUXE from the ground up.',
    address: '14767 Greyhound Plaza',
    city: 'Westfield, IN 46074',
    phone: '(317) 399-4578',
    hours: [
      { day: 'Monday–Friday', time: '9:00 AM – 7:00 PM' },
      { day: 'Saturday', time: '9:00 AM – 4:00 PM' },
      { day: 'Sunday', time: 'Closed' },
    ],
    amenities: ['Salt Room', 'Infrared Sauna', 'Full Treatment Menu', 'Private Suites', 'Free Parking', 'Complimentary Beverages'],
    gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6, #1E1B4B)',
  },
  {
    name: 'Carmel',
    tagline: 'The Expansion',
    description: 'Same obsessive standards. New energy. Partnered with House of Health for a next-level wellness experience.',
    address: '370 E Carmel Dr',
    city: 'Carmel, IN 46032',
    phone: '(317) 399-4578',
    hours: [
      { day: 'Monday–Friday', time: '9:00 AM – 7:00 PM' },
      { day: 'Saturday', time: '9:00 AM – 4:00 PM' },
      { day: 'Sunday', time: 'Closed' },
    ],
    amenities: ['House of Health Partnership', 'IV Therapy', 'Full Treatment Menu', 'Private Suites', 'Free Parking', 'Complimentary Beverages'],
    gradient: 'linear-gradient(135deg, #C026D3, #9333EA, #5B21B6)',
  },
];

const firstVisitSteps = [
  { icon: '📍', title: 'Find Us', detail: 'Free parking right out front at both locations. No meters, no garages, no stress.' },
  { icon: '🛋️', title: 'Check In', detail: 'Grab a complimentary beverage and settle into the lounge. We\'ll come get you when your suite is ready.' },
  { icon: '💬', title: 'Consult', detail: 'Your provider will discuss your goals, answer every question, and build a custom plan. Zero pressure.' },
  { icon: '✨', title: 'Treatment', detail: 'Relax in your private suite. Most treatments take 15–45 minutes. You\'ll leave feeling incredible.' },
];

const photoGallery = [
  { label: 'Lobby', gradient: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}10)` },
  { label: 'Private Suite', gradient: `linear-gradient(135deg, ${colors.fuchsia}18, ${colors.rose}10)` },
  { label: 'Treatment Room', gradient: `linear-gradient(135deg, ${colors.rose}20, ${colors.violet}12)` },
  { label: 'Salt Room', gradient: `linear-gradient(135deg, ${colors.violet}22, ${colors.rose}14)` },
  { label: 'Retail', gradient: `linear-gradient(135deg, ${colors.fuchsia}16, ${colors.violet}18)` },
  { label: 'Lounge', gradient: `linear-gradient(135deg, ${colors.rose}15, ${colors.fuchsia}20)` },
];

function LocationCard({ loc, fonts, index }) {
  return (
    <motion.div
      className="rounded-3xl overflow-hidden"
      style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
    >
      <div className="relative" style={{ minHeight: 280, background: loc.gradient, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div className="relative z-10 p-8 lg:p-10 flex flex-col justify-end h-full" style={{ minHeight: 280 }}>
          <span className="inline-block rounded-full px-4 py-1.5 mb-4 self-start" style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
            {loc.tagline}
          </span>
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.05, marginBottom: '0.75rem' }}>{loc.name}</h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '28rem' }}>{loc.description}</p>
        </div>
      </div>
      <div className="p-8 lg:p-10">
        <div className="rounded-xl mb-8" style={{ height: 200, backgroundColor: colors.stone, position: 'relative', overflow: 'hidden' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center" style={{ color: colors.muted }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="mt-2" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500 }}>Map Placeholder</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>Contact</h3>
            <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 500, color: colors.heading, lineHeight: 1.5, marginBottom: '0.5rem' }}>
              {loc.address}<br />{loc.city}
            </p>
            <a href={`tel:${loc.phone}`} style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.violet, textDecoration: 'none' }}>{loc.phone}</a>
          </div>
          <div>
            <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>Hours</h3>
            {loc.hours.map((h) => (
              <div key={h.day} className="flex justify-between mb-1.5">
                <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>{h.day}</span>
                <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500, color: colors.heading }}>{h.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {loc.amenities.map((a) => (
              <span key={a} className="rounded-full px-3 py-1.5" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.heading, backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>{a}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>Book at {loc.name}</button>
          <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: 'transparent', color: colors.violet, border: `1.5px solid ${colors.violet}`, cursor: 'pointer' }}>Get Directions</button>
        </div>
      </div>
    </motion.div>
  );
}

function LocationsPage({ fontKey, fonts }) {
  const [selectedLocation, setSelectedLocation] = useState('Westfield');

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
          {locations.map((loc, i) => (
            <LocationCard key={loc.name} loc={loc} fonts={fonts} index={i} />
          ))}
        </div>
      </section>

      {/* Photo Gallery / Virtual Tour */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Take a Look Inside</p>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
                Tour Our Spaces
              </h2>
            </div>
            <div className="flex gap-2">
              {['Westfield', 'Carmel'].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className="rounded-full px-4 py-2 transition-all duration-200"
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    backgroundColor: selectedLocation === loc ? colors.violet : colors.cream,
                    color: selectedLocation === loc ? '#fff' : colors.heading,
                    border: `1px solid ${selectedLocation === loc ? colors.violet : colors.stone}`,
                    cursor: 'pointer',
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photoGallery.map((photo, i) => (
              <motion.div
                key={photo.label + selectedLocation}
                className="rounded-xl overflow-hidden cursor-pointer group relative"
                style={{ aspectRatio: i === 0 || i === 3 ? '1/1' : '4/3', background: photo.gradient }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
                <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'rgba(250,248,245,0.2)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>{photo.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Your First Visit */}
      <section style={{ backgroundColor: colors.cream }}>
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
              <motion.div
                key={step.title}
                className="rounded-2xl p-6 text-center"
                style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
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

      {/* Lead Capture — Location-Specific */}
      <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
              Questions Before You Visit?
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(250,248,245,0.55)', marginBottom: '2rem', maxWidth: '28rem', margin: '0 auto 2rem' }}>
              Drop us a message and we&rsquo;ll get back to you within a few hours. Or just call — we pick up.
            </p>
            <div className="flex flex-col gap-3 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Your name"
                  className="flex-1 rounded-full px-5 py-3.5 outline-none"
                  style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: colors.white }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 rounded-full px-5 py-3.5 outline-none"
                  style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: colors.white }}
                />
              </div>
              <select
                className="rounded-full px-5 py-3.5 outline-none appearance-none"
                style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: 'rgba(250,248,245,0.5)' }}
              >
                <option value="">Preferred Location</option>
                <option value="westfield">Westfield</option>
                <option value="carmel">Carmel</option>
              </select>
              <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                Send Message
              </button>
            </div>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.25)', marginTop: '1rem' }}>Or call us directly: (317) 399-4578</p>
          </motion.div>
        </div>
      </section>

      {/* Why Hamilton County */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Serving Hamilton County &amp; Beyond</p>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '1rem' }}>
              Luxury Aesthetics, Close to Home
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body, maxWidth: '32rem', margin: '0 auto', marginBottom: '2.5rem' }}>
              Whether you&rsquo;re coming from Noblesville, Fishers, Zionsville, or downtown Indianapolis — we&rsquo;re worth the drive. But if you&rsquo;re in Westfield or Carmel, we&rsquo;re basically in your backyard.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Westfield', 'Carmel', 'Fishers', 'Noblesville', 'Zionsville', 'Indianapolis', 'Brownsburg', 'Avon'].map((city) => (
                <span key={city} className="rounded-full px-4 py-2" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.heading, backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>{city}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Neighborhood / Things Nearby */}
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
              <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                Book Your Visit
              </button>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Grand Junction Plaza', type: 'Outdoor Events', location: 'Westfield' },
                { name: 'Midtown Carmel', type: 'Shopping & Dining', location: 'Carmel' },
                { name: 'Indie Coffee Roasters', type: 'Coffee', location: 'Carmel' },
                { name: 'The Bridgewater Club', type: 'Dining', location: 'Westfield' },
              ].map((spot, i) => (
                <motion.div
                  key={spot.name}
                  className="rounded-xl p-5"
                  style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
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

      {/* CTA */}
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Ready to Visit?</h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Pick your location and book online in 60 seconds.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', backgroundColor: '#fff', color: colors.ink, border: 'none', cursor: 'pointer' }}>Book Westfield</button>
            <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>Book Carmel</button>
          </div>
        </div>
      </section>
    </>
  );
}

export default function LocationsPageWrapper() {
  return (
    <PreviewLayout title="Locations">
      {({ fontKey, fonts }) => <LocationsPage fontKey={fontKey} fonts={fonts} />}
    </PreviewLayout>
  );
}

LocationsPageWrapper.getLayout = (page) => page;
