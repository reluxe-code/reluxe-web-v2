import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ForceLocation({ loc }) {
  const router = useRouter();

  useEffect(() => {
    // force while this page is mounted
    window.__forceLocation = loc;         // 'carmel' | 'westfield'
    return () => { delete window.__forceLocation; };
  }, [loc]);

  // extra safety: clear on SPA navigations out of the page
  useEffect(() => {
    const clear = () => { delete window.__forceLocation; };
    router.events.on('routeChangeStart', clear);
    return () => router.events.off('routeChangeStart', clear);
  }, [router.events]);

  return null;
}
