import { motion } from 'framer-motion';
import { colors, gradients, fontPairings, typeScale } from '../tokens';

const locations = [
  {
    name: 'Westfield',
    tagline: 'The Original',
    vibe: 'Where it all started. Full treatment menu, salt room, infrared sauna, and the team that built RELUXE from the ground up.',
    address: '14767 Greyhound Plaza',
    city: 'Westfield, IN 46074',
    phone: '(317) 399-4578',
    hours: 'Mon–Fri 9am–7pm · Sat 9am–4pm',
    amenities: ['Salt Room', 'Infrared Sauna', 'Full Treatment Menu', 'Free Parking'],
    gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6, #1E1B4B)',
  },
  {
    name: 'Carmel',
    tagline: 'The Expansion',
    vibe: 'Same obsessive standards. New energy. Partnered with House of Health for a next-level wellness experience.',
    address: '370 E Carmel Dr',
    city: 'Carmel, IN 46032',
    phone: '(317) 399-4578',
    hours: 'Mon–Fri 9am–7pm · Sat 9am–4pm',
    amenities: ['House of Health Partnership', 'IV Therapy', 'Full Treatment Menu', 'Free Parking'],
    gradient: 'linear-gradient(135deg, #C026D3, #9333EA, #5B21B6)',
  },
];

export default function LocationsEditorial({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section style={{ backgroundColor: colors.ink }}>
      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="mb-4"
            style={{ fontFamily: fonts.body, ...typeScale.label, color: 'rgba(250,248,245,0.4)' }}
          >
            Two Locations. One Standard.
          </p>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.white,
              marginBottom: '1rem',
            }}
          >
            Come Find Us
          </h2>
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.body.size,
              color: 'rgba(250,248,245,0.45)',
              maxWidth: '28rem',
              margin: '0 auto',
            }}
          >
            Two luxury locations in the heart of Hamilton County. Same obsessive standards at both.
          </p>
        </motion.div>

        {/* Location cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.name}
              className="group relative rounded-2xl overflow-hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              {/* Background gradient — swap for facility photos */}
              <div
                className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                style={{ background: loc.gradient }}
              />

              {/* Grain texture */}
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  backgroundSize: '128px 128px',
                }}
              />

              {/* Content overlay */}
              <div className="relative z-10 flex flex-col justify-between p-8 lg:p-10" style={{ minHeight: 520 }}>
                {/* Top */}
                <div>
                  <span
                    className="inline-block rounded-full px-4 py-1.5 mb-6"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(8px)',
                      fontFamily: fonts.body,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {loc.tagline}
                  </span>

                  <h3
                    className="mb-4"
                    style={{
                      fontFamily: fonts.display,
                      fontSize: 'clamp(2rem, 4vw, 3rem)',
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1.05,
                    }}
                  >
                    {loc.name}
                  </h3>

                  <p
                    className="max-w-sm mb-6"
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '1rem',
                      color: 'rgba(255,255,255,0.7)',
                      lineHeight: 1.6,
                    }}
                  >
                    {loc.vibe}
                  </p>

                  {/* Amenity tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {loc.amenities.map((a) => (
                      <span
                        key={a}
                        className="rounded-full px-3 py-1"
                        style={{
                          fontFamily: fonts.body,
                          fontSize: '0.6875rem',
                          fontWeight: 500,
                          color: 'rgba(255,255,255,0.7)',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom — Contact info + CTAs */}
                <div>
                  {/* Info row */}
                  <div
                    className="rounded-xl p-5 mb-5"
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p
                          style={{
                            fontFamily: fonts.body,
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'rgba(255,255,255,0.35)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Address
                        </p>
                        <p
                          style={{
                            fontFamily: fonts.body,
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.85)',
                            lineHeight: 1.4,
                          }}
                        >
                          {loc.address}<br />{loc.city}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: fonts.body,
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'rgba(255,255,255,0.35)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Phone
                        </p>
                        <p
                          style={{
                            fontFamily: fonts.body,
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.85)',
                          }}
                        >
                          {loc.phone}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: fonts.body,
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'rgba(255,255,255,0.35)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Hours
                        </p>
                        <p
                          style={{
                            fontFamily: fonts.body,
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.85)',
                          }}
                        >
                          {loc.hours}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="inline-flex items-center justify-center rounded-full font-medium transition-shadow duration-200 hover:shadow-[0_0_24px_rgba(255,255,255,0.15)]"
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                        padding: '0.625rem 1.75rem',
                        fontSize: '0.875rem',
                        fontFamily: fonts.body,
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                      }}
                    >
                      Book Here
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200"
                      style={{
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.7)',
                        padding: '0.625rem 1.75rem',
                        fontSize: '0.875rem',
                        fontFamily: fonts.body,
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                      }}
                    >
                      Get Directions
                    </button>
                    <span
                      className="inline-flex items-center gap-2 self-center transition-all duration-200 group-hover:gap-3"
                      style={{
                        fontFamily: fonts.body,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      Tour This Location
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
