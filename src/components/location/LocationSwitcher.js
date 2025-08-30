// src/components/location/LocationSwitcher.js
import { useState } from 'react';
import { useLocationPref } from '@/context/LocationContext';
import { LOCATIONS } from '@/lib/location';

export default function LocationSwitcher({ className = '' }) {
  const { locationKey, setLocationKey } = useLocationPref();
  const [open, setOpen] = useState(false);
  const currentLabel = locationKey ? LOCATIONS[locationKey].label : 'Choose…';

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-white/30 px-3 py-2 text-sm text-white hover:bg-white hover:text-black transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="opacity-80">📍</span>
        <strong className="tracking-wide">{currentLabel}</strong>
        <svg width="14" height="14" viewBox="0 0 20 20" className="opacity-80"><path fill="currentColor" d="M5.5 7.5l4.5 4.5 4.5-4.5"/></svg>
      </button>

      {open && (
        <ul role="listbox" className="absolute right-0 mt-2 w-44 rounded-md border bg-white py-1 text-sm shadow-lg z-50">
          {Object.entries(LOCATIONS).map(([key, v]) => (
            <li key={key}>
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => { setLocationKey(key); setOpen(false); }}
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
