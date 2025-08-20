import React from "react";

/** Aqua + pink + purple neon sign with boot-up + animated flame */
export default function NeonSignHeader({
  month = new Date().toLocaleString("en-US", { month: "long" }),
  aqua = "#9FF7F0",      // HOT / PROMOS
  pink = "#FF80C8",      // month script
  purple = "#8B5CF6",    // flame
}) {
  return (
    <div className="neon">
      {/* LEFT: Neon flame (animated) */}
      <div className="flameWrap boot boot1" aria-hidden>
        <svg viewBox="0 0 200 260" className="flameSVG">
          <defs>
            {/* soft purple halo */}
            <radialGradient id="halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={purple} stopOpacity="0.8" />
              <stop offset="100%" stopColor={purple} stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="a" />
              <feMerge>
                <feMergeNode in="a" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* halo */}
          <circle cx="100" cy="155" r="92" fill="url(#halo)">
            <animate
              attributeName="r"
              dur="3.5s"
              values="86;92;88;95;90;92"
              repeatCount="indefinite"
            />
          </circle>

          {/* OUTER flame stroke */}
          <path
            className="flameStroke outer"
            d="M100,18 C95,56 76,74 56,92 C34,112 24,130 24,158
               C24,208 64,238 100,244 C136,238 176,208 176,158
               C176,134 168,114 156,96 C154,120 146,134 136,134
               C126,134 126,120 124,110 C120,92 114,80 100,62
               C86,80 78,96 78,118 C78,132 82,148 82,160
               C82,176 74,188 86,198 C98,206 112,196 112,178
               C112,168 110,156 116,142 C122,156 128,176 128,194
               C128,220 118,236 100,246"
            fill="none"
            stroke={purple}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
          {/* INNER lick */}
          <path
            className="flameStroke inner"
            d="M100,210 C86,202 82,190 82,178 C82,162 92,148 96,138
               C100,148 108,160 108,176 C108,190 104,202 100,210"
            fill="none"
            stroke={purple}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        </svg>
      </div>

      {/* CENTER: HOT / PROMOS (aqua) */}
      <div className="center">
        <div className="hot boot boot2">HOT</div>
        <div className="promos boot boot3">PROMOS</div>
        <div className="sub boot boot5">see deals now</div>
      </div>

      {/* RIGHT: month handwritten (pink) */}
      <div className="month boot boot4">{month.toLowerCase()}</div>

      <style jsx>{`
        :root {
          --aqua: ${aqua};
          --pink: ${pink};
          --purple: ${purple};
        }
        .neon {
          position: relative;
          display: grid;
          grid-template-columns: 150px 1fr minmax(160px, 240px);
          gap: clamp(16px, 2.5vw, 32px);
          align-items: center;
          padding: clamp(18px, 3vw, 28px) clamp(16px, 3vw, 28px);
          background: #000;
        }

        /* --- Flame --- */
        .flameWrap {
          position: relative;
          width: clamp(110px, 15vw, 150px);
          aspect-ratio: 200/260;
          filter:
            drop-shadow(0 0 12px rgba(139,92,246,.9))
            drop-shadow(0 0 42px rgba(139,92,246,.65));
        }
        .flameSVG { width: 100%; height: 100%; display:block; }
        .flameStroke {
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 6 14;
          animation:
            strokeFlow 6s linear infinite,
            flamePulse 2.6s ease-in-out infinite;
        }
        .flameStroke.inner { stroke-width: 7; opacity:.95; }
        @keyframes strokeFlow { to { stroke-dashoffset: -600; } }
        @keyframes flamePulse {
          0%,100% { filter: drop-shadow(0 0 10px rgba(139,92,246,.9)) drop-shadow(0 0 28px rgba(139,92,246,.7)); }
          50%     { filter: drop-shadow(0 0 16px rgba(167,139,250,1)) drop-shadow(0 0 52px rgba(139,92,246,.85)); }
        }

        /* --- Aqua text --- */
        .center { color:#fff; }
        .hot, .promos {
          font-weight: 900;
          letter-spacing: .06em;
          color: var(--aqua);
          text-transform: uppercase;
          line-height: .9;
          margin: 0;
          text-shadow:
            0 0 6px rgba(159,247,240,.9),
            0 0 22px rgba(123,228,219,.7),
            0 0 48px rgba(123,228,219,.55);
        }
        .hot    { font-size: clamp(42px, 7vw, 88px); }
        .promos { font-size: clamp(42px, 7vw, 88px); margin-top: .2em; }

        .sub {
          margin-top: .6rem;
          font-size: .9rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #fff;
          opacity: 0;
          text-shadow: 0 0 12px rgba(159,247,240,.55);
        }

        /* --- Pink script month --- */
        .month {
          justify-self: end;
          font-family: "Pacifico", ui-script, "Brush Script MT", cursive;
          font-size: clamp(36px, 6vw, 84px);
          color: var(--pink);
          text-shadow:
            0 0 6px rgba(255,128,200,.9),
            0 0 24px rgba(255,128,200,.7),
            0 0 52px rgba(255,128,200,.55);
          transform-origin: right center;
        }

        /* --- Boot-up sequence (flicker) --- */
        .boot {
          opacity: 0;
          animation: boot 3.1s linear forwards;
        }
        .boot1 { animation-delay: 0s;      }  /* flame first */
        .boot2 { animation-delay: .4s;     }  /* HOT   */
        .boot3 { animation-delay: .9s;     }  /* PROMOS*/
        .boot4 { animation-delay: 1.6s;    }  /* month */
        .boot5 { animation-delay: 2.9s;    }  /* subline reveal */

        @keyframes boot {
          0%   { opacity: 0; }
          5%   { opacity: .3; }
          9%   { opacity: 0; }
          15%  { opacity: .85; }
          22%  { opacity: .4; }
          32%  { opacity: 1; }
          46%  { opacity: .92; }
          60%  { opacity: 1; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
