// src/components/analytics/AnalyticsScripts.js
// GA4 + Meta Pixel + Bird <Script> tags, extracted from _app.js
import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || ''
const BIRD_CONFIG_URL = process.env.NEXT_PUBLIC_BIRD_CONFIG_URL || ''
const IS_DEV = process.env.NODE_ENV === 'development'

export default function AnalyticsScripts() {
  return (
    <>
      <Script id="reluxe-track-bootstrap" strategy="afterInteractive">
        {`
          (function(){
            if (window.reluxeTrack) return;
            window.reluxeTrack = function(eventName, params){
              try {
                params = params || {};
                params.page_path = params.page_path || window.location.pathname;
                params.page_location = params.page_location || window.location.href;
                if (typeof window.gtag === 'function') {
                  window.gtag('event', eventName, params);
                }
                if (typeof window.fbq === 'function') {
                  window.fbq('trackCustom', eventName, params);
                }
                if (typeof window.Bird !== 'undefined' && window.Bird.tracker) {
                  try { window.Bird.tracker.custom.trackEvent(eventName, params); } catch(e){}
                }
              } catch(e){}
            };
          })();
        `}
      </Script>

      {/* GA4 Consent Mode v2 defaults — must come before gtag config */}
      {GA_ID && (
        <Script id="ga-consent-defaults" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'granted',
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
              functionality_storage: 'granted',
              personalization_storage: 'granted',
              security_storage: 'granted',
            });
          `}
        </Script>
      )}

      {/* Google Analytics 4 (gtag) */}
      {GA_ID && (
        <>
          <Script
            id="ga-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: false${IS_DEV ? ", debug_mode: true" : ''} });
              window.__gaReady = true;
            `}
          </Script>
        </>
      )}

      {/* Meta (Facebook) Pixel */}
      {FB_PIXEL_ID && (
        <>
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){
                if(f.fbq)return; n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0';
                n.queue=[]; t=b.createElement(e); t.async=!0;
                t.src=v; s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)
              }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${FB_PIXEL_ID}');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Bird Web SDK */}
      {BIRD_CONFIG_URL && (
        <Script
          id="bird-sdk"
          src="https://embeddables.p.mbirdcdn.net/sdk/v0/bird-sdk.js"
          data-config-url={BIRD_CONFIG_URL}
          strategy="afterInteractive"
        />
      )}
    </>
  )
}

export { GA_ID, FB_PIXEL_ID }
