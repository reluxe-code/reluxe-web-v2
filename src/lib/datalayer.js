// lib/datalayer.js
export const dl = (payload = {}) => {
  if (typeof window === 'undefined') return; // SSR guard
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
};

// Convenience wrappers (optional)
export const trackPageView = (url) =>
  dl({ event: 'page_view', page_location: window.location.href, page_path: url, page_title: document.title });

export const trackLead = ({ form_id, method = 'form', value }) =>
  dl({ event: 'generate_lead', form_id, method, ...(value ? { value } : {}) });

export const trackContact = ({ channel, value }) =>
  dl({ event: 'contact', channel, value });

export const trackCTA = ({ name, location, service_slug, extra }) =>
  dl({ event: 'cta_click', name, location, ...(service_slug && { service_slug }), ...(extra || {}) });

export const trackBeginCheckout = ({ method = 'blvd_drawer', service_slug, location }) =>
  dl({ event: 'begin_checkout', method, ...(service_slug && { service_slug }), ...(location && { location }) });

export const trackViewContent = ({ content_type, content_id, content_name }) =>
  dl({ event: 'view_content', content_type, content_id, content_name });

export const trackDownload = ({ file_name, file_url }) =>
  dl({ event: 'file_download', file_name, file_url });

export const trackVideo = ({ action, video_title, video_url, percent }) =>
  dl({ event: 'video', action, video_title, video_url, ...(percent ? { percent } : {}) });
