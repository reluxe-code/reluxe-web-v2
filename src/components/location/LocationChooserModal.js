// src/components/location/LocationChooserModal.js
import { useEffect, useState } from 'react';
import { useLocationPref } from '@/context/LocationContext';
import { LOCATIONS } from '@/lib/location';

export default function LocationChooserModal() {
  const { setLocationKey } = useLocationPref();
  const [open, setOpen] = useState(false);
  const [pendingSlug, setPendingSlug] = useState('');

  useEffect(() => {
    function onOpen(e) {
      setPendingSlug(e?.detail?.slug || '');
      setOpen(true);
    }
    window.addEventListener('open-location-chooser', onOpen);
    return () => window.removeEventListener('open-location-chooser', onOpen);
  }, []);

  function choose(key) {
    setLocationKey(key);
    setOpen(false);
    if (pendingSlug && window.__openBlvdForSlug) {
      window.__openBlvdForSlug(pendingSlug);
      setPendingSlug('');
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-2">Choose your location</h3>
        <p className="text-sm text-neutral-600 mb-4">We’ll remember your choice for faster booking.</p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(LOCATIONS).map(([key, v]) => (
            <button
              key={key}
              className="rounded-lg border px-4 py-3 text-center font-semibold hover:bg-gray-50"
              onClick={() => choose(key)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <button className="mt-4 text-sm text-neutral-500 hover:underline" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
