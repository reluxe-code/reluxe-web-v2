// src/components/deals/DealsCarousel.js
import { useEffect, useMemo, useRef, useState } from 'react';
import DealCard from './DealCard';

const safeId = () => {
  const g = typeof globalThis !== 'undefined' ? globalThis : {};
  const c = g.crypto;
  if (c?.randomUUID) { try { return c.randomUUID(); } catch {} }
  return `id-${Math.random().toString(36).slice(2,10)}${Math.random().toString(36).slice(2,8)}`;
};

const mapLegacyDealToCard = (d = {}) => {
  const acf = d.raw?.acf || {};
  return {
    id: d.id ?? d.slug ?? safeId(),
    title: d.title || acf.offer_name || 'Promotion',
    subtitle: d.subtitle || acf.offer_name || '',
    price: d.price || acf.offer_price || '',
    tag: d.tag || acf.offer_savings || '',
    description:
      d.description ||
      d.offer_short_description ||
      acf.offer_short_description ||
      d.summary ||
      acf.description ||
      '',
    ctaText: d.ctaText || 'Book Now',
    link: d.bookingUrl || acf.booking_link || d.link || '/contact',
    autoScroll: d.autoScroll ?? acf.auto_scroll,
  };
};

const getVisible = () => {
  if (typeof window === 'undefined') return 2;
  return window.innerWidth >= 768 ? 2 : 1;
};

export default function DealsCarousel({
  deals = [],
  autoAdvance = true,
  autoplayMs = 3500,
  pauseOnHover = true,
}) {
  const base = useMemo(() => (Array.isArray(deals) ? deals : []).map(mapLegacyDealToCard), [deals]);

  const [visible, setVisible] = useState(getVisible());
  const containerRef = useRef(null);
  const slideElsRef = useRef([]);
  const indexRef = useRef(0);

  const autoplayRef = useRef(null);
  const scrollDebounce = useRef(null);

  // NEW: prevent “snap” from animating + ignore scroll events during programmatic smooth scroll
  const isAnimatingRef = useRef(false);
  const smoothTimerRef = useRef(null);
  const SMOOTH_MS = 480; // ~default smooth duration; tweak if desired

  const slidesWithClones = useMemo(() => {
    if (!base.length) return [];
    const n = Math.min(visible, base.length);
    return [...base.slice(-n), ...base, ...base.slice(0, n)];
  }, [base, visible]);

  const offset = Math.min(visible, base.length || 0);

  const gotoIndex = (idx, smooth = true) => {
    indexRef.current = idx;
    const el = slideElsRef.current[idx];
    const scroller = containerRef.current;
    if (!el || !scroller) return;

    if (smooth) {
      isAnimatingRef.current = true;
      if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
      scroller.scrollTo({ left: el.offsetLeft, behavior: 'smooth' });
      // after smooth finishes, instantly normalize if we’re on a clone
      smoothTimerRef.current = setTimeout(() => {
        isAnimatingRef.current = false;
        ensureLoop(); // instant snap (no animation)
      }, SMOOTH_MS);
    } else {
      scroller.scrollTo({ left: el.offsetLeft, behavior: 'auto' });
    }
  };

  const normalizeToReal = (i) => {
    const L = base.length;
    if (!L) return i;
    const first = offset;
    const mod = ((i - first) % L + L) % L; // 0..L-1
    return first + mod;
  };

  const advance = (dir = 1) => {
    if (!base.length) return;
    const L = base.length;
    const first = offset;
    const last = first + L - 1;
    const curr = normalizeToReal(indexRef.current);

    if (dir > 0) {
      if (curr === last) gotoIndex(last + 1, true); // head-clone of first
      else gotoIndex(curr + 1, true);
    } else {
      if (curr === first) gotoIndex(first - 1, true); // tail-clone of last
      else gotoIndex(curr - 1, true);
    }
  };

  const ensureLoop = () => {
    const L = base.length;
    if (!L) return;
    const n = offset;
    if (indexRef.current >= L + n) {
      gotoIndex(indexRef.current - L, false); // instant, no animation
    } else if (indexRef.current < n) {
      gotoIndex(indexRef.current + L, false);
    }
  };

  const snapNearest = () => {
    if (isAnimatingRef.current) return; // ignore while our smooth scroll is in-flight
    const scroller = containerRef.current;
    if (!scroller) return;
    const left = scroller.scrollLeft;
    const all = slideElsRef.current;
    if (!all?.length) return;

    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < all.length; i++) {
      const dist = Math.abs(all[i].offsetLeft - left);
      if (dist < best) { best = dist; nearest = i; }
    }
    indexRef.current = nearest;
    ensureLoop(); // normalize if we landed in clone zone
  };

  useEffect(() => {
    if (!slidesWithClones.length) return;
    slideElsRef.current = slideElsRef.current.slice(0, slidesWithClones.length);
    const id = requestAnimationFrame(() => gotoIndex(offset, false));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slidesWithClones.length, offset]);

  useEffect(() => {
    const onResize = () => setVisible(getVisible());
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!base.length || !autoAdvance) return () => {};
    const tick = () => advance(1);
    autoplayRef.current = setInterval(tick, Math.max(1500, autoplayMs));
    return () => clearInterval(autoplayRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayMs, base.length, autoAdvance, offset]);

  useEffect(() => {
    const scroller = containerRef.current;
    if (!scroller) return () => {};
    const onScroll = () => {
      if (isAnimatingRef.current) return; // ignore programmatic smooth scroll frames
      if (scrollDebounce.current) clearTimeout(scrollDebounce.current);
      scrollDebounce.current = setTimeout(snapNearest, 120);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slidesWithClones.length]);

  if (!base.length) {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold">No active promotions right now.</p>
        <p className="mt-2 text-neutral-600">Check back soon—we’re always adding new specials.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Accent bar */}
      <div className="pointer-events-none absolute inset-x-4 -bottom-1 h-[4px] rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 opacity-60" />

      {/* Controls */}
      <button
        aria-label="Previous"
        onClick={() => advance(-1)}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow ring-1 ring-black/10 hover:bg-white"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        aria-label="Next"
        onClick={() => advance(1)}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow ring-1 ring-black/10 hover:bg-white"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Track */}
      <div
        ref={containerRef}
        // IMPORTANT: keep scroll behavior AUTO so the instant loop snap is invisible
        style={{ scrollBehavior: 'auto' }}
        onMouseEnter={() => { if (pauseOnHover) isAnimatingRef.current = false; if (pauseOnHover) clearInterval(autoplayRef.current); }}
        onMouseLeave={() => { if (pauseOnHover && autoAdvance) autoplayRef.current = setInterval(() => advance(1), Math.max(1500, autoplayMs)); }}
        className="overflow-x-hidden" // ⛔ removed 'scroll-smooth'
      >
        <div className="flex gap-6 lg:gap-8">
          {slidesWithClones.map((deal, i) => (
            <div
              key={`${deal.id}-${i}`}
              ref={(el) => (slideElsRef.current[i] = el)}
              className="shrink-0 basis-full md:basis-1/2"
            >
              <DealCard {...deal} autoScroll={deal.autoScroll} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
