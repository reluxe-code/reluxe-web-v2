import { useEffect, useRef } from 'react';

export default function TrustIndexWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Inject the Trustindex loader into THIS container
    const s = document.createElement('script');
    s.src = 'https://cdn.trustindex.io/loader.js?31a52a251b0731327d765a35da3';
    s.async = true;
    // (Optional) if Trustindex provides a <div> placeholder snippet, put it here:
    // const placeholder = document.createElement('div');
    // placeholder.className = 'ti-widget';
    // containerRef.current.appendChild(placeholder);

    containerRef.current?.appendChild(s);
    return () => {
      // Clean up on unmount
      if (s.parentNode) s.parentNode.removeChild(s);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="ti-widget-container" // your styles here
      aria-label="RELUXE Reviews"
    />
  );
}
