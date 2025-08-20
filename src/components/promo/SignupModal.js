// src/components/promo/SignupModal.jsx
import { useEffect, useRef, useState } from "react";

/** Bird embed config (from your instructions) */
const BIRD_SRC =
  "https://embeddables.p.mbirdcdn.net/sdk/v0/bird-sdk.js";
const BIRD_DATA_CONFIG_URL =
  "https://api.bird.com/workspaces/50f43902-8a20-4357-acb4-95266d01a5c1/applications/9ee0b718-4b9d-4810-b4a0-8a0f13b5202b/signature/2024-06-17T17-12-51_e388fbfa75";
const BIRD_PROJECT_ID = "ff30c1eb-5c10-4101-8aae-1908c042061e";
const BIRD_WORKSPACE_ID = "50f43902-8a20-4357-acb4-95266d01a5c1";

/**
 * SignupModal
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 */
export default function SignupModal({ open, onClose }) {
  const [sdkReady, setSdkReady] = useState(false);
  const firstFocusRef = useRef(null);

  // Body scroll lock + focus trap entry
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => firstFocusRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(id);
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Load Bird SDK once (on first open)
  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;

    if (window.__BIRD_SDK_LOADED__) {
      setSdkReady(true);
      return;
    }

    const s = document.createElement("script");
    s.src = BIRD_SRC;
    s.async = true;
    s.setAttribute("data-config-url", BIRD_DATA_CONFIG_URL);
    s.onload = () => {
      window.__BIRD_SDK_LOADED__ = true;
      setSdkReady(true);
    };
    s.onerror = () => {
      console.warn("[bird] failed to load SDK");
      setSdkReady(false);
    };
    document.head.appendChild(s);

    // we do NOT remove the script on unmount; keep it cached for future opens
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
    >
      {/* overlay */}
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-neutral-950 text-white shadow-2xl ring-1 ring-white/10">
        {/* soft glows */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

        {/* close */}
        <button
          ref={firstFocusRef}
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          ✕
        </button>

        {/* header */}
        <div className="px-6 pt-8 pb-4 md:px-7">
          <p className="text-xs font-semibold tracking-[0.18em] text-white/70">
            EXCLUSIVE ACCESS
          </p>
          <h2
            id="signup-title"
            className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight neon-text"
          >
            Join the RELUXE List
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Get VIP-only promos and flash sales by text.
          </p>
        </div>

        {/* Bird embed */}
        <div className="px-6 pb-6 md:px-7 md:pb-7">
          {!sdkReady ? (
            /* Nice skeleton while the SDK loads */
            <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="h-5 w-40 rounded bg-white/10" />
              <div className="mt-3 h-12 rounded-xl bg-white/10" />
              <div className="mt-2 h-12 rounded-xl bg-white/10" />
              <div className="mt-5 h-12 rounded-2xl bg-white/10" />
            </div>
          ) : (
            <div className="rounded-2xl text-white border border-white/10 bg-white/5 p-4">
              {/*
                The Bird popup web component renders its own UI.
                We keep it contained inside our modal shell for a consistent look.
              */}
              {/* eslint-disable-next-line react/no-unknown-property */}
              <bird-popup
                project-id={BIRD_PROJECT_ID}
                workspace-id={BIRD_WORKSPACE_ID}
                style={{
                  display: "block",
                  width: "100%",
                }}
              />
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
          >
            Close
          </button>
        </div>

        {/* bottom accent */}
        <div className="h-[4px] w-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 opacity-70" />
      </div>

      {/* neon header flicker */}
      <style jsx>{`
        .neon-text {
          text-shadow:
            0 0 8px rgba(99, 102, 241, 0.65),
            0 0 16px rgba(139, 92, 246, 0.5),
            0 0 28px rgba(168, 85, 247, 0.35);
          animation: flicker 1.2s ease-out both;
        }
        @keyframes flicker {
          0% { opacity: 0; filter: brightness(0.6); }
          12% { opacity: 1; }
          20% { opacity: .25; }
          35% { opacity: 1; }
          55% { opacity: .55; }
          100% { opacity: 1; filter: brightness(1.08); }
        }
      `}</style>
    </div>
  );
}
