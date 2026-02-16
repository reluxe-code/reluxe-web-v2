import { useEffect, useRef, useState } from 'react';
import { useLocationPref } from '@/context/LocationContext';
import { LOCATIONS } from '@/lib/location';

const ABBR = { westfield: 'WSTFLD', carmel: 'CRML' };

export default function LocationSwitcherMini({ variant = 'pill', className = '' }) {
  if (variant === 'segmented') return <Segmented className={className} />;
  if (variant === 'icon') return <IconDropdown className={className} />;
  return <PillDropdown className={className} />; // default
}

/* ---------- Tiny pill: "📍 Carmel" with mini dropdown ---------- */
function PillDropdown({ className = '' }) {
  const { locationKey, setLocationKey } = useLocationPref();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const label = locationKey ? LOCATIONS[locationKey].label : 'Choose';

  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      if (!popRef.current || !btnRef.current) return;
      if (popRef.current.contains(e.target) || btnRef.current.contains(e.target)) return;
      setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onDoc, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDoc, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  const choose = (k) => {
    setLocationKey(k);
    setOpen(false);
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'location_changed', location_key: k });
    } catch {}
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1 rounded-md border border-white/30 bg-black/20 px-2 py-[3px] text-xs text-white hover:bg-white hover:text-black transition"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Current location: ${label}. Click to change.`}
      >
        <span aria-hidden>📍</span>
        <span className="font-semibold">{label}</span>
        <svg className="h-3 w-3 opacity-80" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5.5 7.5l4.5 4.5 4.5-4.5" />
        </svg>
      </button>

      {open && (
        <ul
          ref={popRef}
          role="listbox"
          className="absolute right-0 mt-1 w-36 rounded-md border bg-white py-1 text-xs text-black shadow-lg z-[200]"
        >
          {Object.entries(LOCATIONS).map(([key, v]) => (
            <li key={key}>
              <button
                role="option"
                aria-selected={key === locationKey}
                className={`w-full text-left px-2 py-1.5 hover:bg-gray-100 ${
                  key === locationKey ? 'font-semibold' : ''
                }`}
                onClick={() => choose(key)}
              >
                {v.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Segmented toggle: Westfield | Carmel (compact, sticky-friendly) */
function Segmented({ className = '', tone = 'light', showLabel = false }) {
  const { locationKey, setLocationKey } = useLocationPref();
  const isDark = tone === 'dark';

  const wrap     = `inline-flex items-center gap-2 ${className}`;
  const labelCls = `text-[11px] tracking-wide ${isDark ? 'text-white/70' : 'text-gray-600'}`;
  const groupCls = [
    'loc-group inline-flex rounded-full border p-0.5 transition-colors',
    isDark ? 'bg-white/10 border-white/20' : 'bg-gray-100 border-gray-200'
  ].join(' ');
  const btnBase  = 'loc-btn px-3 py-1 rounded-full text-xs font-semibold transition focus:outline-none focus:ring-2';
  const active   = isDark ? 'bg-white text-black shadow-sm focus:ring-white/60'
                          : 'bg-black text-white shadow-sm focus:ring-black/60';
  const inactive = isDark ? 'text-white/90 hover:bg-white/10 focus:ring-white/30'
                          : 'text-gray-800 hover:bg-gray-200 focus:ring-gray-300';

  const select = (k) => { setLocationKey(k); try{ window.dataLayer?.push({event:'location_changed',location_key:k}); }catch{} };

  const Btn = ({ k, children }) => (
    <button
      type="button"
      role="radio"
      aria-checked={k === locationKey}
      onClick={() => select(k)}
      className={[btnBase, k === locationKey ? active : inactive].join(' ')}
    >
      {children}
    </button>
  );

  return (
    <div className={wrap} role="radiogroup" aria-label="Choose location">
      {showLabel && <span className={labelCls}>Location</span>}
      <div className={groupCls}>
        <Btn k="westfield">Westfield</Btn>
        <Btn k="carmel">Carmel</Btn>
      </div>
    </div>
  );
}



/* ---------- Icon-only button with badge + dropdown (sticky-safe) ---------- */
function IconDropdown({ className = '' }) {
  const { locationKey, setLocationKey } = useLocationPref();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const badge = locationKey ? ABBR[locationKey] : '—';

  useEffect(() => {
    function onDoc(e){
      if (!open) return;
      if (popRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function onKey(e){ if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('pointerdown', onDoc, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDoc, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  return (
    <div className={`relative flex-none ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        /* lock dimensions; avoid parent flex stretching */
        className="loc-icon-btn relative inline-grid place-items-center h-8 w-8 rounded-full
                   border border-white/30 bg-black/20 text-white transition
                   hover:bg-white hover:text-black p-0 leading-none select-none"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change location"
      >
        {/* building icon */}
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M3 18.5V7a2 2 0 0 1 2-2h3V3h4v2h3a2 2 0 0 1 2 2v11.5h-4v-4H7v4H3z" />
          <path d="M8 9h2v2H8zM12 9h2v2h-2zM8 13h2v2H8zM12 13h2v2h-2z" />
        </svg>

        {/* badge */}
        <span className="absolute -top-1 -right-1 rounded-full bg-white text-black
                         text-[10px] font-bold px-1.5 py-[1px] leading-none">
          {badge}
        </span>
      </button>

      {open && (
        <ul
          ref={popRef}
          role="listbox"
          className="absolute right-0 mt-1 w-32 rounded-md border bg-white py-1 text-xs text-black shadow-lg z-[200]"
        >
          {Object.entries(LOCATIONS).map(([key, v]) => (
            <li key={key}>
              <button
                role="option"
                aria-selected={key === locationKey}
                onClick={() => { setLocationKey(key); setOpen(false); }}
                className={`w-full text-left px-2 py-1.5 hover:bg-gray-100 ${key === locationKey ? 'font-semibold' : ''}`}
              >
                {v.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

