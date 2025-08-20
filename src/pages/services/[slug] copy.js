// src/pages/services/[slug].js
// ✅ Modern, optional, priority-based service page that matches your current stack
// - Uses HeaderTwo (same as your site) + Tailwind + Framer Motion + ReactCompareSlider + heroicons
// - Works with getServicesList() live data
// - All blocks are optional; default priorities but can be overridden via service.blockPriorities
// - Includes flexible “Everything you need to know about SERVICE” block
// - Includes optional Lasers/Devices block
// - Keeps your floating CTA + hero look/feel

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeaderTwo from '@/components/header/header-2';
import { motion } from 'framer-motion';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import {
  ClockIcon, FireIcon, SparklesIcon, UserIcon, CheckCircleIcon, PlayCircleIcon,
} from '@heroicons/react/24/outline';

// ✅ use live data, not the module-level array
import { getServicesList } from '@/data/servicesList';

const ICON_MAP = { clock: ClockIcon, fire: FireIcon, sparkles: SparklesIcon, user: UserIcon, check: CheckCircleIcon };

// ---------- SSG ----------
export async function getStaticPaths() {
  const services = await getServicesList().catch(() => []);
  return { paths: services.map(s => ({ params: { slug: s.slug } })), fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const services = await getServicesList().catch(() => []);
  const service = services.find(s => s.slug === params.slug) || null;
  if (!service) return { notFound: true, revalidate: 60 };
  return { props: { service }, revalidate: 60 };
}

// ---------- Default priorities (lower = higher on page) ----------
const DEFAULT_BLOCK_PRIORITIES = {
  hero: 10,
  quickFacts: 20,
  benefits: 30,
  beforeAfter: 40,
  howItWorks: 50,
  candidates: 60,
  process: 70,
  pricing: 80,
  financing: 90,
  comparison: 95,
  video: 100,
  faq: 110,
  testimonials: 120,
  providerSpotlight: 130,
  relatedServices: 140,
  prepAftercare: 150,
  flexEverything: 160,   // 🔹 Flexible block
  lasers: 170,           // 🔹 Optional devices/lasers
  bookingEmbed: 180,
};

export default function ServicePage({ service }) {
  const [lightbox, setLightbox] = useState(null);

  // Safe access + derived values
  const s = service ?? {};
  const pricingSingle = s.pricing?.single || '';
  const basePrice = parseFloat(pricingSingle.replace(/[^0-9.]/g, '')) || 0;
  const fourPay = (basePrice / 4).toFixed(2);
  const mo24 = (basePrice / 24).toFixed(2);

  const heroImg =
    s.gallery?.[0]?.src ||
    s.heroImage ||
    '/images/page-banner/skincare-header.png';

  const beforeAfter = Array.isArray(s.beforeAfter) ? s.beforeAfter : [];
  const packages = Array.isArray(s.pricing?.packages) ? s.pricing.packages : [];
  const quickFacts = Array.isArray(s.quickFacts) ? s.quickFacts : [];
  const benefits = Array.isArray(s.benefits) ? s.benefits : [];
  const appointmentSteps = Array.isArray(s.appointmentSteps) ? s.appointmentSteps : [];
  const candidates = s.candidates || null; // { good:[], notIdeal:[] }
  const prepAftercare = s.prepAftercare || null; // { prep:{title, points[]}, after:{title, points[]} }
  const faq = Array.isArray(s.faq) ? s.faq : [];
  const testimonials = Array.isArray(s.testimonials) ? s.testimonials : [];
  const providers = Array.isArray(s.providers) ? s.providers : [];
  const relatedServices = Array.isArray(s.relatedServices) ? s.relatedServices : [];
  const lasers = Array.isArray(s.lasers) ? s.lasers : []; // [{ machine, whatItTreats[], whyWeChoseIt }]
  const comparison = s.comparison || null; // { columns:[], rows:[{label, options:[{name,value}]}] }
  const videoUrl = s.videoUrl || '';
  const bookingEmbedHtml = s.bookingEmbedHtml || '';

  // ---------- Define each block as a renderable unit ----------
  const blocks = useMemo(() => {
    const list = [];

    // Hero (always on)
    list.push({
      key: 'hero',
      enabled: true,
      render: () => (
        <header className="relative h-72 md:h-[360px] bg-cover bg-center" style={{ backgroundImage: `url('${heroImg}')` }}>
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow">
              {s.name || 'Service'}
            </h1>
            {s.tagline && <p className="mt-3 text-base md:text-lg text-gray-200 max-w-2xl">{s.tagline}</p>}
            <div className="mt-6 flex gap-3">
              <Link
                href={s.bookingLink || `/book/${s.slug}`}
                className="inline-flex items-center gap-2 bg-white text-neutral-900 font-semibold py-2 px-5 rounded-full shadow hover:bg-gray-100 transition"
              >
                Book Now
              </Link>
              <Link
                href="/book/consult"
                className="inline-flex items-center gap-2 bg-reluxe-primary text-white font-semibold py-2 px-5 rounded-full shadow hover:opacity-90 transition"
              >
                Free Consult
              </Link>
            </div>
          </div>
        </header>
      ),
    });

    // Quick Facts
    if (quickFacts.length) {
      list.push({
        key: 'quickFacts',
        enabled: true,
        render: () => (
          <section className="py-14 bg-gray-50">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
              {quickFacts.map(({ iconKey, label, value }, i) => {
                const Icon = ICON_MAP[iconKey] || SparklesIcon;
                return (
                  <motion.div
                    key={`${label}-${value}-${i}`}
                    whileHover={{ y: -4 }}
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
        ),
      });
    }

    // Split Callout (kept from your page, updated visuals)
    list.push({
      key: 'callout',
      enabled: true,
      render: () => (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-0 lg:gap-16">
          <div className="order-2 md:order-1 h-72 md:h-auto relative">
            <Image
              src={heroImg}
              alt={s.gallery?.[0]?.alt || s.name || 'Service image'}
              fill
              className="object-cover rounded-tr-3xl rounded-br-3xl shadow-xl"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 md:order-2 bg-reluxe-primary text-white p-8 md:p-12 flex flex-col justify-center rounded-tl-3xl rounded-bl-3xl">
            <h2 className="text-3xl font-bold mb-3">Personalized Care, Just for You</h2>
            <p className="mb-6 opacity-90">
              Every plan is tailored to your unique needs—from consult to aftercare—ensuring optimal comfort and stunning results.
            </p>
            <Link
              href={s.bookingLink || `/book/${s.slug}`}
              className="inline-block bg-white text-reluxe-primary font-semibold py-2.5 px-6 rounded-full shadow hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
          </div>
        </section>
      ),
    });

    // Benefits
    if (benefits.length) {
      list.push({
        key: 'benefits',
        enabled: true,
        render: () => (
          <section className="relative py-14">
            <div className="absolute inset-0 bg-gradient-to-tr from-reluxe-secondary to-reluxe-primary opacity-[0.08] pointer-events-none" />
            <div className="relative max-w-6xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition">
                  <CheckCircleIcon className="w-6 h-6 text-reluxe-primary mb-3" />
                  <h3 className="font-semibold">{b}</h3>
                </div>
              ))}
            </div>
          </section>
        ),
      });
    }

    // Before & After (2 images = compare slider; >2 = grid)
    if (beforeAfter.length >= 2) {
      list.push({
        key: 'beforeAfter',
        enabled: true,
        render: () => (
          <section className="py-16 bg-gray-50">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-6">Before &amp; After</h2>
              {beforeAfter.length === 2 ? (
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <ReactCompareSlider
                    itemOne={<ReactCompareSliderImage src={beforeAfter[0].src} alt={beforeAfter[0].alt || 'Before'} />}
                    itemTwo={<ReactCompareSliderImage src={beforeAfter[1].src} alt={beforeAfter[1].alt || 'After'} />}
                    handle={<div className="w-1 bg-reluxe-primary h-full" />}
                  />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {beforeAfter.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox(img)}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt={img.alt || 'Result'} className="w-full h-full object-cover group-hover:scale-[1.02] transition" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        ),
      });
    }

    // How It Works (accordion)
    if (Array.isArray(s.howItWorks) && s.howItWorks.length) {
      list.push({
        key: 'howItWorks',
        enabled: true,
        render: () => (
          <section className="py-14">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8">How it works</h2>
              <div className="space-y-3">
                {s.howItWorks.map((step, i) => (
                  <details key={i} className="bg-white rounded-2xl border p-4">
                    <summary className="cursor-pointer font-medium">{step.title || `Step ${i + 1}`}</summary>
                    {step.body && <p className="mt-2 text-neutral-700 whitespace-pre-line">{step.body}</p>}
                  </details>
                ))}
              </div>
            </div>
          </section>
        ),
      });
    }

    // Candidates
    if (candidates?.good?.length || candidates?.notIdeal?.length) {
      list.push({
        key: 'candidates',
        enabled: true,
        render: () => (
          <section className="py-14 bg-white">
            <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 gap-6">
              <div className="bg-neutral-50 rounded-2xl border p-6">
                <h3 className="font-semibold mb-2">Great for</h3>
                <ul className="list-disc ml-5 space-y-1">
                  {(candidates.good || []).map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
              {!!(candidates.notIdeal || []).length && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <h3 className="font-semibold mb-2">Not ideal if</h3>
                  <ul className="list-disc ml-5 space-y-1">
                    {candidates.notIdeal.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </section>
        ),
      });
    }

    // Process (What to Expect)
    if (appointmentSteps.length) {
      list.push({
        key: 'process',
        enabled: true,
        render: () => (
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-reluxe-primary text-center mb-8">What to Expect</h2>
              <ol className="space-y-4">
                {appointmentSteps.map((step, i) => (
                  <li key={i} className="flex items-start space-x-3 bg-gray-50 p-4 rounded-xl border hover:bg-gray-100 transition">
                    <span className="font-bold text-reluxe-primary">{i + 1}.</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ),
      });
    }

    // Pricing & Packages
    if (pricingSingle || packages.length > 0) {
      list.push({
        key: 'pricing',
        enabled: true,
        render: () => (
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
              <h2 className="text-2xl font-bold">Pricing & Packages</h2>
              {pricingSingle && <p className="text-lg">Single session: <strong>{pricingSingle}</strong></p>}
              {!!packages.length && (
                <div className="flex flex-wrap justify-center gap-4">
                  {packages.map((pkg, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition">
                      <h4 className="font-semibold">{pkg.label}</h4>
                      <p className="mt-1">{pkg.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ),
      });
    }

    // Financing (auto from price)
    if (basePrice > 0) {
      list.push({
        key: 'financing',
        enabled: true,
        render: () => (
          <>
            <section className="w-full py-6 bg-gradient-to-r from-reluxe-primary to-reluxe-secondary text-white text-center">
              <p className="text-lg font-semibold">Flexible financing — 0% APR for 4 easy payments or up to 24 months.</p>
            </section>
            <section className="py-12 bg-white">
              <div className="max-w-4xl mx-auto px-4 space-y-4">
                <h3 className="text-xl font-bold">Financing Options</h3>
                <p>Based on our example treatment cost of <strong>${basePrice.toFixed(2)}</strong>:</p>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  <li><strong>4 payments</strong> of <strong>${fourPay}</strong> each at 0% APR</li>
                  <li><strong>24 monthly payments</strong> of <strong>${mo24}</strong> at 0% APR</li>
                </ul>
              </div>
            </section>
          </>
        ),
      });
    }

    // Comparison table (e.g., Botox vs Dysport vs Jeuveau vs Daxxify)
    if (comparison?.columns?.length && comparison?.rows?.length) {
      list.push({
        key: 'comparison',
        enabled: true,
        render: () => (
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
        ),
      });
    }

    // Video (YouTube/Vimeo)
    if (videoUrl) {
      list.push({
        key: 'video',
        enabled: true,
        render: () => (
          <section className="py-14">
            <div className="max-w-5xl mx-auto px-4">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border shadow-sm">
                <iframe
                  src={videoUrl}
                  title={s.name || 'Service video'}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <p className="flex items-center gap-2 text-sm text-neutral-600 mt-2">
                <PlayCircleIcon className="w-4 h-4" /> Watch how it works
              </p>
            </div>
          </section>
        ),
      });
    }

    // FAQ
    if (faq.length) {
      list.push({
        key: 'faq',
        enabled: true,
        render: () => (
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
        ),
      });
    }

    // Testimonials
    if (testimonials.length) {
      list.push({
        key: 'testimonials',
        enabled: true,
        render: () => (
          <section className="py-14 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Loved by patients</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {testimonials.map((t, i) => (
                  <figure key={i} className="bg-white rounded-2xl border p-5 shadow-sm">
                    <blockquote className="text-neutral-800">“{t.quote}”</blockquote>
                    <figcaption className="text-sm text-neutral-600 mt-2">
                      {t.name ? `— ${t.name}${t.age ? ', ' + t.age : ''}` : ''}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ),
      });
    }

    // Provider Spotlight
    if (providers.length) {
      list.push({
        key: 'providerSpotlight',
        enabled: true,
        render: () => (
          <section className="py-14">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Meet your providers</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((p, i) => (
                  <Link key={i} href={p.href || '#'} className="block bg-white rounded-2xl border p-5 hover:shadow-md transition">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.headshotUrl && <img src={p.headshotUrl} alt={p.name} className="w-20 h-20 object-cover rounded-full" />}
                    <div className="mt-3 font-semibold">{p.name}</div>
                    {p.title && <div className="text-sm text-neutral-600">{p.title}</div>}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ),
      });
    }

    // Related Services
    if (relatedServices.length) {
      list.push({
        key: 'relatedServices',
        enabled: true,
        render: () => (
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
        ),
      });
    }

    // Prep & Aftercare
    if (prepAftercare?.prep?.points?.length || prepAftercare?.after?.points?.length) {
      list.push({
        key: 'prepAftercare',
        enabled: true,
        render: () => (
          <section className="py-14">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Prep & Aftercare</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[prepAftercare.prep, prepAftercare.after].filter(Boolean).map((col, idx) => (
                  <div key={idx} className="bg-neutral-50 rounded-2xl border p-5">
                    <h3 className="font-semibold mb-2">{col.title}</h3>
                    <ul className="list-disc ml-5 space-y-1">
                      {col.points.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ),
      });
    }

    // 🔹 Flexible: Everything you need to know about SERVICE
    const flex = s.flexEverything;
    if (flex?.items?.length || flex?.intro) {
      list.push({
        key: 'flexEverything',
        enabled: true,
        render: () => (
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
        ),
      });
    }

    // 🔹 Optional: Lasers/Devices we use & why
    if (lasers.length) {
      list.push({
        key: 'lasers',
        enabled: true,
        render: () => (
          <section className="py-14 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Devices we use & why</h2>
              <div className="space-y-4">
                {lasers.map((lz, i) => (
                  <div key={i} className="rounded-2xl border p-5 bg-white">
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

    // Booking Embed (Boulevard, etc.)
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

  // Apply priorities: service.blockPriorities overrides defaults
  const orderedBlocks = useMemo(() => {
    const overrides = s.blockPriorities || {};
    return blocks
      .filter(b => b.enabled)
      .sort((a, b) => {
        const pa = overrides[a.key] ?? DEFAULT_BLOCK_PRIORITIES[a.key] ?? 999;
        const pb = overrides[b.key] ?? DEFAULT_BLOCK_PRIORITIES[b.key] ?? 999;
        return pa - pb;
      });
  }, [blocks, s.blockPriorities]);

  return (
    <>
      <HeaderTwo />

      {/* Render blocks in priority order */}
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
