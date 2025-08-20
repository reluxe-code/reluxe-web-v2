// src/components/common/ExtraScripts.js
import Script from 'next/script'

export default function ExtraScripts() {
  return (
    <>
      {/* Boulevard Self-Booking Overlay */}
      <Script id="boulevard-overlay" strategy="afterInteractive">
        {`
          (function (a) {
            var b = {
              businessId: '8672bc38-4697-42d2-9757-339197257b52',
              gaMeasurementId: 'G-N1TS0FHL8H',
            };
            var c = a.createElement('script');
            var d = a.querySelector('script');
            c.src = 'https://static.joinboulevard.com/injector.min.js';
            c.async = true;
            c.onload = function () {
              blvd.init(b);
            };
            d.parentNode.insertBefore(c, d);
          })(document);
        `}
      </Script>
    </>
  )
}
