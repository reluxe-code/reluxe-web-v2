// src/components/promo/NeonSignHeader.jsx
import { useEffect, useRef } from "react";

export default function NeonSignHeader({ month = "August", sfx = false }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!sfx || !audioRef.current) return;
    const a = audioRef.current;
    a.volume = 0.35;
    a.currentTime = 0;
    a.play().catch(() => {});
    const stopAt = setTimeout(() => a.pause(), 3200);
    return () => clearTimeout(stopAt);
  }, [sfx]);

  return (
    <div className="neon">
      {sfx && (
        <audio ref={audioRef} preload="auto">
          <source src="/sounds/neon-buzz.mp3" type="audio/mpeg" />
        </audio>
      )}

      {/* Flame (left) */}
      <div className="flame boot boot1" aria-hidden="true">
        <svg viewBox="0 0 400 600" width="100%" height="100%" role="img" style={{ overflow: 'visible' }}>
          <defs>
            <filter id="neon-glow">
              <feGaussianBlur stdDeviation="2.5" result="b1" />
              <feGaussianBlur stdDeviation="12" result="b2" />
              <feGaussianBlur stdDeviation="24" result="b3" />
              <feMerge>
                <feMergeNode in="b3" />
                <feMergeNode in="b2" />
                <feMergeNode in="b1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M196 65c35 122-136 138-136 282 0 29 11 58 21 89 10 29-6 62-38 24-8-9-16-17-22-24-37 146 76 220 167 223-58-20-70-67-48-123 21 55 55 71 64 23 10-50 1-92-23-139 84 61 94 139 80 188-8 28 20 46 37 14 8-16 12-32 13-47 35 104-21 171-88 198 118-8 238-133 163-310-3-7-6-14-11-22-1 22-5 37-19 45-15 7-20-2-17-20 19-124-98-126-44-250 14-32 7-83-18-111z"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neon-glow)"
          />
        </svg>
      </div>

      {/* Copy */}
      <div className="copy">
        <div className="row1">
          <div className="hot boot boot2">HOT</div>
          <div className="month boot boot4">{month.toLowerCase()}</div>
        </div>
        <div className="promos boot boot3">PROMOS</div>
        <div className="sub boot boot5">see deals now</div>
      </div>

      <style jsx>{`
        :root {
          --bg: #000;
          --aqua: #bbfff6;
          --pink: #ff92d0;
          --violet: #a78bfa;
        }
        /* use a shared pad so we can "bleed" the flame to the bottom */
        .neon {
          --pad: clamp(14px, 2.5vw, 28px);
          position: relative;
          display: grid;
          grid-template-columns: clamp(120px, 18vw, 220px) 1fr;
          grid-template-areas: "flame center";
          align-items: center;
          gap: clamp(16px, 3vw, 32px);
          background: var(--bg);
          color: #fff;
          padding: var(--pad);
          /* extra right padding so the glow/text never get clipped by the rounded corner */
          padding-inline-end: calc(var(--pad) + 28px);
          border-radius: 18px 18px 0 0;
          overflow: hidden; /* keep the nice rounded top; we compensate with padding-right */
        }

        /* FLAME — stretch to the very bottom (no black strip) */
        .flame {
          grid-area: flame;
          width: 100%;
          /* fill the column height AND "bleed" into the bottom padding so it sits flush */
          height: calc(100% + var(--pad));
          margin-bottom: calc(-1 * var(--pad));
          align-self: end; /* anchor to bottom */
          animation: flamePulse 2.2s ease-in-out 3.2s infinite alternate;
          filter: drop-shadow(0 0 10px rgba(167, 139, 250, 0.9))
                  drop-shadow(0 0 32px rgba(167, 139, 250, 0.55))
                  drop-shadow(0 0 64px rgba(167, 139, 250, 0.35));
          opacity: 0;
        }

        .copy { grid-area: center; }

        .row1 {
          display: flex;
          align-items: baseline;
          gap: clamp(8px, 1.4vw, 18px);
          /* small right inset so long words (and their glow) don't kiss the edge */
          padding-right: clamp(10px, 1.8vw, 24px);
        }

        .hot,
        .promos {
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          line-height: 0.9;
          color: var(--aqua);
          text-shadow: 0 0 6px rgba(159, 247, 240, 0.95),
                       0 0 22px rgba(123, 228, 219, 0.75),
                       0 0 48px rgba(123, 228, 219, 0.55);
          opacity: 0;
        }
        .hot { font-size: clamp(44px, 7.2vw, 96px); }
        .promos { font-size: clamp(44px, 7.2vw, 96px); margin-top: 0.1em; }

        .month {
          font-family: "Pacifico", ui-script, "Brush Script MT", cursive;
          font-size: clamp(32px, 5.4vw, 80px);
          color: var(--pink);
          transform-origin: left center;
          transform: translateY(6px);
          text-shadow: 0 0 8px rgba(255, 146, 208, 0.95),
                       0 0 26px rgba(255, 146, 208, 0.75),
                       0 0 56px rgba(255, 146, 208, 0.6);
          opacity: 0;
        }

        .sub {
          margin-top: 0.5rem;
          font-size: clamp(11px, 1.2vw, 13px);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 0 12px rgba(159, 247, 240, 0.55);
          opacity: 0;
        }

        /* Boot-in flicker */
        .boot { animation-fill-mode: forwards; }
        .boot1 { animation: flicker 1.6s linear 0s 1, settle 0.3s ease 1.6s 1 forwards; }
        .boot2 { animation: flicker 1.8s linear 0.1s 1, settle 0.3s ease 1.9s 1 forwards; }
        .boot3 { animation: flicker 2.1s linear 0.2s 1, settle 0.3s ease 2.3s 1 forwards; }
        .boot4 { animation: flicker 2.3s linear 0.25s 1, settle 0.3s ease 2.55s 1 forwards; }
        .boot5 { animation: fadeIn 0.6s ease 3.0s 1 forwards; }

        @keyframes flicker {
          0% { opacity: 0; filter: brightness(0.2); }
          10% { opacity: 1; filter: brightness(1.4); }
          18% { opacity: 0.2; }
          26% { opacity: 1; }
          34% { opacity: 0.3; }
          42% { opacity: 1; }
          50% { opacity: 0.25; }
          60% { opacity: 1; }
          70% { opacity: 0.4; }
          80% { opacity: 1; }
          90% { opacity: 0.85; }
          100% { opacity: 1; filter: brightness(1.15); }
        }
        @keyframes settle { to { opacity: 1; filter: brightness(1.0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        @keyframes flamePulse {
          0%   { transform: translateY(0) scale(1);   filter: drop-shadow(0 0 10px rgba(167,139,250,.9)) drop-shadow(0 0 32px rgba(167,139,250,.55)) drop-shadow(0 0 64px rgba(167,139,250,.35)); }
          100% { transform: translateY(-1px) scale(1.01); filter: drop-shadow(0 0 14px rgba(167,139,250,1)) drop-shadow(0 0 40px rgba(167,139,250,.7)) drop-shadow(0 0 80px rgba(167,139,250,.5)); }
        }

        @media (max-width: 560px) {
          .neon {
            grid-template-columns: 1fr;
            grid-template-areas:
              "center"
              "flame";
          }
          .flame {
            max-width: 220px;
            justify-self: start;
          }
        }
      `}</style>
    </div>
  );
}
