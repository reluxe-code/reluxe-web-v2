// src/pages/services/[slug].js
// ✅ Plain JS with modern visual variants + auto "Book Now" CTAs every 3 blocks.
// - Uses your stack: HeaderTwo, Tailwind, Framer Motion, heroicons, ReactCompareSlider
// - Defensive SSG (filters invalid slugs)
// - Variants controlled via s.variants.<block> in service data
// - Auto CTAs rotate 4 designs and interleave after every 3 content blocks
// - Updated: all mid-page visuals use s.images.* (no hero reuse)
// - NEW: side visuals auto-alternate left/right and cycle through styles

import { useMemo, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeaderTwo from '@/components/header/header-2';
import { motion } from 'framer-motion';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import {
  ClockIcon, FireIcon, SparklesIcon, UserIcon, CheckCircleIcon, PlayCircleIcon,
} from '@heroicons/react/24/outline';
import Script from 'next/script';

import { getServicesList } from '@/data/servicesList';
// src/pages/services/[slug].js  (add the import near the top)
import ServiceSEO from '@/components/seo/ServiceSEO'


const ICON_MAP = { clock: ClockIcon, fire: FireIcon, sparkles: SparklesIcon, user: UserIcon, check: CheckCircleIcon };

// ---------------- SSG (defensive) ----------------
export async function getStaticPaths() {
  let services = [];
  try { services = await getServicesList(); } catch { services = []; }
  const paths = (Array.isArray(services) ? services : [])
    .map(s => (s && typeof s.slug === 'string' ? s.slug.trim() : ''))
    .filter(Boolean)
    .map(slug => ({ params: { slug } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  if (!slug) return { notFound: true, };

  let service = null;

  // 1) Try to load a per-slug data file first (e.g. /data/services/botox.js)
  try {
    const mod = await import(`@/data/services/${slug}.js`);
    service = mod?.default || null;
  } catch (e) {
    // no per-slug file — continue to fallbacks
  }

  // 2) Fallback to your list resolver
  if (!service) {
    let services = [];
    try {
      const { getServicesList } = await import('@/data/servicesList');
      services = await getServicesList();
    } catch {
      services = [];
    }
    service = (Array.isArray(services) ? services : []).find(s => s?.slug === slug) || null;
  }

  // 3) Final fallback to hard defaults
  if (!service) {
    try {
      const { getDefaultService } = await import('@/data/servicesDefault');
      service = getDefaultService(slug);
    } catch {
      service = null;
    }
  }

  if (!service) return { notFound: true, };
  return { props: { service }, };
}


// ---------------- Defaults & helpers ----------------
const DEFAULT_BLOCK_PRIORITIES = {
  hero: 10,
  quickFacts: 20,
  //benefits: 30,
  overviewWhy: 30,
  resultsGrid: 35,     // 👈 add this
  beforeAfter: 40,
  howItWorks: 50,
  testimonials: 55,
  candidates: 60,
  process: 70,
  pricing: 80,
  financing: 90,
  comparison: 95,
  video: 100,
  faq: 110,
  providerSpotlight: 130,
  relatedServices: 140,
  prepAftercare: 150,
  flexEverything: 160,
  lasers: 170,
  bookingEmbed: 180,
};

// small animation helpers
const fadeUp = (i = 0) => ({
  initial: { y: 16, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true, margin: '-20% 0px' },
  transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.05 },
});

// get variant name (fallback provided)
const v = (s, key, fallback) => s?.variants?.[key] || fallback;

// ----- Auto CTA config -----
const CTA_FREQUENCY = 3; // insert a CTA after every 3 content blocks
const CTA_SKIP_KEYS = ['hero']; // never insert before these
const CTA_AVOID_NEAR = ['bookingEmbed']; // avoid immediate adjacency to these
const getBookingHref = (s) => s.bookingLink || `/book/${s.slug || ''}`;
const getConsultHref = (s) => s.consultLink || '/book/consult';


// ---------- NEW: side image alternation + style cycler ----------
const SIDE_IMG_STYLES = [
  { wrap: 'relative h-56 md:h-full rounded-2xl overflow-hidden border shadow-sm', img: 'object-cover' },                 // rounded
  { wrap: 'relative aspect-square max-h-64 md:max-h-none rounded-full overflow-hidden border-4 border-white shadow-xl', img: 'object-cover' }, // circle
  { wrap: 'relative h-56 md:h-full rounded-[30px] overflow-hidden ring-1 ring-black/10 shadow-md', img: 'object-cover' }, // squircle
  { wrap: 'relative h-56 md:h-full overflow-hidden rounded-2xl shadow-xl -rotate-2', img: 'object-cover scale-[1.03]' },   // tilt
  { wrap: 'relative h-56 md:h-full overflow-hidden rounded-2xl border-4 border-neutral-200 shadow-sm', img: 'object-cover' }, // framed
  { wrap: 'relative h-56 md:h-full overflow-hidden rounded-3xl drop-shadow-2xl', img: 'object-cover' },                   // soft shadow
];

function useSideImageChooser() {
  const countRef = useRef(0);
  const styleRef = useRef(0);
  return () => {
    const index = countRef.current++;
    const side = index % 2 === 0 ? 'right' : 'left'; // alternate each time a side image appears
    const style = SIDE_IMG_STYLES[styleRef.current % SIDE_IMG_STYLES.length];
    styleRef.current++;
    return { side, style };
  };
}

// 4 CTA visual variants (cycle through these)
function CtaVariant({ variant = 'black', s }) {
  const href = getBookingHref(s);
  if (variant === 'black') {
    return (
      <section className="py-16 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">Ready for {s.name}?</h2>
          <p className="mt-2 text-white/80">Fast, friendly, and personalized care.</p>
          <a href={href} className="inline-block mt-6 bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition">
            Book Now
          </a>
        </div>
      </section>
    );
  }
  if (variant === 'split') {
    const img =
      s.images?.ctaBanner ||
      s.images?.secondaryCallout ||
      s.gallery?.[1]?.src ||
      s.heroImage ||
      '/images/page-banner/skincare-header.png';
    return (
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center px-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">Treat yourself—{s.name} awaits</h3>
            <p className="text-neutral-700 mt-2">Small changes, big confidence.</p>
            <a href={href} className="inline-block mt-5 bg-reluxe-primary text-white px-6 py-3 rounded-full hover:opacity-90 transition">
              Book {s.name}
            </a>
          </div>
          <div className="relative h-56 md:h-72 rounded-3xl overflow-hidden shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="cta visual" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>
    );
  }
  if (variant === 'quote') {
    return (
      <section className="py-14 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <blockquote className="text-xl md:text-2xl text-neutral-900 font-medium">“The whole visit was so easy—and I loved my results.”</blockquote>
          <div className="mt-2 text-sm text-neutral-500">Verified patient</div>
          <a href={href} className="inline-block mt-6 bg-neutral-900 text-white px-6 py-3 rounded-full hover:bg-neutral-800 transition">
            Book your appointment
          </a>
        </div>
      </section>
    );
  }
  // variant === 'stats'
  return (
    <section className="py-10 bg-gradient-to-r from-reluxe-primary to-reluxe-secondary text-white bg-black">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="grid grid-cols-3 gap-6 text-center w-full md:w-auto">
          <div>
            <div className="text-3xl font-extrabold">4.9★</div>
            <div className="text-sm opacity-90">Avg rating on Google</div>
          </div>
        <div>
            <div className="text-3xl font-extrabold">1 in 4</div>
            <div className="text-sm opacity-90">Patients from Referral </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold">2 Years</div>
            <div className="text-sm opacity-90">Serving Hamilton County</div>
          </div>
        </div>
        <a href={href} className="inline-block bg-white text-neutral-900 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition">
          Book Now
        </a>
      </div>
    </section>
  );
}
const CTA_VARIANT_ORDER = ['black', 'split', 'quote', 'stats'];
const getCtaVariantForIndex = (i) => CTA_VARIANT_ORDER[i % CTA_VARIANT_ORDER.length];
function interleaveCTAs(ordered, s) {
  if (s?.autoCTA === false) return ordered; // per-service kill switch
  const keys = ordered.map(b => b.key);
  const result = [];
  let contentCountSinceCTA = 0;
  let ctaCount = 0;

  for (let idx = 0; idx < ordered.length; idx++) {
    const block = ordered[idx];
    const nextKey = keys[idx + 1] || null;

    result.push(block);

    if (CTA_SKIP_KEYS.includes(block.key)) {
      contentCountSinceCTA = 0;
      continue;
    }

    contentCountSinceCTA++;

    if (contentCountSinceCTA >= CTA_FREQUENCY) {
      if (CTA_AVOID_NEAR.includes(block.key) || CTA_AVOID_NEAR.includes(nextKey)) {
        continue; // delay if neighbor is in avoid list
      }
      const variant = getCtaVariantForIndex(ctaCount);
      const ctaKey = `autoCta-${ctaCount}-${variant}`;
      result.push({
        key: ctaKey,
        enabled: true,
        render: () => <CtaVariant variant={variant} s={s} />,
      });
      ctaCount++;
      contentCountSinceCTA = 0;
    }
  }
  return result;
}

// ---------------- Page ----------------
export default function ServicePage({ service }) {
  const [lightbox, setLightbox] = useState(null);
  const chooseSideImage = useSideImageChooser(); // NEW

  const s = service ?? {};
  const pricingSingle = s.pricing?.single || '';
  const basePrice = parseFloat(pricingSingle.replace(/[^0-9.]/g, '')) || 0;

  // tox services multiply by 50 (check slug; allow partials like "botox-cosmetic")
  const toxSlugs = ['botox', 'dysport', 'daxxify', 'jeuveau'];
  const slug = String(s.slug || '').toLowerCase();
  const isTox = toxSlugs.some(t => slug.includes(t));

  const effectivePrice = isTox ? basePrice * 50 : basePrice;

  const fourPay = (effectivePrice / 4).toFixed(2);
  // 24 months with 20% interest
  const mo24 = ((effectivePrice * 1.2) / 24).toFixed(2);


  // ✅ Normalize hero image(s) to an array
  const heroImages = Array.isArray(s.heroImage)
    ? s.heroImage
    : s.heroImage
      ? [s.heroImage]
      : [];

  // ✅ Pick one at random, fallback to gallery or default
  const heroImg =
    heroImages.length > 0
      ? heroImages[Math.floor(Math.random() * heroImages.length)]
      : (s.gallery?.[0]?.src || '/images/page-banner/skincare-header.png');

  // ✅ Results gallery (1–6 square images, each already a combined Before/After)
  const results = Array.isArray(s.resultsGallery) ? s.resultsGallery.slice(0, 6) : [];
  //const beforeAfter = Array.isArray(s.beforeAfter) ? s.beforeAfter : [];
  const packages = Array.isArray(s.pricing?.packages) ? s.pricing.packages : [];
  const quickFacts = Array.isArray(s.quickFacts) ? s.quickFacts : [];
  //const benefits = Array.isArray(s.benefits) ? s.benefits : [];
  const appointmentSteps = Array.isArray(s.appointmentSteps) ? s.appointmentSteps : [];
  const candidates = s.candidates || null;
  const prepAftercare = s.prepAftercare || null;
  const faq = Array.isArray(s.faq) ? s.faq : [];
  const testimonials = Array.isArray(s.testimonials) ? s.testimonials : [];
  const providers = Array.isArray(s.providers) ? s.providers : [];
  const relatedServices = Array.isArray(s.relatedServices) ? s.relatedServices : [];
  const lasers = Array.isArray(s.lasers) ? s.lasers : [];
  const comparison = s.comparison || null;
  const videoUrl = s.videoUrl || '';
  const bookingEmbedHtml = s.bookingEmbedHtml || '';

  // ---------------- Blocks w/ variants ----------------
  const blocks = useMemo(() => {
    const list = [];

    // Hero variants: 'classic' | 'split' | 'collage' | 'video'
    list.push({
      key: 'hero',
      enabled: true,
      render: () => {
        const variant = v(s, 'hero', s.heroVideoUrl ? 'video' : 'classic');

        if (variant === 'split') {
          return (
            <section className="relative bg-white">
              <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center px-4 py-10">
                <motion.div {...fadeUp()} className="bg-white/70 backdrop-blur rounded-3xl border p-8 shadow-sm">
                  <h1 className="text-4xl md:text-5xl font-extrabold">{s.name || 'Service'}</h1>
                  {s.tagline && <p className="mt-3 text-neutral-600">{s.tagline}</p>}
                  <div className="mt-6 flex gap-3">
                    <Link href={s.bookingLink || `/book/${s.slug}`} className="inline-flex items-center gap-2 bg-reluxe-primary text-black font-semibold py-2.5 px-6 rounded-full shadow hover:opacity-90 transition">Book Now</Link>
                    <Link href={s.consultLink || `/book/consult`} className="inline-flex items-center gap-2 bg-neutral-900 text-white font-semibold py-2.5 px-6 rounded-full shadow hover:opacity-90 transition">Free Consult</Link>
                  </div>
                </motion.div>
                <motion.div {...fadeUp(0.1)} className="relative w-full aspect-square overflow-hidden rounded-3xl shadow-xl">
                  <Image src={heroImg} alt={s.name || 'Service'} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
                </motion.div>
              </div>
            </section>
          );
        }

        if (variant === 'collage') {
          const sideA = s.gallery?.[1]?.src || heroImg;
          const sideB = s.gallery?.[2]?.src || heroImg;
          return (
            <header className="relative">
              <div className="max-w-6xl mx-auto grid md:grid-cols-[2fr,1fr] gap-4 items-stretch px-4 py-10">
                <div className="relative h-72 md:h-[420px] rounded-3xl overflow-hidden shadow-xl">
                  <Image src={heroImg} alt={s.name || 'Service'} fill className="object-cover" priority />
                </div>
                <div className="grid grid-rows-2 gap-4">
                  <div className="relative h-32 md:h-full rounded-2xl overflow-hidden shadow">
                    <Image src={sideA} alt="detail A" fill className="object-cover" />
                  </div>
                  <div className="relative h-32 md:h-full rounded-2xl overflow-hidden shadow">
                    <Image src={sideB} alt="detail B" fill className="object-cover" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-x-0 top-6 flex justify-center px-4">
                <div className="max-w-3xl w-full bg-white/80 backdrop-blur border rounded-full shadow px-6 py-3">
                  <h1 className="text-xl md:text-2xl font-bold text-center">{s.name}</h1>
                  {s.tagline && <p className="text-center text-sm text-neutral-600">{s.tagline}</p>}
                </div>
              </div>
            </header>
          );
        }

        if (variant === 'video' && s.heroVideoUrl) {
          return (
            <header className="relative h-[56vw] max-h-[520px]">
              <div className="absolute inset-0 overflow-hidden rounded-none md:rounded-b-3xl">
                <iframe
                  src={`${s.heroVideoUrl}?autoplay=1&mute=1&playsinline=1&loop=1&controls=0&rel=0`}
                  title={s.name || 'Hero video'}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture; web-share"
                />
              </div>
              <div className="absolute inset-0 bg-black/35 flex flex-col justify-center items-center text-center px-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow">{s.name || 'Service'}</h1>
                {s.tagline && <p className="mt-2 text-white/90 max-w-xl">{s.tagline}</p>}
                <div className="mt-4">
                  <Link href={s.bookingLink || `/book/${s.slug}`} className="inline-flex items-center gap-2 bg-white text-neutral-900 font-semibold py-2.5 px-6 rounded-full shadow hover:bg-gray-100 transition">Book Now</Link>
                </div>
              </div>
            </header>
          );
        }

        // classic
        return (
          <header className="relative h-72 md:h-[360px] bg-cover bg-center" style={{ backgroundImage: `url('${heroImg}')` }}>
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center px-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow">{s.name || 'Service'}</h1>
              {s.tagline && <p className="mt-3 text-base md:text-lg text-gray-200 max-w-2xl">{s.tagline}</p>}
              <div className="mt-6 flex gap-3">
                <Link href={s.bookingLink || `/book/${s.slug}`} className="inline-flex items-center gap-2 bg-white text-neutral-900 font-semibold py-2 px-5 rounded-full shadow hover:bg-gray-100 transition">Book Now</Link>
                <Link href={s.consultLink || `/book/consult`} className="inline-flex items-center gap-2 bg-reluxe-primary text-white font-semibold py-2 px-5 rounded-full shadow hover:opacity-90 transition">Free Consult</Link>
              </div>
            </div>
          </header>
        );
      },
    });

    // Quick Facts variants: 'cards' | 'pills' | 'stickers'
    if (quickFacts.length) {
      list.push({
        key: 'quickFacts',
        enabled: true,
        render: () => {
          const variant = v(s, 'quickFacts', 'pills');
          if (variant === 'pills') {
            return (
              <section className="py-10 bg-gray-50">
                <div className="max-w-6xl mx-auto flex flex-wrap gap-3 px-4">
                  {quickFacts.map(({ iconKey, label, value }, i) => {
                    const Icon = ICON_MAP[iconKey] || SparklesIcon;
                    return (
                      <motion.div key={i} {...fadeUp(i)} className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm">
                        <Icon className="w-4 h-4 text-black" />
                        <span className="text-xs font-medium tracking-wide uppercase text-neutral-500">{label}</span>
                        <span className="text-sm font-semibold">{value}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          }
          if (variant === 'stickers') {
            return (
              <section className="py-12 bg-white">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                  {quickFacts.map(({ iconKey, label, value }, i) => {
                    const Icon = ICON_MAP[iconKey] || SparklesIcon;
                    return (
                      <motion.div key={i} {...fadeUp(i)} className="relative bg-gradient-to-br from-white to-neutral-50 p-5 rounded-2xl border shadow-sm overflow-hidden">
                        <div className="absolute -top-3 -right-3 rotate-12 bg-reluxe-primary text-white text-xs px-3 py-1 rounded-full">Info</div>
                        <div className="bg-reluxe-primary/90 text-white p-3 rounded-full mb-3 w-max">
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                        <p className="mt-1 text-lg font-semibold">{value}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          }
          // cards (default)
          return (
            <section className="py-14 bg-gray-50">
              <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-4 place-items-center">
                {quickFacts.map(({ iconKey, label, value }, i) => {
                  const Icon = ICON_MAP[iconKey] || SparklesIcon;
                  return (
                    <motion.div
                      key={i}
                      {...fadeUp(i)}
                      className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col items-center text-center"
                    >
                      <div className="bg-reluxe-primary/90 text-white p-3 rounded-full mb-3">
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                      <p className="mt-1 text-lg font-semibold">{value}</p>
                    </motion.div>
                  );
                })}
              </div>
            </section>

          );
        },
      });
    }

    // --- Overview + Why Choose RELUXE ---
if ((s.overview?.p1 || s.overview?.p2) || Array.isArray(s.whyReluxe)) {
  list.push({
    key: 'overviewWhy',
    enabled: true,
    render: () => {
      const sideImg =
        s.images?.overviewVisual ||
        s.images?.primaryCallout ||
        s.gallery?.[1]?.src ||
        null;
      const why = Array.isArray(s.whyReluxe) ? s.whyReluxe.slice(0, 6) : [];

      return (
        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-3 gap-8 items-start">
            {/* Left: overview card */}
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-3xl border shadow-sm bg-gradient-to-br from-white to-neutral-50">
                <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-reluxe-primary/10" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-reluxe-secondary/10" />
                <div className="relative p-7 md:p-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">{s.name}</h2>
                  {s.overview?.p1 && (
                    <p className="text-neutral-700 leading-relaxed">{s.overview.p1}</p>
                  )}
                  {s.overview?.p2 && (
                    <p className="text-neutral-700 leading-relaxed mt-3">{s.overview.p2}</p>
                  )}
                  <div className="mt-6">
                    <Link
                      href={s.bookingLink || `/book/${s.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white px-6 py-2.5 font-semibold hover:bg-neutral-800 transition"
                    >
                      Book {s.name} <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: side visual + why list */}
            <div className="space-y-4">
              <div className="rounded-2xl border bg-white shadow-sm p-5">
                <div className="text-sm uppercase tracking-wide text-neutral-500">
                  Why choose
                </div>
                <h3 className="text-xl font-bold mb-3">RELUXE</h3>
                <ul className="space-y-3">
                  {why.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-reluxe-primary text-black text-xs font-bold">
                        ✓
                      </span>
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        {item.body && (
                          <div className="text-sm text-neutral-700">{item.body}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      );
    },
  });
}


    // Primary Callout — dynamic side + style
    list.push({
      key: 'callout',
      enabled: true,
      render: () => {
        const img = s.images?.primaryCallout || s.images?.secondaryCallout || s.gallery?.[1]?.src || '/images/fallbacks/callout.png';
        const { side, style } = chooseSideImage();
        const Side = img ? (
          <div className={style.wrap}>
            <Image src={img} alt={s.name || 'Service image'} fill className={style.img} />
          </div>
        ) : null;

        return (
          <section className="py-10">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center px-4">
              {side === 'left' && Side}
              <div className="bg-reluxe-primary text-black p-8 md:p-12 rounded-3xl">
                <h2 className="text-3xl font-bold mb-3">Personalized Care, Just for You</h2>
                <p className="mb-6 opacity-90">Every plan is tailored to your unique needs—from consult to aftercare—ensuring optimal comfort and stunning results.</p>
                <Link href={s.bookingLink || `/book/${s.slug}`} className="inline-block bg-white text-reluxe-primary font-semibold py-2.5 px-6 rounded-full shadow hover:bg-gray-100 transition">Get Started</Link>
              </div>
              {side === 'right' && Side}
            </div>
          </section>
        );
      },
    });

    // Benefits variants: 'classic' | 'stickers' | 'compare' (optional bg)
    /*
    if (benefits.length) {
      list.push({
        key: 'benefits',
        enabled: true,
        render: () => {
          const variant = v(s, 'benefits', 'classic');
          const bgStyle = s.images?.benefitHighlight
            ? { backgroundImage: `url(${s.images.benefitHighlight})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {};
          if (variant === 'stickers') {
            return (
              <section className="py-14" style={bgStyle}>
                <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {benefits.map((b, i) => (
                    <motion.div key={i} {...fadeUp(i)} className="bg-white/90 backdrop-blur p-6 rounded-2xl border shadow-sm hover:shadow-md transition relative overflow-hidden">
                      <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-reluxe-primary/10" />
                      <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-reluxe-secondary/10" />
                      <h3 className="font-semibold relative">{b}</h3>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          }
          if (variant === 'compare') {
            return (
              <section className="py-14 bg-gray-50" style={bgStyle}>
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-4">
                  {benefits.slice(0,3).map((b, i) => (
                    <motion.div key={i} {...fadeUp(i)} className="rounded-2xl border bg-white/95 backdrop-blur p-6 shadow-sm">
                      <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Benefit {i+1}</div>
                      <div className="font-semibold">{b}</div>
                      <div className="mt-3 text-sm text-neutral-600">Why it matters: better confidence and long-term skin health.</div>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          }
          // classic
          return (
            <section className="relative py-14" style={bgStyle}>
              <div className="absolute inset-0 bg-gradient-to-tr from-reluxe-secondary to-reluxe-primary opacity-[0.06] pointer-events-none" />
              <div className="relative max-w-6xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {benefits.map((b, i) => (
                  <motion.div key={i} {...fadeUp(i)} className="bg-white/95 backdrop-blur p-6 rounded-2xl border shadow-sm hover:shadow-md transition">
                    <CheckCircleIcon className="w-6 h-6 text-reluxe-primary mb-3" />
                    <h3 className="font-semibold">{b}</h3>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        },
      });
    } */

    // RESULTS GRID (desktop: 6-up grid; mobile: 2-up slider; headline/CTA on the left)
    if (results.length) {
      list.push({
        key: 'resultsGrid',
        enabled: true,
        render: () => (
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4">
              <div className="md:grid md:grid-cols-3 md:gap-8 items-start">
                {/* LEFT: headline + CTA (always on top for mobile, left column on desktop) */}
                <div className="mb-8 md:mb-0">
                  <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-neutral-900">
                    Amazing results<br />for our amazing<br />patients.
                  </h2>
                  <Link
                    href={s.bookingLink || `/book/${s.slug}`}
                    className="inline-flex items-center gap-2 mt-6 text-lg font-semibold text-neutral-900 border-b border-neutral-900/50 hover:border-neutral-900 transition"
                  >
                    Book Now <span aria-hidden>→</span>
                  </Link>
                </div>

                {/* DESKTOP: 3 x 2 grid (hidden on mobile) */}
                <div className="hidden md:grid md:col-span-2 grid-cols-3 gap-6">
                  {results.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border shadow-sm">
                      <Image
                        src={img.src}
                        alt={img.alt || `Result ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                        priority={i < 2}
                      />
                    </div>
                  ))}
                  {/* If fewer than 6, layout still looks clean—no extra filler needed */}
                </div>

                {/* MOBILE: 2-up slider (hidden on desktop) */}
                <div className="md:hidden">
                  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4">
                    {results.map((img, i) => (
                      <div
                        key={i}
                        className="snap-start shrink-0 w-[calc(50%-0.5rem)] relative aspect-square rounded-2xl overflow-hidden border shadow-sm"
                      >
                        <Image
                          src={img.src}
                          alt={img.alt || `Result ${i + 1}`}
                          fill
                          sizes="50vw"
                          className="object-cover"
                          priority={i < 2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ),
      });
    }


    // How It Works variants: 'accordion' | 'steps' (dynamic side image)
    if (Array.isArray(s.howItWorks) && s.howItWorks.length) {
      list.push({
        key: 'howItWorks',
        enabled: true,
        render: () => {
          const variant = v(s, 'howItWorks', 'accordion');
          const sideImg = s.images?.techniqueShot || s.images?.stepByStep || null;
          const { side, style } = chooseSideImage();

          if (variant === 'steps') {
            return (
              <section className="py-14">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-4 items-start">
                  {side === 'left' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="How it works" fill className={style.img} /></div>}
                  <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-8">How it works</h2>
                    <ol className="relative border-s pl-6 space-y-6">
                      {s.howItWorks.map((step, i) => (
                        <li key={i} className="ms-6">
                          <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-reluxe-primary text-white text-xs font-bold">{i+1}</span>
                          <div className="font-semibold">{step.title || `Step ${i+1}`}</div>
                          {step.body && <p className="text-neutral-700">{step.body}</p>}
                        </li>
                      ))}
                    </ol>
                  </div>
                  {side === 'right' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="How it works" fill className={style.img} /></div>}
                </div>
              </section>
            );
          }
          // accordion
          return (
            <section className="py-14">
              <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-4 items-start">
                {side === 'left' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="Technique" fill className={style.img} /></div>}
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold mb-8">How it works</h2>
                  <div className="space-y-3">
                    {s.howItWorks.map((step, i) => (
                      <details key={i} className="bg-white rounded-2xl border p-4">
                        <summary className="cursor-pointer font-medium">{step.title || `Step ${i + 1}`}</summary>
                        {step.body && <p className="mt-2 text-neutral-700 whitespace-pre-line">{step.body}</p>}
                      </details>
                    ))}
                  </div>
                </div>
                {side === 'right' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="Technique" fill className={style.img} /></div>}
              </div>
            </section>
          );
        },
      });
    }

    // Candidates variants: 'columns' | 'badges'
    if (candidates?.good?.length || candidates?.notIdeal?.length) {
      list.push({
        key: 'candidates',
        enabled: true,
        render: () => {
          const variant = v(s, 'candidates', 'columns');
          if (variant === 'badges') {
            return (
              <section className="py-14 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                  <h2 className="text-2xl font-bold mb-6">Is it right for me?</h2>
                  <div className="flex flex-wrap gap-2">
                    {(candidates.good || []).map((x, i) => (
                      <span key={i} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 bg-green-50 border-green-200 text-green-800 text-sm">{x}</span>
                    ))}
                    {(candidates.notIdeal || []).map((x, i) => (
                      <span key={`ni-${i}`} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 bg-amber-50 border-amber-200 text-amber-800 text-sm">{x}</span>
                    ))}
                  </div>
                </div>
              </section>
            );
          }
          // columns
          return (
            <section className="py-14 bg-white">
              <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 gap-6">
                <div className="bg-neutral-50 rounded-2xl border p-6">
                  <h3 className="font-semibold mb-2">Great for</h3>
                  <ul className="list-disc ml-5 space-y-1">{(candidates.good || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
                {!!(candidates.notIdeal || []).length && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h3 className="font-semibold mb-2">Not ideal if</h3>
                    <ul className="list-disc ml-5 space-y-1">{candidates.notIdeal.map((x, i) => <li key={i}>{x}</li>)}</ul>
                  </div>
                )}
              </div>
            </section>
          );
        },
      });
    }

    // Process variants: 'timeline' | 'checklist' (dynamic side image)
    if (appointmentSteps.length) {
      list.push({
        key: 'process',
        enabled: true,
        render: () => {
          const variant = v(s, 'process', 'timeline');
          const sideImg = s.images?.stepByStep || s.images?.techniqueShot || null;
          const { side, style } = chooseSideImage();

          if (variant === 'checklist') {
            return (
              <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-4 items-start">
                  {side === 'left' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="Steps" fill className={style.img} /></div>}
                  <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold text-center md:text-left mb-8">What to Expect</h2>
                    <ul className="space-y-3">
                      {appointmentSteps.map((step, i) => (
                        <li key={i} className="flex items-center gap-3 bg-neutral-50 border rounded-xl p-4">
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {side === 'right' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="Steps" fill className={style.img} /></div>}
                </div>
              </section>
            );
          }
          // timeline
          return (
            <section className="py-16 bg-white">
              <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-4 items-start">
                {side === 'left' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="Process" fill className={style.img} /></div>}
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold text-center md:text-left mb-8">What to Expect</h2>
                  <ol className="space-y-4">
                    {appointmentSteps.map((step, i) => (
                      <li key={i} className="flex items-start space-x-3 bg-gray-50 p-4 rounded-xl border hover:bg-gray-100 transition">
                        <span className="font-bold text-reluxe-primary">{i + 1}.</span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
                {side === 'right' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="Process" fill className={style.img} /></div>}
              </div>
            </section>
          );
        },
      });
    }

    // Pricing variants: 'tiers' | 'cards' (centered + deduped)
    if (pricingSingle || packages.length > 0) {
      list.push({
        key: 'pricing',
        enabled: true,
        render: () => {
          const variant = v(s, 'pricing', 'tiers');

          // de-dupe packages by label|value
          const pkgList = Array.isArray(packages) ? packages.filter(Boolean) : [];
          const dedupedPkgs = Array.from(
            new Map(pkgList.map(p => [`${p.label}|${p.value}`, p])).values()
          );

          return (
            <section className="py-16 bg-gray-50">
              <div className="max-w-5xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">Pricing & Packages</h2>
                <p className="text-neutral-600 mb-10">
                  Transparent pricing. Member savings. Best results.
                </p>

                {variant === 'tiers' && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                      <div className="text-sm text-neutral-500">Single</div>
                      <div className="text-3xl font-bold mt-1">{pricingSingle || 'Varies'}</div>
                      <ul className="mt-3 text-sm text-neutral-600 space-y-1">
                        <li>Transparent pricing</li>
                        <li>No pressure</li>
                      </ul>
                    </div>

                    {/* render packages ONCE */}
                    {dedupedPkgs.slice(0, 2).map((pkg, i) => (
                      <div
                        key={`${pkg.label}-${i}`}
                        className={`rounded-2xl border bg-white p-6 shadow-sm ${
                          i === 0 ? 'ring-2 ring-reluxe-primary' : ''
                        }`}
                      >
                        <div className="text-sm text-neutral-500">{pkg.label}</div>
                        <div className="text-3xl font-bold mt-1">{pkg.value}</div>
                        <ul className="mt-3 text-sm text-neutral-600 space-y-1">
                          <li>Member savings</li>
                          <li>Best results</li>
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {variant === 'cards' && (
                  <div className="flex flex-wrap justify-center gap-4">
                    {dedupedPkgs.map((pkg, i) => (
                      <div
                        key={`${pkg.label}-${i}`}
                        className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition w-full sm:w-64"
                      >
                        <h4 className="font-semibold">{pkg.label}</h4>
                        <p className="mt-1">{pkg.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        },
      });
    }



    // Financing (dynamic side image)
    if (basePrice > 0) {
      list.push({
        key: 'financing',
        enabled: true,
        render: () => {
          const sideImg = s.images?.financingVisual || null;
          const { side, style } = chooseSideImage();

          return (
            <section className="py-12 bg-white">
              <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 items-stretch px-4">
                {side === 'left' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="Financing" fill className={style.img} /></div>}
                <div className="md:col-span-2">
                  <div className="w-full py-6 bg-gradient-to-r from-reluxe-primary to-reluxe-secondary text-white text-center rounded-2xl mb-6">
                    <p className="text-lg font-semibold">Flexible financing — 4-pay or up to 24 months.</p>
                  </div>
                  <div className="space-y-4 rounded-2xl border p-6">
                    <h3 className="text-xl font-bold">Financing w/Cherry Example</h3>
                    <p>Based on an example treatment cost of <strong>${effectivePrice}</strong>:</p>
                    <ul className="list-disc list-inside space-y-1 ml-6">
                      <li><strong>4 payments</strong> of <strong>${fourPay}</strong> each (0% APR)</li>
                      <li><strong>24 monthly payments</strong> of <strong>${mo24}</strong> (19.99% APR)</li>
                    </ul>
                    <a href="https://pay.withcherry.com/reluxe-med-spa" target="_blank" rel="noreferrer" class="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 font-medium shadow">Apply with no impact to credit</a>
                  </div>
                </div>
                {side === 'right' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="Financing" fill className={style.img} /></div>}
              </div>
            </section>
          );
        },
      });
    }

    // Comparison variants: 'table' | 'cards'
    if (comparison?.columns?.length && comparison?.rows?.length) {
      list.push({
        key: 'comparison',
        enabled: true,
        render: () => {
          const variant = v(s, 'comparison', 'table');
          if (variant === 'cards') {
            const cols = comparison.columns;
            const rows = comparison.rows;
            const perCol = cols.map((c, idx) => ({
              name: c,
              metrics: rows.map(r => ({ label: r.label, value: r.options[idx]?.value || '-' })),
            }));
            return (
              <section className="py-14">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {perCol.map((col, i) => (
                    <div key={i} className="rounded-2xl border p-6 bg-white shadow-sm">
                      <div className="text-lg font-semibold mb-2">{col.name}</div>
                      <ul className="text-sm space-y-1">
                        {col.metrics.map((m, j) => <li key={j}><span className="text-neutral-500">{m.label}:</span> {m.value}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            );
          }
          // table
          return (
            <section className="py-14">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-bold mb-4">Compare your options</h2>
                <div className="overflow-auto rounded-2xl border">
                  <table className="min-w-[640px] w-full text-left">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-3" />
                        {comparison.columns.map((c, i) => <th key={i} className="px-4 py-3 font-medium">{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.rows.map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-3 font-medium">{r.label}</td>
                          {r.options.map((o, j) => (
                            <td key={j} className="px-4 py-3">{o.value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          );
        },
      });
    }

    // Video variants: 'cine' | 'split' (dynamic extra image when split)
    if (videoUrl) {
      list.push({
        key: 'video',
        enabled: true,
        render: () => {
          const variant = v(s, 'video', 'cine');
          if (variant === 'split') {
            const sideImg = s.images?.techniqueShot || s.images?.secondaryCallout || null;
            const { side, style } = chooseSideImage();
            return (
              <section className="py-14">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 px-4 items-center">
                  {side === 'left' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="Technique" fill className={style.img} /></div>}
                  <div className="aspect-video rounded-2xl overflow-hidden border shadow">
                    <iframe src={videoUrl} title={s.name || 'Service video'} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                  </div>
                  {side === 'right' && sideImg && <div className={style.wrap}><Image src={sideImg} alt="Technique" fill className={style.img} /></div>}
                </div>
              </section>
            );
          }
          // cine
          return (
            <section className="py-14">
              <div className="max-w-5xl mx-auto px-4">
                <div className="aspect-video w-full overflow-hidden rounded-2xl border shadow-sm">
                  <iframe src={videoUrl} title={s.name || 'Service video'} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                </div>
                <p className="flex items-center gap-2 text-sm text-neutral-600 mt-2"><PlayCircleIcon className="w-4 h-4" /> Watch how it works</p>
              </div>
            </section>
          );
        },
      });
    }

    // FAQ variants: 'accordion' | 'top5'
    if (faq.length) {
      list.push({
        key: 'faq',
        enabled: true,
        render: () => {
          const variant = v(s, 'faq', 'accordion');
          if (variant === 'top5') {
            const top = faq.slice(0,6);
            return (
              <section className="py-14">
                <div className="max-w-5xl mx-auto px-4">
                  <h2 className="text-2xl font-bold mb-6">Top questions about {s.name}</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {top.map((f, i) => (
                      <div key={i} className="rounded-2xl border p-5 bg-white shadow-sm">
                        <div className="font-semibold">{f.q}</div>
                        <p className="text-neutral-700 mt-1">{f.a}</p>
                      </div>
                    ))}
                  </div>
                  {faq.length > 5 && (
                    <div className="mt-4">
                      <details className="rounded-2xl border p-5 bg-neutral-50">
                        <summary className="font-medium cursor-pointer">More {s.name} FAQs</summary>
                        <div className="mt-3 space-y-3">
                          {faq.slice(5).map((f, i) => (
                            <div key={i} className="rounded-xl border bg-white p-4">
                              <div className="font-semibold">{f.q}</div>
                              <p className="text-neutral-700 mt-1">{f.a}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </section>
            );
          }
          // accordion
          return (
            <section className="py-14">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">FAQs</h2>
                <div className="space-y-3">
                  {faq.map((f, i) => (
                    <details key={i} className="bg-white border rounded-2xl p-4">
                      <summary className="font-medium cursor-pointer">{f.q}</summary>
                      <p className="mt-2 text-neutral-700 whitespace-pre-line">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          );
        },
      });
    }

    // Testimonials (slider: 3 desktop / 1 mobile)
    if (testimonials.length) {
      list.push({
        key: 'testimonials',
        enabled: true,
        render: () => {
          const bgStyle = s.images?.testimonialBg
            ? { backgroundImage: `url(${s.images.testimonialBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {};

          const scrollerId = `testimonials-scroller-${s.slug || 'svc'}`;

          const fmtMonthYear = (iso) => {
            // expects "YYYY-MM" or full ISO; falls back gracefully
            try {
              const d = iso?.length === 7 ? new Date(`${iso}-01`) : new Date(iso);
              return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            } catch { return ''; }
          };

          const Star = ({ filled }) => (
            <svg viewBox="0 0 20 20" className={`w-4 h-4 ${filled ? 'fill-amber-400' : 'fill-neutral-300'}`} aria-hidden="true">
              <path d="M10 15.27 15.18 18l-1.64-5.03L18 9.24l-5.19-.03L10 4 7.19 9.21 2 9.24l4.46 3.73L4.82 18z"/>
            </svg>
          );

          const scrollByCards = (dir = 1) => {
            const el = typeof document !== 'undefined' ? document.getElementById(scrollerId) : null;
            if (!el) return;
            // Find a card width (including gap) to create a nice step
            const card = el.querySelector('[data-testimonial-card]');
            const gap = 16; // tailwind gap-4
            const step = card ? (card.clientWidth + gap) : 320;
            el.scrollBy({ left: dir * step, behavior: 'smooth' });
          };

          return (
            <section className="py-14 bg-gray-50" style={bgStyle}>
              <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-end justify-between gap-3 mb-6">
                  <div>
                    <h2 className={`text-2xl font-bold ${s.images?.testimonialBg ? 'text-black drop-shadow' : 'text-neutral-900'}`}>
                      {s.images?.testimonialBg ? 'Hear from our patients' : 'Loved by patients'}
                    </h2>
                    <p className={`text-sm mt-1 ${s.images?.testimonialBg ? 'text-white/90' : 'text-neutral-500'}`}>
                      Real reviews from recent {s.name?.toLowerCase() || 'treatments'}.
                    </p>
                  </div>

                  {/* Prev / Next (hidden if only 1) */}
                  {testimonials.length > 1 && (
                    <div className="hidden md:flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => scrollByCards(-1)}
                        className="h-9 w-9 rounded-full border bg-white hover:bg-neutral-50 shadow-sm grid place-items-center"
                        aria-label="Previous testimonials"
                      >
                        <span className="inline-block -translate-x-[1px]">&larr;</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollByCards(1)}
                        className="h-9 w-9 rounded-full border bg-white hover:bg-neutral-50 shadow-sm grid place-items-center"
                        aria-label="Next testimonials"
                      >
                        <span className="inline-block translate-x-[1px]">&rarr;</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* slider (1 card on mobile, 3 on md+) */}
                <div
                  id={scrollerId}
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {/* hide scrollbar (WebKit) */}
                  <style jsx>{`
                    #${scrollerId}::-webkit-scrollbar { display: none; }
                  `}</style>

                  {testimonials.map((t, i) => {
                    const rating = Math.max(0, Math.min(5, Number(t.rating || 0)));
                    const monthYear = t.monthYear || fmtMonthYear(t.date);
                    return (
                      <figure
                        key={i}
                        data-testimonial-card
                        className="snap-start bg-white/95 backdrop-blur rounded-2xl border p-5 shadow-sm
                                  min-w-[85%] sm:min-w-[75%] md:min-w-[32%] lg:min-w-[32%]"
                      >
                        {/* Service + date */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-neutral-100 text-neutral-700">
                            {t.service || s.name || 'Service'}
                          </span>
                          {monthYear && <span className="text-xs text-neutral-500">{monthYear}</span>}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3" aria-label={`Rating: ${rating} out of 5`}>
                          {[0,1,2,3,4].map((n) => <Star key={n} filled={n < rating} />)}
                        </div>

                        {/* Text */}
                        <blockquote className="text-neutral-800 leading-relaxed">
                          {t.text || t.quote || 'Great experience and fantastic results.'}
                        </blockquote>

                        {/* Author */}
                        {(t.author || t.name) && (
                          <figcaption className="text-sm text-neutral-600 mt-3">
                            — {t.author || t.name}
                            {t.location ? `, ${t.location}` : ''}
                          </figcaption>
                        )}
                      </figure>
                    );
                  })}
                </div>

                {/* Mobile controls */}
                {testimonials.length > 1 && (
                  <div className="mt-4 flex md:hidden items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => scrollByCards(-1)}
                      className="h-9 px-3 rounded-full border bg-white hover:bg-neutral-50 shadow-sm"
                      aria-label="Previous testimonials"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollByCards(1)}
                      className="h-9 px-3 rounded-full border bg-white hover:bg-neutral-50 shadow-sm"
                      aria-label="Next testimonials"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </section>
          );
        },
      });
    }


    // Provider Spotlight: 3-up, avatar + text side-by-side (equal heights)
    if (providers.length) {
      list.push({
        key: 'providerSpotlight',
        enabled: true,
        render: () => (
          <section className="py-14">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Meet Your {s.name} Providers</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {providers.map((p, i) => (
                  <Link
                    key={i}
                    href={p.href || '#'}
                    className="group h-full bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition flex items-start"
                  >
                    {/* Headshot */}
                    {p.headshotUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.headshotUrl}
                        alt={p.name}
                        className="w-20 h-20 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-neutral-200 shrink-0" />
                    )}

                    {/* Text */}
                    <div className="ml-4 flex flex-col min-w-0">
                      <div className="text-lg font-semibold leading-tight truncate">
                        {p.name}
                      </div>
                      {p.title && (
                        <div className="text-sm text-neutral-600">{p.title}</div>
                      )}

                      {p.bio && (
                        <p className="text-sm text-neutral-700 mt-2 line-clamp-3">
                          {p.bio}
                        </p>
                      )}

                      {/* Optional specialties as subtle pills */}
                      {Array.isArray(p.specialties) && p.specialties.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {p.specialties.map((sp, j) => (
                            <span
                              key={j}
                              className="text-xs rounded-full border px-2 py-1 bg-neutral-50 text-neutral-700"
                            >
                              {sp}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Optional Instagram handle */}
                      {p.instagramHandle && (
                        <div className="mt-auto pt-3 text-xs text-neutral-500">
                          {p.instagramHandle}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ),
      });
    }


    // Related Services variants: 'scroll' | 'grid'
    if (relatedServices.length) {
      list.push({
        key: 'relatedServices',
        enabled: true,
        render: () => {
          const variant = v(s, 'related', 'scroll');
          if (variant === 'scroll') {
            return (
              <section className="py-14 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                  <h2 className="text-2xl font-bold mb-6">Related services</h2>
                  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
                    {relatedServices.map((rs, i) => (
                      <Link key={i} href={rs.href || '#'} className="group snap-start min-w-[260px] max-w-[260px] bg-white rounded-2xl border overflow-hidden hover:shadow-md transition">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {rs.imageUrl && <img src={rs.imageUrl} alt={rs.name} className="w-full h-40 object-cover group-hover:scale-[1.02] transition" />}
                        <div className="p-4 font-medium">{rs.name}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          }
          // grid
          return (
            <section className="py-14 bg-gray-50">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">Related services</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedServices.map((rs, i) => (
                    <Link key={i} href={rs.href || '#'} className="group block bg-white rounded-2xl border overflow-hidden hover:shadow-md transition">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {rs.imageUrl && <img src={rs.imageUrl} alt={rs.name} className="w-full h-40 object-cover group-hover:scale-[1.02] transition" />}
                      <div className="p-4 font-medium">{rs.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        },
      });
    }

    // Prep & Aftercare variants: 'cards' | 'timeline'
    if (prepAftercare?.prep?.points?.length || prepAftercare?.after?.points?.length) {
      list.push({
        key: 'prepAftercare',
        enabled: true,
        render: () => {
          const variant = v(s, 'prepAftercare', 'cards');
          if (variant === 'timeline') {
            return (
              <section className="py-14">
                <div className="max-w-6xl mx-auto px-4">
                  <h2 className="text-2xl font-bold mb-6">Prep & Aftercare</h2>
                  <ol className="relative border-s pl-6 space-y-6">
                    {['Before your visit','Day 0–1','Day 2–7','Week 2+'].map((label, i) => (
                      <li key={i} className="ms-6">
                        <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">{i+1}</span>
                        <div className="font-semibold">{label}</div>
                        <div className="text-neutral-700 text-sm">Follow your provider’s specific guidance for optimal results.</div>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            );
          }
          // cards
          return (
            <section className="py-14">
              <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 gap-4">
                {[prepAftercare.prep, prepAftercare.after].filter(Boolean).map((col, idx) => (
                  <div key={idx} className="bg-neutral-50 rounded-2xl border p-5">
                    <h3 className="font-semibold mb-2">{col.title}</h3>
                    <ul className="list-disc ml-5 space-y-1">
                      {col.points.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        },
      });
    }

    // FlexEverything variants: 'tips' | 'mythfact' | 'classic'
    const flex = s.flexEverything;
    if (flex?.items?.length || flex?.intro) {
      list.push({
        key: 'flexEverything',
        enabled: true,
        render: () => {
          const variant = v(s, 'flexEverything', 'classic');
          return (
            <section className="py-14">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-bold mb-2">Everything you need to know about {s.name}</h2>
                {flex.intro && <p className="text-neutral-700 mb-6 max-w-3xl">{flex.intro}</p>}
                <div className="grid sm:grid-cols-2 gap-4">
                  {flex.items?.map((it, i) => (
                    <div key={i} className="bg-white rounded-2xl border p-5 shadow-sm">
                      <h3 className="font-semibold">{it.heading}</h3>
                      <p className="text-neutral-700 mt-1 whitespace-pre-line">{it.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        },
      });
    }

    // Lasers (unchanged structure)
    if (lasers.length) {
      list.push({
        key: 'lasers',
        enabled: true,
        render: () => (
          <section className="py-14 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Devices we use & why</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {lasers.map((lz, i) => (
                  <div key={i} className="rounded-2xl border p-5 bg-white shadow-sm">
                    <div className="font-semibold">{lz.machine}</div>
                    {!!lz.whatItTreats?.length && (
                      <div className="text-sm text-neutral-600">What it treats: {lz.whatItTreats.join(', ')}</div>
                    )}
                    {lz.whyWeChoseIt && <p className="mt-2 text-neutral-800">Why we chose it: {lz.whyWeChoseIt}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ),
      });
    }

    // Booking Embed (avoid placing CTA right next to this)
    if (bookingEmbedHtml) {
      list.push({
        key: 'bookingEmbed',
        enabled: true,
        render: () => (
          <section className="py-14">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-4">Book now</h2>
              <div className="rounded-2xl border overflow-hidden" dangerouslySetInnerHTML={{ __html: bookingEmbedHtml }} />
            </div>
          </section>
        ),
      });
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.slug, s.name, s.tagline, JSON.stringify(service)]);

  // Apply priorities and auto-insert CTAs
  const orderedBlocks = useMemo(() => {
    const overrides = s.blockPriorities || {};
    const sorted = (blocks || [])
      .filter(b => b.enabled)
      .sort((a, b) => {
        const pa = overrides[a.key] ?? DEFAULT_BLOCK_PRIORITIES[a.key] ?? 999;
        const pb = overrides[b.key] ?? DEFAULT_BLOCK_PRIORITIES[b.key] ?? 999;
        return pa - pb;
      });
    return interleaveCTAs(sorted, s);
  }, [blocks, s.blockPriorities, s?.autoCTA]);

  return (
    <>
      <ServiceSEO service={s} />   {/* ✅ SEO goes here */}
      <HeaderTwo />

      {/* Render content blocks + auto CTAs */}
      {orderedBlocks.map(b => <div key={b.key}>{b.render()}</div>)}

      {/* LIGHTBOX */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Image src={lightbox.src} alt={lightbox.alt || 'Result'} width={1200} height={800} className="object-contain" />
        </div>
      )}

      {/* FLOATING CTA */}
      <Link href={s.bookingLink || `/book/${s.slug}`} className="fixed bottom-8 right-8 bg-reluxe-primary p-4 rounded-full shadow-2xl animate-pulse text-white">
        <SparklesIcon className="w-6 h-6" />
      </Link>
    </>
  );
}
