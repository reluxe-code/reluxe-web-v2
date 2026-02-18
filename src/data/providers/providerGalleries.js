// src/data/providerGalleries.js

// 👇 Replace these paths with your real image files.
export const providerGalleries = {
  default: [
    { id: 'd1', src: '/images/gallery/placeholder.png', alt: 'RELUXE Med Spa treatment result' },
    { id: 'd2', src: '/images/gallery/placeholder.png', alt: 'RELUXE Med Spa treatment result' },
    { id: 'd3', src: '/images/gallery/placeholder.png', alt: 'RELUXE Med Spa treatment result' },
    { id: 'd4', src: '/images/gallery/placeholder.png', alt: 'RELUXE Med Spa treatment result' },
    { id: 'd5', src: '/images/gallery/placeholder.png', alt: 'RELUXE Med Spa treatment result' },
    { id: 'd6', src: '/images/gallery/placeholder.png', alt: 'RELUXE Med Spa treatment result' },
  ],

  // Injectors (examples—update to match your staff slugs)
  Hannah: [
    { id: 'h1', src: '/images/results/filler/injector.hannah - 1.png', alt: 'Hannah — lips' },
    { id: 'h2', src: '/images/results/filler/injector.hannah - 4.png', alt: 'Hannah — lips' },
    { id: 'h3', src: '/images/results/filler/injector.hannah - 7.png', alt: 'Hannah — lips' },
    { id: 'h4', src: '/images/results/filler/injector.hannah - 16.png', alt: 'Hannah — lips' },
    { id: 'h5', src: '/images/results/filler/injector.hannah - 22.png', alt: 'Hannah — lips' },
    { id: 'h6', src: '/images/results/m8/injector.hannah - 28.png', alt: 'Hannah — Morpheus8' },
    { id: 'h7', src: '/images/results/m8/injector.hannah - 29.png', alt: 'Hannah — Morpheus8' },
    { id: 'h8', src: '/images/results/tox/injector.hannah - 25.png', alt: 'Hannah — Tox' },
    { id: 'h9', src: '/images/results/tox/injector.hannah - 26.png', alt: 'Hannah — Tox' },
    { id: 'h10', src: '/images/results/tox/injector.hannah - 27.png', alt: 'Hannah — Tox' },
    { id: 'h11', src: '/images/results/tox/injector.hannah - 30.png', alt: 'Hannah — Tox' },
  ],

  Krista: [
    { id: 'k1', src: '/images/results/tox/injector.krista - 01.png', alt: 'Krista — lips' },
    { id: 'k2', src: '/images/results/m8/injector.krista - 01.png', alt: 'Krista — Morpheus8' },
  ],

  Alexis: [
    { id: 'a1', src: '/images/results/filler/alexis - 01.jpeg', alt: 'Alexis — Filler' },
  ],
   
  Laci: [
    { id: 'a1', src: '/images/results/vascupen/laci - 01.jpeg', alt: 'Laci — Vascupen' },
  ],
};

/**
 * Deterministically rotate a provider’s gallery.
 * Pass a stable rotationKey from the page (e.g., date string, ISO week) to avoid hydration mismatch.
 * If no rotationKey is provided, we return the first `limit` images as-is.
 */
export function getProviderResults(providerSlug, { limit = 6, rotationKey } = {}) {
  const list = providerGalleries[providerSlug] || providerGalleries.default;
  if (!list?.length) return [];

  if (rotationKey == null) {
    return list.slice(0, limit);
  }

  const idx = positiveHash(`${providerSlug}-${rotationKey}`) % list.length;
  const rotated = [...list.slice(idx), ...list.slice(0, idx)];
  return rotated.slice(0, limit);
}

function positiveHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // 32-bit
  }
  return Math.abs(h);
}
