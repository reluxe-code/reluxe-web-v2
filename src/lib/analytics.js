// lib/analytics.js
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '';

export const pageview = (url) => {
  if (!GA_ID) return;
  window.gtag('config', GA_ID, { page_path: url });
};

export const fbPageView = () => {
  if (!FB_PIXEL_ID) return;
  window.fbq('track', 'PageView');
};

// example custom event
export const fbTrack = (name, options = {}) => {
  if (!FB_PIXEL_ID) return;
  window.fbq('track', name, options);
};

export const gaEvent = ({ action, category, label, value }) => {
  if (!GA_ID) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};
