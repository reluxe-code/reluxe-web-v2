import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { getServiceClient } from '@/lib/supabase';
import GravityBookButton from '@/components/beta/GravityBookButton';
import ScarcityBadge from '@/components/booking/ScarcityBadge';

/* ─── grain texture ─── */
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ─── data ─── */
const featuredServices = [
  { name: 'Tox', tagline: 'Botox, Jeuveau, Dysport & Daxxify.', href: '/beta/services/tox', badge: 'Most Popular', size: 'large', gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)' },
  { name: 'Dermal Fillers', tagline: 'Cheeks. Lips. Jawline. Yes, all of it.', href: '/beta/services/filler', badge: 'Instant Results', size: 'standard', gradient: 'linear-gradient(135deg, #C026D3, #9333EA)' },
  { name: 'Morpheus8', tagline: 'Skin tightening that actually works.', href: '/beta/services/morpheus8', badge: '#1 Skin Remodel', size: 'standard', gradient: 'linear-gradient(135deg, #E11D73, #C026D3)' },
  { name: 'Laser Hair Removal', tagline: 'Razor? Don\u2019t know her.', href: '/beta/services/laser-hair-removal', badge: 'Lose the Razor', size: 'standard', gradient: 'linear-gradient(135deg, #5B21B6, #1E1B4B)' },
  { name: 'Lasers & Skin', tagline: 'IPL, ClearLift, CO\u2082 \u2014 pick your weapon.', href: '/beta/services/lasers', badge: 'Advanced Tech', size: 'standard', gradient: 'linear-gradient(135deg, #9333EA, #7C3AED)' },
  { name: 'Facials & Peels', tagline: 'Because great skin isn\u2019t luck. It\u2019s us.', href: '/beta/services/facials', badge: 'Fan Favorite', size: 'large', gradient: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)' },
];

const processSteps = [
  { number: '01', title: 'Book Your Consult', description: 'Tell us your goals \u2014 we\u2019ll match you with the right provider and build a custom plan. Takes 2 minutes online.', detail: 'Free for all first-time patients. Zero commitment.', gradient: `linear-gradient(135deg, ${colors.violet}, ${colors.fuchsia})` },
  { number: '02', title: 'Get Your Game Plan', description: 'Your provider walks you through options, pricing, and what to expect. We answer every question until you feel 100%.', detail: 'Transparent pricing. No hidden fees. Ever.', gradient: `linear-gradient(135deg, ${colors.fuchsia}, ${colors.rose})` },
  { number: '03', title: 'Treatment Day', description: 'Relax in our luxury suite while our experts work their magic. Most treatments take under an hour.', detail: 'Private suites. Premium products. Good vibes only.', gradient: `linear-gradient(135deg, ${colors.rose}, ${colors.violet})` },
  { number: '04', title: 'Glow Up Complete', description: 'Walk out feeling confident. We follow up to make sure you\u2019re absolutely loving your results.', detail: 'We\u2019ll be with you long after you leave.', gradient: `linear-gradient(135deg, ${colors.violet}, #5B21B6)` },
];

// Heights / offsets for the staggered cutout layout
const cutoutStyles = [
  { height: 420, offset: 40 },
  { height: 480, offset: 0 },
  { height: 400, offset: 60 },
  { height: 450, offset: 20 },
  { height: 430, offset: 50 },
  { height: 460, offset: 10 },
  { height: 410, offset: 45 },
  { height: 390, offset: 70 },
];

const locations = [
  { name: 'Westfield', tagline: 'The Original', vibe: 'Where it all started. Full treatment menu, salt room, infrared sauna, and the team that built RELUXE from the ground up.', address: '514 E State Road 32', city: 'Westfield, IN 46074', phone: '(317) 763-1142', hours: 'Mon\u2013Fri 9am\u20137pm \u00b7 Sat 9am\u20134pm', amenities: ['Salt Room', 'Infrared Sauna', 'Full Treatment Menu', 'Free Parking'], gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6, #1E1B4B)' },
  { name: 'Carmel', tagline: 'The Expansion', vibe: 'Same obsessive standards. New energy. Partnered with House of Health for a next-level wellness experience.', address: '10485 N Pennsylvania St', city: 'Carmel, IN 46280', phone: '(317) 763-1142', hours: 'Mon\u2013Fri 9am\u20137pm \u00b7 Sat 9am\u20134pm', amenities: ['House of Health Partnership', 'IV Therapy', 'Full Treatment Menu', 'Free Parking'], gradient: 'linear-gradient(135deg, #C026D3, #9333EA, #5B21B6)' },
];

const trustBadges = [
  { icon: 'star', title: '300+ Reviews', subtitle: '5.0 Star Average' },
  { icon: 'heart', title: 'Family Owned', subtitle: 'Locally Operated' },
  { icon: 'calendar', title: 'Established 2023', subtitle: 'Hamilton County\u2019s Newest' },
  { icon: 'map', title: '2 Locations', subtitle: 'Hamilton County' },
];

const treatmentBrands = ['Botox', 'Jeuveau', 'Dysport', 'Daxxify', 'Morpheus8', 'Sculptra', 'Restylane', 'Juvederm', 'RHA', 'EvolveX', 'SkinPen'];
const skincareBrands = ['SkinBetter Science', 'Colorescience', 'Rhonda Allison', 'SkinCeuticals', 'Hydrenity', 'Universkin'];

const memberPerks = ['15% off all treatments', 'Priority booking', 'Monthly treatment credit', 'Exclusive member events'];

const financeServices = [
  { label: '30 Units of Jeuveau', price: 360 },
  { label: 'Dermal Filler (1 syringe)', price: 650 },
  { label: 'Morpheus8 Package (3)', price: 3000 },
  { label: 'Unlimited Laser Hair', price: 2500 },
];

const CHERRY_APPLY_URL = 'https://pay.withcherry.com/reluxe-med-spa';

/* Cherry calculator helpers */
function monthlyPayment(principal, apr, months) {
  const r = apr / 12;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}
function currencyWhole(n) { return isNaN(n) ? '$0' : n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); }
function computePlans(amount) {
  const a = Number(amount || 0);
  const p6 = a / 4;
  const p12 = monthlyPayment(a, 0.1599, 12);
  const p24 = monthlyPayment(a, 0.1999, 24);
  return [
    { label: '6 Weeks', apr: '0%', recurring: `4 payments of ${currencyWhole(p6)}` },
    { label: '12 Months', apr: '15.99%', recurring: `${currencyWhole(p12)}/mo` },
    { label: '24 Months', apr: '19.99%', recurring: `${currencyWhole(p24)}/mo` },
  ];
}

const faqs = [
  { q: 'What should I expect at my first visit?', a: 'Your first appointment starts with a one-on-one consultation with your provider. We\u2019ll discuss your goals, review your options, and build a personalized plan \u2014 no pressure, no hard sell. Most first-time treatments can happen the same day if you\u2019re ready.' },
  { q: 'How do I know which treatment is right for me?', a: 'That\u2019s what your consult is for. Our providers are experts at matching your goals with the right treatments. Whether you want subtle refinement or a full glow-up, we\u2019ll walk you through every option with transparent pricing.' },
  { q: 'Does it hurt? What\u2019s the downtime?', a: 'Most treatments involve minimal discomfort \u2014 we use numbing cream and other comfort measures. Downtime varies: Botox and fillers have virtually zero downtime, while treatments like Morpheus8 may need 2\u20133 days of mild redness.' },
  { q: 'How much does treatment cost?', a: 'Pricing depends on the treatment and your custom plan. Botox starts at $10/unit, fillers start at $650/syringe, and our VIP Membership saves you 15% on everything. We\u2019ll always give you exact pricing before any work is done.' },
  { q: 'Do you offer financing?', a: 'Yes! We offer flexible financing through CareCredit and Cherry, with plans starting at 0% APR. Our patient coordinators can help you find a payment option that works for your budget.' },
  { q: 'What makes RELUXE different from other med spas?', a: 'We\u2019re not a volume mill. Every provider is rigorously trained, our Medical Director oversees every treatment plan, and we use only premium, FDA-approved products. Plus our two luxury locations are designed so you actually enjoy being here.' },
];

/* ─── sub-components ─── */

function ProviderCutout({ member, fonts, index, scrollProgress, totalCount }) {
  const style = cutoutStyles[index % cutoutStyles.length];
  const yOffset = useTransform(scrollProgress, [0, 0.3, 0.7, 1], [200 + style.offset, style.offset * 0.3, 0, 0]);
  const opacity = useTransform(scrollProgress, [0, 0.15 + index * 0.04, 0.3 + index * 0.04, 1], [0, 0, 1, 1]);
  const bubbleOpacity = useTransform(scrollProgress, [0, 0.35 + index * 0.05, 0.5 + index * 0.05, 1], [0, 0, 1, 1]);
  const bubbleScale = useTransform(scrollProgress, [0, 0.35 + index * 0.05, 0.5 + index * 0.05, 1], [0.7, 0.7, 1, 1]);
  const gradientColors = [`linear-gradient(180deg, ${colors.violet}30, ${colors.violet}08)`, `linear-gradient(180deg, ${colors.fuchsia}25, ${colors.fuchsia}06)`, `linear-gradient(180deg, ${colors.rose}22, ${colors.rose}05)`, `linear-gradient(180deg, ${colors.violet}20, ${colors.fuchsia}08)`];
  const bubbleSide = index % 2 === 0 ? 'right' : 'left';
  const hasImage = member.transparent_bg || member.featured_image;

  return (
    <motion.div className="relative flex flex-col items-center" style={{ y: yOffset, opacity, zIndex: totalCount - Math.abs(index - Math.floor(totalCount / 2)) }}>
      {member.fun_fact && (
        <motion.div className="absolute rounded-2xl px-4 py-3" style={{ opacity: bubbleOpacity, scale: bubbleScale, [bubbleSide]: '-10px', top: -16, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', maxWidth: 180, zIndex: 20, transformOrigin: bubbleSide === 'right' ? 'bottom left' : 'bottom right' }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.heading, lineHeight: 1.4, fontStyle: 'italic' }}>&ldquo;{member.fun_fact}&rdquo;</p>
        </motion.div>
      )}
      <a href={`/beta/team/${member.slug}`} className="block" style={{ textDecoration: 'none' }}>
        <div className="relative rounded-t-3xl overflow-hidden" style={{ width: 'clamp(100px, 12vw, 160px)', height: style.height, background: gradientColors[index % 4] }}>
          {hasImage ? (
            <img
              src={member.transparent_bg || member.featured_image}
              alt={member.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(250,248,245,0.12)', marginBottom: 4, flexShrink: 0 }} />
              <div style={{ width: '85%', height: 80, borderRadius: '50% 50% 0 0', background: 'rgba(250,248,245,0.08)', flexShrink: 0 }} />
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none', opacity: hasImage ? 0.03 : 1 }} />
          <div className="absolute bottom-0 left-0 right-0" style={{ height: 60, background: `linear-gradient(to top, ${colors.cream}, transparent)` }} />
        </div>
        <div className="text-center mt-3">
          <p style={{ fontFamily: fonts.display, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>{member.name}</p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.violet, fontWeight: 500 }}>{member.title || member.role}</p>
        </div>
      </a>
    </motion.div>
  );
}

function AccordionItem({ faq, isOpen, onToggle, fonts, index }) {
  return (
    <motion.div className="border-b" style={{ borderColor: colors.stone }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.06 }}>
      <button className="w-full text-left py-6 flex items-center justify-between gap-4" style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} onClick={onToggle}>
        <span style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: isOpen ? colors.violet : colors.heading, transition: 'color 0.2s' }}>{faq.q}</span>
        <motion.span style={{ fontSize: '1.25rem', color: colors.muted, flexShrink: 0, display: 'block', width: 24, height: 24, lineHeight: '24px', textAlign: 'center' }} animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
            <p className="pb-6" style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body, maxWidth: '48rem', paddingRight: '2rem' }}>{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CherryCalculator({ fonts }) {
  const [serviceIdx, setServiceIdx] = useState(0);
  const [amount, setAmount] = useState(String(financeServices[0].price));
  const plans = useMemo(() => computePlans(Number(amount || 0)), [amount]);
  const lowestMonthly = useMemo(() => {
    const p24 = monthlyPayment(Number(amount || 0), 0.1999, 24);
    return currencyWhole(p24);
  }, [amount]);

  return (
    <div className="p-8 lg:p-10 flex flex-col h-full">
      <span className="inline-block rounded-full px-3 py-1.5 mb-4 self-start" style={{ background: `${colors.violet}10`, fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Flexible Financing</span>
      <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>0% APR Available</h3>
      <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, lineHeight: 1.5, marginBottom: '1.25rem' }}>See what your treatment could cost per month with Cherry.</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Service</span>
          <select className="w-full rounded-lg px-3 py-2.5 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.875rem', backgroundColor: '#fff', border: `1px solid ${colors.stone}`, color: colors.heading }} value={serviceIdx} onChange={(e) => { const idx = Number(e.target.value); setServiceIdx(idx); setAmount(String(financeServices[idx].price)); }}>
            {financeServices.map((s, i) => <option key={s.label} value={i}>{s.label} — {currencyWhole(s.price)}</option>)}
          </select>
        </label>
        <label className="block relative">
          <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Or enter amount</span>
          <span className="absolute left-3 top-[28px] pointer-events-none" style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>$</span>
          <input type="text" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} className="w-full rounded-lg pl-7 pr-3 py-2.5 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.875rem', backgroundColor: '#fff', border: `1px solid ${colors.stone}`, color: colors.heading }} />
        </label>
      </div>

      <div className="rounded-lg px-4 py-3 mb-3" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>As low as</p>
        <p style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: colors.heading }}>{lowestMonthly} <span style={{ fontSize: '1rem', fontWeight: 500, color: colors.muted }}>/ month</span></p>
      </div>

      <div className="rounded-lg overflow-hidden mb-4" style={{ border: `1px solid ${colors.stone}` }}>
        {plans.map((plan, i) => (
          <div key={plan.label} className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: i % 2 === 0 ? '#fff' : colors.cream, borderBottom: i < 2 ? `1px solid ${colors.stone}` : 'none' }}>
            <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>{plan.label}</span>
            <div className="text-right">
              <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>{plan.recurring}</span>
              <span className="ml-2" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>({plan.apr} APR)</span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted, lineHeight: 1.4, marginBottom: '1rem' }}>Example only. Your terms and APR may vary. Applying has no impact on your credit score.</p>

      <div className="flex gap-3 mt-auto">
        <a href={CHERRY_APPLY_URL} target="_blank" rel="noopener noreferrer" className="rounded-full flex-1 text-center" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 1.5rem', background: gradients.primary, color: '#fff', border: 'none', textDecoration: 'none', display: 'block' }}>Apply Now</a>
        <a href={CHERRY_APPLY_URL} target="_blank" rel="noopener noreferrer" className="rounded-full flex-1 text-center" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 1.5rem', backgroundColor: '#fff', color: colors.heading, border: `1px solid ${colors.stone}`, textDecoration: 'none', display: 'block' }}>Check Your Rate</a>
      </div>
    </div>
  );
}

/* ─── page ─── */

export default function BetaHome({ testimonials, staff }) {
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const teamRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: teamRef, offset: ['start end', 'end start'] });

  return (
    <BetaLayout title="Luxury Med Spa in Westfield & Carmel, IN" description="RELUXE Med Spa — luxury aesthetics done right. Botox, fillers, laser, facials, and more. Two locations in Westfield & Carmel, Indiana.">
      {({ fontKey, fonts }) => (
        <>
          {/* ─── HERO: Split Layout ─── */}
          <section className="relative min-h-screen flex items-center" style={{ backgroundColor: colors.ink }}>
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-24 lg:py-0">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}>
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1.5rem' }}>Westfield &amp; Carmel, Indiana</p>
                  <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 1.05, color: colors.white, marginBottom: '1.5rem' }}>
                    Your Skin.{' '}
                    <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Elevated.</span>
                  </h1>
                  <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.7, color: 'rgba(250,248,245,0.6)', maxWidth: '28rem', marginBottom: '2.5rem' }}>
                    Premium aesthetics without the pretension. Expert providers, luxury spaces, and treatments that actually deliver. Welcome to RELUXE.
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <GravityBookButton fontKey={fontKey} size="hero" />
                    <a href="/beta/services" className="rounded-full flex items-center gap-2" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', color: 'rgba(250,248,245,0.7)', border: '1.5px solid rgba(250,248,245,0.2)', textDecoration: 'none' }}>Explore Services</a>
                  </div>
                  <div className="flex flex-wrap gap-6 mt-12">
                    {['300+ 5-Star Reviews', 'Locally Owned', 'Family Owned'].map((badge) => (
                      <span key={badge} style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: 'rgba(250,248,245,0.35)', letterSpacing: '0.05em' }}>{badge}</span>
                    ))}
                  </div>
                </motion.div>

                <motion.div className="relative" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
                  <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '4/5', background: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}15, ${colors.rose}10)` }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
                    <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'rgba(250,248,245,0.15)' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 rounded-2xl p-5" style={{ background: 'rgba(26,26,26,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(250,248,245,0.08)' }}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: 'rgba(124,58,237,0.2)', flexShrink: 0 }}>
                          <span style={{ fontSize: '1rem' }}>&#11088;</span>
                        </div>
                        <div>
                          <p style={{ fontFamily: fonts.display, fontSize: '0.9375rem', fontWeight: 600, color: colors.white }}>5.0 out of 5.0 Stars on Google</p>
                          <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)' }}>Based on 300+ verified reviews</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ─── Trust Badges ─── */}
          <section style={{ backgroundColor: colors.ink }}>
            <div className="max-w-6xl mx-auto px-6 py-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {trustBadges.map((badge, i) => (
                  <motion.div key={badge.title} className="flex items-center gap-3 rounded-xl px-5 py-4" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.06)' }} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                    <div className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: 'rgba(124,58,237,0.15)' }}>
                      {badge.icon === 'star' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>}
                      {badge.icon === 'heart' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
                      {badge.icon === 'calendar' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                      {badge.icon === 'map' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                    </div>
                    <div>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>{badge.title}</p>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.45)' }}>{badge.subtitle}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── Open Today Banner ─── */}
          <section style={{ backgroundColor: colors.ink, borderTop: '1px solid rgba(250,248,245,0.04)' }}>
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Open Today</span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(250,248,245,0.6)' }}>Westfield</span>
                    <ScarcityBadge locationKey="westfield" variant="inline" fonts={fonts} />
                  </div>
                  <span style={{ color: 'rgba(250,248,245,0.15)' }}>|</span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(250,248,245,0.6)' }}>Carmel</span>
                    <ScarcityBadge locationKey="carmel" variant="inline" fonts={fonts} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Scrolling Brands ─── */}
          <section style={{ backgroundColor: colors.ink, borderTop: '1px solid rgba(250,248,245,0.04)', paddingBottom: '2.5rem' }}>
            <div className="max-w-6xl mx-auto px-6">
              <p className="text-center mb-6" style={{ fontFamily: fonts.body, ...typeScale.label, color: 'rgba(250,248,245,0.25)' }}>Trusted Partners &amp; Products</p>
            </div>
            <div style={{ overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to right, ${colors.ink}, transparent)`, zIndex: 2, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to left, ${colors.ink}, transparent)`, zIndex: 2, pointerEvents: 'none' }} />
              <motion.div className="flex items-center gap-12 whitespace-nowrap" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, ease: 'linear', repeat: Infinity }}>
                {[...treatmentBrands, ...skincareBrands, ...treatmentBrands, ...skincareBrands].map((brand, i) => (
                  <span key={`${brand}-${i}`} style={{ fontFamily: fonts.display, fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', fontWeight: 500, color: 'rgba(250,248,245,0.2)', letterSpacing: '0.02em', flexShrink: 0 }}>{brand}</span>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ─── Pick Your Power Move ─── */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <p className="mb-4" style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet }}>What We Do Best</p>
                <h2 className="mb-4" style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Pick Your Power Move</h2>
                <p className="max-w-xl mx-auto" style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body }}>Every treatment is tailored to you — your skin, your goals, your timeline. No cookie-cutter plans.</p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredServices.map((svc) => (
                  <motion.a key={svc.name} href={svc.href} className={`group relative rounded-2xl overflow-hidden cursor-pointer block ${svc.size === 'large' ? 'lg:col-span-2' : ''}`} style={{ minHeight: svc.size === 'large' ? 280 : 260, textDecoration: 'none' }} whileHover={{ y: -4 }}>
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ background: svc.gradient }} />
                    <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: grain.replace('0.04', '1'), backgroundSize: '128px 128px' }} />
                    <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-60" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)', opacity: 0.5 }} />
                    <div className="relative z-10 h-full flex flex-col justify-between p-6 lg:p-8" style={{ minHeight: svc.size === 'large' ? 280 : 260 }}>
                      <div className="flex justify-end">
                        {svc.badge && <span className="inline-block rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{svc.badge}</span>}
                      </div>
                      <div>
                        <h3 className="mb-1" style={{ fontFamily: fonts.display, fontSize: svc.size === 'large' ? 'clamp(1.5rem, 3vw, 2.25rem)' : '1.375rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{svc.name}</h3>
                        <p className="mb-3" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{svc.tagline}</p>
                        <span className="inline-flex items-center gap-2 transition-all duration-200 group-hover:gap-3" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
                          Explore
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="transition-transform duration-200 group-hover:translate-x-1"><path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
              <motion.div className="text-center mt-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
                <a href="/beta/services" className="inline-flex items-center justify-center rounded-full" style={{ background: gradients.primary, color: '#fff', padding: '0.875rem 2.5rem', fontSize: '1rem', fontFamily: fonts.body, fontWeight: 600, textDecoration: 'none', border: 'none' }}>View All Treatments</a>
              </motion.div>
            </div>
          </section>

          {/* ─── Our Story ─── */}
          <section style={{ backgroundColor: colors.cream, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '50%', height: '140%', background: `linear-gradient(180deg, ${colors.violet}06, ${colors.fuchsia}04, transparent)`, borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                {/* Left: Editorial text */}
                <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                  <p className="mb-4" style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet }}>Our Story</p>
                  <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.08, color: colors.heading, marginBottom: '1.5rem' }}>
                    Built by Family.<br />
                    <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Driven by Results.</span>
                  </h2>
                  <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.7, color: colors.body, marginBottom: '1.25rem' }}>
                    RELUXE started with a simple idea: what if a med spa actually put you first? Not upsells. Not volume. Not a corporate playbook. Just expert providers, honest advice, and results you can see.
                  </p>
                  <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.7, color: colors.body, marginBottom: '2rem' }}>
                    We opened in Westfield in 2023 and expanded to Carmel because the demand was real &mdash; people were tired of cookie-cutter clinics. We&rsquo;re family-founded, locally owned, and our name is on every decision we make. That changes everything.
                  </p>

                  {/* Philosophy pills */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {[
                      { left: 'Results', right: 'Deals', symbol: '>' },
                      { left: 'Trust', right: 'Margin', symbol: '>' },
                      { left: 'Education', right: 'Pressure', symbol: '>' },
                    ].map((pill) => (
                      <span key={pill.left} className="inline-flex items-center gap-2 rounded-full px-4 py-2" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.heading }}>
                        <span style={{ fontWeight: 700 }}>{pill.left}</span>
                        <span style={{ color: colors.violet, fontWeight: 700 }}>{pill.symbol}</span>
                        <span style={{ color: colors.muted }}>{pill.right}</span>
                      </span>
                    ))}
                  </div>

                  <a href="/beta/about" className="inline-flex items-center gap-2 group" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.violet, textDecoration: 'none' }}>
                    The Full RELUXE Story
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="transition-transform duration-200 group-hover:translate-x-1"><path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>
                </motion.div>

                {/* Right: Value cards stack */}
                <motion.div className="space-y-4" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
                  {[
                    { title: 'Personal', body: 'We recommend what\u2019s right for you \u2014 not everything we offer. Your plan is built around your goals, your skin, your timeline.', icon: 'user' },
                    { title: 'Honest', body: 'Transparent pricing, straight talk, no pressure. We\u2019d rather earn your trust than \u201Cwin\u201D your booking.', icon: 'check' },
                    { title: 'Elevated', body: 'World-class devices, advanced techniques, luxury spaces \u2014 and providers who actually care about the outcome.', icon: 'sparkle' },
                  ].map((card, i) => (
                    <motion.div key={card.title} className="rounded-2xl p-6 lg:p-8" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, boxShadow: '0 2px 16px rgba(0,0,0,0.03)' }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: `${colors.violet}10` }}>
                          {card.icon === 'user' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                          {card.icon === 'check' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                          {card.icon === 'sparkle' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>}
                        </div>
                        <div>
                          <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading, marginBottom: '0.375rem' }}>{card.title}</h3>
                          <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.6, color: colors.body }}>{card.body}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Founder callout */}
                  <motion.div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: gradients.primary }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
                    <div className="relative z-10">
                      <p style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, fontStyle: 'italic', color: '#fff', lineHeight: 1.5, marginBottom: '0.75rem' }}>&ldquo;We built RELUXE for people who want real results &mdash; not a participation trophy.&rdquo;</p>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>The RELUXE Team</p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ─── Process Steps (Interactive) ─── */}
          <section style={{ backgroundColor: colors.ink, position: 'relative', overflow: 'hidden' }}>
            <motion.div style={{ position: 'absolute', width: '40%', height: '60%', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none', opacity: 0.08 }} animate={{ background: processSteps[activeStep].gradient, top: `${20 + activeStep * 10}%`, left: `${10 + activeStep * 20}%` }} transition={{ duration: 0.8 }} />
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 relative">
              <motion.div className="text-center mb-16 lg:mb-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>How It Works</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white }}>Four Steps to Your Best Self</h2>
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                <div className="lg:col-span-5">
                  <div className="relative">
                    <div className="absolute left-[19px] top-0 bottom-0 hidden lg:block" style={{ width: 2, background: 'rgba(250,248,245,0.06)' }} />
                    <motion.div className="absolute left-[19px] hidden lg:block" style={{ width: 2, background: gradients.primary, top: 0 }} animate={{ height: `${((activeStep + 1) / processSteps.length) * 100}%` }} transition={{ duration: 0.5 }} />
                    <div className="space-y-2">
                      {processSteps.map((step, i) => (
                        <motion.button key={step.number} className="w-full text-left flex items-start gap-5 rounded-xl px-4 py-5" style={{ backgroundColor: activeStep === i ? 'rgba(250,248,245,0.04)' : 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }} onClick={() => setActiveStep(i)} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                          <div className="flex-shrink-0 flex items-center justify-center rounded-full relative z-10 transition-all duration-300" style={{ width: 40, height: 40, background: activeStep === i ? gradients.primary : 'rgba(250,248,245,0.06)', border: activeStep === i ? 'none' : '1px solid rgba(250,248,245,0.08)' }}>
                            <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 700, color: activeStep === i ? '#fff' : 'rgba(250,248,245,0.3)' }}>{step.number}</span>
                          </div>
                          <div>
                            <h3 className="transition-colors duration-300" style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: activeStep === i ? colors.white : 'rgba(250,248,245,0.4)', marginBottom: '0.25rem' }}>{step.title}</h3>
                            <p className="transition-colors duration-300" style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: activeStep === i ? 'rgba(250,248,245,0.5)' : 'rgba(250,248,245,0.2)', lineHeight: 1.5 }}>{step.description}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-7 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeStep} className="relative w-full rounded-3xl overflow-hidden" style={{ minHeight: 380, background: processSteps[activeStep].gradient }} initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.97 }} transition={{ duration: 0.4 }}>
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
                      <div className="absolute top-6 right-8" style={{ fontFamily: fonts.display, fontSize: 'clamp(6rem, 12vw, 10rem)', fontWeight: 800, lineHeight: 1, color: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}>{processSteps[activeStep].number}</div>
                      <div className="relative z-10 flex flex-col justify-end h-full p-8 lg:p-10" style={{ minHeight: 380 }}>
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
                          <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem', lineHeight: 1.15 }}>{processSteps[activeStep].title}</h3>
                          <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', maxWidth: '28rem', marginBottom: '1.5rem' }}>{processSteps[activeStep].description}</p>
                          <div className="inline-block rounded-full px-5 py-2.5" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>{processSteps[activeStep].detail}</span>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Meet the Team ─── */}
          <section ref={teamRef} style={{ backgroundColor: colors.cream, position: 'relative', overflow: 'hidden' }}>
            <div className="max-w-7xl mx-auto px-6 pt-24 lg:pt-32 pb-8">
              <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Meet the Team</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.75rem' }}>The People Behind the Glow</h2>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body, maxWidth: '28rem', margin: '0 auto' }}>Expert providers across two locations — here are some of the faces you&rsquo;ll see.</p>
              </motion.div>
              <div className="flex items-end justify-center gap-3 sm:gap-4 lg:gap-6" style={{ minHeight: 520, paddingTop: 60 }}>
                {staff.map((member, i) => (
                  <ProviderCutout key={member.slug || member.name} member={member} fonts={fonts} index={i} scrollProgress={scrollYProgress} totalCount={staff.length} />
                ))}
              </div>
              <motion.div className="text-center mt-8 pb-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
                <a href="/beta/team" className="rounded-full inline-flex items-center" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.violet, border: `1.5px solid ${colors.violet}`, padding: '0.625rem 1.75rem', textDecoration: 'none' }}>Meet All Providers &rarr;</a>
              </motion.div>
            </div>
          </section>

          {/* ─── Membership + Financing ─── */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* VIP Membership */}
                <motion.div className="rounded-2xl overflow-hidden relative" style={{ background: gradients.primary, minHeight: 340 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
                  <div className="relative z-10 p-8 lg:p-10 flex flex-col justify-between h-full" style={{ minHeight: 340 }}>
                    <div>
                      <span className="inline-block rounded-full px-3 py-1.5 mb-4" style={{ background: 'rgba(255,255,255,0.15)', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>VIP Membership</span>
                      <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>Save 15% on Everything</h3>
                      <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: '22rem', marginBottom: '1.5rem' }}>Monthly treatments, exclusive perks, priority booking, and member-only pricing starting at $99/month.</p>
                      <ul className="space-y-2 mb-6">
                        {memberPerks.map((perk) => (
                          <li key={perk} className="flex items-center gap-2.5">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.2)"/><path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <a href="/beta/memberships" className="rounded-full self-start" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', backgroundColor: '#fff', color: colors.ink, border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>Learn About Membership</a>
                  </div>
                </motion.div>

                {/* Cherry Financing Calculator */}
                <motion.div className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <CherryCalculator fonts={fonts} />
                </motion.div>
              </div>
            </div>
          </section>

          {/* ─── Two Locations. One Standard. ─── */}
          <section style={{ backgroundColor: colors.ink }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <p className="mb-4" style={{ fontFamily: fonts.body, ...typeScale.label, color: 'rgba(250,248,245,0.4)' }}>Two Locations. One Standard.</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white, marginBottom: '1rem' }}>Come Find Us</h2>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: 'rgba(250,248,245,0.45)', maxWidth: '28rem', margin: '0 auto' }}>Two luxury locations in the heart of Hamilton County. Same obsessive standards at both.</p>
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {locations.map((loc, i) => (
                  <motion.div key={loc.name} className="group relative rounded-2xl overflow-hidden" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}>
                    <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]" style={{ background: loc.gradient }} />
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: grain.replace('0.04', '1'), backgroundSize: '128px 128px' }} />
                    <div className="relative z-10 flex flex-col justify-between p-8 lg:p-10" style={{ minHeight: 520 }}>
                      <div>
                        <span className="inline-block rounded-full px-4 py-1.5 mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>{loc.tagline}</span>
                        <h3 className="mb-4" style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.05 }}>{loc.name}</h3>
                        <p className="max-w-sm mb-6" style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{loc.vibe}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {loc.amenities.map((a) => (
                            <span key={a} className="rounded-full px-3 py-1" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>{a}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="rounded-xl p-5 mb-5" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>Address</p>
                              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{loc.address}<br />{loc.city}</p>
                            </div>
                            <div>
                              <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>Phone</p>
                              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{loc.phone}</p>
                            </div>
                            <div>
                              <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>Hours</p>
                              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{loc.hours}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <a href={`/book/${loc.name.toLowerCase()}`} className="inline-flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', padding: '0.625rem 1.75rem', fontSize: '0.875rem', fontFamily: fonts.body, fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', textDecoration: 'none' }}>Book Here</a>
                          <a href={`https://maps.google.com/?q=${encodeURIComponent(loc.address + ', ' + loc.city)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full" style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', padding: '0.625rem 1.75rem', fontSize: '0.875rem', fontFamily: fonts.body, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', textDecoration: 'none' }}>Get Directions</a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── Testimonials (Supabase) ─── */}
          {testimonials?.length > 0 && (
            <section style={{ backgroundColor: '#fff' }}>
              <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
                <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                  <p className="mb-4" style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet }}>Don&apos;t Take Our Word for It</p>
                  <h2 className="mb-4" style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Our Patients Said It Best</h2>
                  <p className="max-w-md mx-auto" style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body }}>300+ five-star reviews. Zero bought. Here&apos;s what the real ones have to say.</p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {testimonials.slice(0, 6).map((t, i) => (
                    <motion.div key={t.id} className="rounded-2xl p-6 lg:p-8 relative" style={{ backgroundColor: colors.cream, borderLeft: `3px solid ${colors.violet}` }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                      <div className="flex gap-0.5 mb-5">
                        {[...Array(t.rating || 5)].map((_, j) => (
                          <svg key={j} width="16" height="16" viewBox="0 0 16 16" fill={colors.violet}><path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7L8 1z" /></svg>
                        ))}
                      </div>
                      <p className="mb-6" style={{ fontFamily: fonts.body, fontSize: '1rem', color: colors.body, lineHeight: 1.625 }}>&ldquo;{t.quote.length > 220 ? t.quote.slice(0, 220) + '...' : t.quote}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.stone, color: colors.muted, fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500 }}>{t.author_name?.charAt(0) || '?'}</div>
                        <div>
                          <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>{t.author_name?.includes(' ') ? t.author_name.split(' ')[0] + ' ' + t.author_name.split(' ').pop()[0] + '.' : t.author_name}</p>
                          {t.service && <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>{t.service}{t.location ? ` \u00b7 ${t.location}` : ''}</p>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.div className="text-center mt-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>5.0 stars across 300+ reviews on Google</p>
                </motion.div>
              </div>
            </section>
          )}

          {/* ─── FAQ Accordion ─── */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-4xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Common Questions</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Got Questions? We Got You.</h2>
              </motion.div>
              <div className="border-t" style={{ borderColor: colors.stone }}>
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} faq={faq} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} fonts={fonts} index={i} />
                ))}
              </div>
              <motion.div className="text-center mt-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.muted, marginBottom: '1rem' }}>Still have questions?</p>
                <a href="/beta/contact" className="rounded-full inline-flex items-center" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.violet, border: `1.5px solid ${colors.violet}`, padding: '0.625rem 1.75rem', textDecoration: 'none' }}>Contact Us &rarr;</a>
              </motion.div>
            </div>
          </section>

          {/* ─── Lead Capture ─── */}
          <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-24 lg:py-32 text-center relative">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6" style={{ background: `${colors.violet}15`, border: `1px solid ${colors.violet}30` }}>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Free Resource</span>
                </div>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>Get Your Treatment Guide</h2>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '28rem', margin: '0 auto 2rem' }}>Not sure where to start? We&rsquo;ll send you a personalized guide based on your goals &mdash; totally free.</p>

                <div className="max-w-md mx-auto rounded-2xl p-6 lg:p-8" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)' }}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="text" placeholder="First name" className="rounded-xl px-4 py-3 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.08)', color: colors.white }} />
                    <input type="text" placeholder="Last name" className="rounded-xl px-4 py-3 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.08)', color: colors.white }} />
                  </div>
                  <input type="email" placeholder="Email address" className="w-full rounded-xl px-4 py-3 outline-none mb-3" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.08)', color: colors.white }} />
                  <input type="tel" placeholder="Phone number" className="w-full rounded-xl px-4 py-3 outline-none mb-3" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.08)', color: colors.white }} />
                  <select className="w-full rounded-xl px-4 py-3 outline-none mb-4 appearance-none" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.08)', color: 'rgba(250,248,245,0.45)' }}>
                    <option value="">Preferred location</option>
                    <option value="westfield">Westfield</option>
                    <option value="carmel">Carmel</option>
                  </select>
                  <button className="w-full rounded-xl py-3.5" style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>Send My Free Guide</button>
                  <p className="mt-3" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.3)' }}>By submitting, you agree to receive text messages. Msg &amp; data rates may apply.</p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ─── Newsletter ─── */}
          <section style={{ backgroundColor: colors.cream }}>
            <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center">
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Stay in the Know</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.75rem' }}>Deals, Tips &amp; New Arrivals</h2>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body, maxWidth: '28rem', margin: '0 auto 2rem' }}>Be the first to know about new patient offers, seasonal deals, and skincare tips from our team.</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input type="email" placeholder="your@email.com" className="flex-1 rounded-full px-5 py-3.5 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: '#fff', border: `1px solid ${colors.stone}`, color: colors.heading }} />
                  <button className="rounded-full flex-shrink-0" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>Subscribe</button>
                </div>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted, marginTop: '0.75rem' }}>No spam. Unsubscribe anytime.</p>
              </motion.div>
            </div>
          </section>

          {/* ─── Bottom CTA ─── */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Ready to Feel Like the Best Version of You?</h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book a free consultation. No pressure, just expert advice.</p>
              <div className="flex justify-center">
                <GravityBookButton fontKey={fontKey} size="hero" />
              </div>
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  );
}

export async function getStaticProps() {
  let testimonials = [];
  let staff = [];
  try {
    const sb = getServiceClient();
    const [testimonialsRes, staffRes] = await Promise.all([
      sb
        .from('testimonials')
        .select('id, author_name, quote, rating, service, location, provider')
        .eq('status', 'published')
        .eq('featured', true)
        .order('rating', { ascending: false })
        .limit(6),
      sb
        .from('staff')
        .select('id, slug, name, title, role, featured_image, transparent_bg, fun_fact, locations, specialties')
        .eq('status', 'published')
        .order('sort_order')
        .order('name')
        .limit(8),
    ]);
    testimonials = testimonialsRes.data || [];
    staff = staffRes.data || [];
  } catch (e) {
    console.warn('Beta homepage: could not fetch data', e.message);
  }

  return {
    props: { testimonials, staff },
    revalidate: 3600,
  };
}

BetaHome.getLayout = (page) => page;
