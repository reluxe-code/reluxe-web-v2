import { colors, gradients, fontPairings } from '../tokens';

const fonts = fontPairings.bold;

const sampleServices = [
  { name: 'Botox & Tox', desc: 'Smooth fine lines and wrinkles with precision neurotoxin treatments.', image: '/images/treatments/tox-hero.jpg' },
  { name: 'Dermal Fillers', desc: 'Restore volume and contour with premium hyaluronic acid fillers.', image: '/images/treatments/filler-hero.jpg' },
  { name: 'Laser Hair Removal', desc: 'Effortless, lasting smoothness with advanced laser technology.', image: '/images/treatments/lhr-hero.jpg' },
];

const sampleTestimonials = [
  { quote: 'The team at RELUXE made me feel so comfortable. My results are incredible — natural and exactly what I wanted.', name: 'Sarah M.', service: 'Botox', rating: 5 },
  { quote: 'I\'ve been to several med spas and RELUXE is hands down the best. The attention to detail is unmatched.', name: 'Jessica K.', service: 'Morpheus8', rating: 5 },
];

function ServiceCard({ service }) {
  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ backgroundColor: '#fff', border: `1px solid ${colors.taupe}40` }}
    >
      {/* Image placeholder */}
      <div className="aspect-[4/3] overflow-hidden" style={{ backgroundColor: colors.stone }}>
        <div
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${colors.stone}, ${colors.taupe})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: colors.muted, fontFamily: fonts.body, fontSize: '0.8125rem' }}>
            Treatment Image
          </span>
        </div>
      </div>

      <div className="p-6">
        <p
          className="mb-1"
          style={{
            fontFamily: fonts.body,
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: colors.violet,
          }}
        >
          Treatment
        </p>
        <h3
          className="mb-2"
          style={{
            fontFamily: fonts.display,
            fontSize: '1.5rem',
            fontWeight: 500,
            color: colors.heading,
            lineHeight: 1.2,
          }}
        >
          {service.name}
        </h3>
        <p
          className="mb-4"
          style={{
            fontFamily: fonts.body,
            fontSize: '0.9375rem',
            color: colors.body,
            lineHeight: 1.6,
          }}
        >
          {service.desc}
        </p>
        <span
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 group-hover:text-lux-fuchsia"
          style={{ color: colors.violet, fontFamily: fonts.body }}
        >
          Learn More
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <div
      className="rounded-2xl p-6 lg:p-8 relative"
      style={{
        backgroundColor: '#fff',
        borderLeft: `3px solid ${colors.violet}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill={colors.violet}>
            <path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7L8 1z" />
          </svg>
        ))}
      </div>

      <p
        className="mb-4"
        style={{
          fontFamily: fonts.body,
          fontSize: '1rem',
          color: colors.body,
          lineHeight: 1.625,
          fontStyle: 'italic',
        }}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        {/* Avatar placeholder */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
          style={{ backgroundColor: colors.stone, color: colors.muted, fontFamily: fonts.body }}
        >
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: colors.heading, fontFamily: fonts.body }}>
            {testimonial.name}
          </p>
          <p className="text-xs" style={{ color: colors.muted, fontFamily: fonts.body }}>
            {testimonial.service}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CardShowcase() {
  return (
    <div className="space-y-12">
      {/* Service Cards */}
      <div>
        <p className="mb-6" style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.muted, fontFamily: fonts.body }}>
          Service Cards
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleServices.map((s) => (
            <ServiceCard key={s.name} service={s} />
          ))}
        </div>
      </div>

      {/* Testimonial Cards */}
      <div>
        <p className="mb-6" style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.muted, fontFamily: fonts.body }}>
          Testimonial Cards
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleTestimonials.map((t) => (
            <TestimonialCard key={t.name} testimonial={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
