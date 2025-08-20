// src/components/promo/SmartPromoModal.jsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import NeonSignHeader from "@/components/promo/NeonSignHeader";

/**
 * SmartPromoModal (Neon edition)
 * (props unchanged)
 */
const storageKey = (id) => `reluxe_promo_${id}`;
const now = () => Date.now();
const daysToMs = (d) => d * 24 * 60 * 60 * 1000;

function routeMatches(pathname, patterns = []) {
  if (!patterns?.length) return true;
  return patterns.some((p) => {
    if (p.endsWith("/*")) {
      const base = p.replace(/\/\*$/, "");
      return pathname === base || pathname.startsWith(`${base}/`);
    }
    return pathname === p;
  });
}

function getTTL(id) {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return 0;
    const { expiresAt } = JSON.parse(raw);
    return Number(expiresAt || 0);
  } catch {
    return 0;
  }
}
function setTTL(id, msFromNow) {
  try {
    localStorage.setItem(
      storageKey(id),
      JSON.stringify({ expiresAt: now() + msFromNow })
    );
  } catch {}
}

// quick buzz SFX to sell the neon boot
function playBuzz(ms = 1600) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.value = 60;
    o.detune.value = -400;
    o.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    o.start(t);
    o.stop(t + ms / 1000 + 0.03);
    return () => ctx.close();
  } catch {
    return () => {};
  }
}

export default function SmartPromoModal({
  id = "reluxe-deals",
  title = "This Month’s Deals",
  ctaText = "See Monthly Deals",
  ctaHref = "/deals",
  trigger = "both",
  delay = 1200,
  frequencyDays = 30,
  include,
  exclude,
  alwaysShow = false,
  flameSide = "left",
  month = new Date().toLocaleString("en-US", { month: "long" }),
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const allowedByRoute = useMemo(() => {
    const p = router?.pathname || "/";
    if (exclude?.length && routeMatches(p, exclude)) return false;
    if (include?.length) return routeMatches(p, include);
    return true;
  }, [router?.pathname, include, exclude]);

  const canShow = useMemo(() => {
    if (!mounted) return false;
    if (!allowedByRoute) return false;
    if (alwaysShow) return true;
    const ttl = getTTL(id);
    return now() > ttl;
  }, [mounted, allowedByRoute, id, alwaysShow]);

  // Exit intent
  useEffect(() => {
    if (!mounted || !canShow) return;
    if (trigger !== "exit" && trigger !== "both") return;

    let fired = false;
    const onMouseLeave = (e) => {
      if (fired) return;
      if (e.clientY <= 0) {
        fired = true;
        setOpen(true);
        if (!alwaysShow) setTTL(id, daysToMs(frequencyDays));
      }
    };
    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, [mounted, canShow, trigger, id, frequencyDays, alwaysShow]);

  // On-load after delay
  useEffect(() => {
    if (!mounted || !canShow) return;
    if (trigger !== "load" && trigger !== "both") return;

    const t = setTimeout(() => {
      setOpen(true);
      if (!alwaysShow) setTTL(id, daysToMs(frequencyDays));
    }, Math.max(0, delay));

    return () => clearTimeout(t);
  }, [mounted, canShow, trigger, delay, id, frequencyDays, alwaysShow]);

  // mount + lock body scroll
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    const body = document?.body;
    if (!body) return;
    body.style.overflow = open ? "hidden" : "";
    return () => {
      body.style.overflow = "";
    };
  }, [open, mounted]);

  // buzz once when opening
  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    const stop = playBuzz(1600);
    return stop;
  }, [open]);

  // close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!mounted || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
    >
      {/* overlay */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"
        onClick={() => setOpen(false)}
      />

      {/* modal shell */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* top: pure black neon header */}
        <div className="relative bg-black">
          {/* close */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close promo"
            className="absolute right-3 top-3 z-[70] pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/90 shadow hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* subtle vignette */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-700/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

          {/* neon header should NOT intercept clicks */}
          <div className="pointer-events-none select-none">
            <NeonSignHeader flameSide={flameSide} month={month} />
          </div>
        </div>

        {/* bottom: action sheet */}
        <div className="bg-white p-6 md:p-7">
          <h2 id="promo-title" className="text-xl font-bold text-neutral-900">
            {title}
          </h2>

          <a
            href={ctaHref}
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-black px-6 py-4 text-sm font-semibold text-white hover:bg-neutral-800"
            onClick={() => setOpen(false)}
          >
            {ctaText}
          </a>

          <button
            type="button"
            className="mt-3 block w-full text-center text-xs text-neutral-500 hover:text-neutral-700"
            onClick={() => setOpen(false)}
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
