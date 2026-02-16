// pages/_app.js
import Head from 'next/head'
import PropTypes from 'prop-types'
import Layout from '../components/layout/layout'
import { ScrollToTop } from '../components/scroll'
import '../styles/globals.css'
import '@/lib/fontawesome' // ✅ import once
import { config } from '@fortawesome/fontawesome-svg-core'
import Script from 'next/script'
import 'leaflet/dist/leaflet.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useGAUX } from '@/hooks/useGAUX';

// 🔁 Location preference provider & chooser
import { LocationProvider } from '@/context/LocationContext'
import LocationChooserModal from '@/components/location/LocationChooserModal'

// ✅ Step B: imports for SPA pageview hook
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || ''

config.autoAddCss = false

// ✅ Step B: tiny helpers to send events safely
function sendGAPageview(url) {
  if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return

  window.gtag('event', 'page_view', {
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
  })
}

function sendFBPageview() {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView')
  }
}

function waitForGtag(cb, maxTries = 60) {
  let tries = 0
  const t = setInterval(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function' && window.__gaReady) {
      clearInterval(t)
      cb()
    } else if (++tries >= maxTries) {
      clearInterval(t)
    }
  }, 50)
}



function MyApp({ Component, pageProps }) {
  // ✅ Step B: wire route change pageviews
  useGAUX();
  const router = useRouter()

  useEffect(() => {
  const firstUrl = window.location.pathname + window.location.search

  // IMPORTANT: gtag loads afterInteractive, so wait until it's available
  waitForGtag(() => {
    sendGAPageview(firstUrl)
  })

  // Fire Meta pageview on first load too (pixel may already have fired once; duplicate is acceptable but we can guard)
  if (!window.__fbPageviewSent) {
    sendFBPageview()
    window.__fbPageviewSent = true
  }

  const handleRoute = (url) => {
    sendGAPageview(url)
    sendFBPageview()
  }

  router.events.on('routeChangeComplete', handleRoute)
  router.events.on('hashChangeComplete', handleRoute)

  return () => {
    router.events.off('routeChangeComplete', handleRoute)
    router.events.off('hashChangeComplete', handleRoute)
  }
}, [router.events])

  return (
    <>
      <script src="/blvd-widget.js" defer />
      <Script id="reluxe-track-bootstrap" strategy="afterInteractive">
        {`
          (function(){
            // Always define reluxeTrack so other scripts can call it safely
            if (window.reluxeTrack) return;

            window.reluxeTrack = function(eventName, params){
              try {
                params = params || {};
                params.page_path = params.page_path || window.location.pathname;
                params.page_location = params.page_location || window.location.href;

                // GA4 (if ready)
                if (typeof window.gtag === 'function') {
                  window.gtag('event', eventName, params);
                }

                // Meta (if ready)
                if (typeof window.fbq === 'function') {
                  window.fbq('trackCustom', eventName, params);
                }
              } catch(e){}
            };
          })();
        `}
      </Script>

      {/* =========================
            Google Analytics 4 (gtag)
         ========================= */}
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
              // We disable the automatic page_view to avoid double-counting on SPA navigations.
              gtag('config', '${GA_ID}', { send_page_view: false });
              window.__gaReady = true;
            `}
          </Script>
        </>
      )}

      {/* =========================
            Meta (Facebook) Pixel
         ========================= */}
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
          {/* NoScript fallback for Pixel */}
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

      {/* 1️⃣ Boulevard injector */}
      <Script id="boulevard-injector" strategy="beforeInteractive">
        {`
          (function(a){
            var b = {
              businessId: '8672bc38-4697-42d2-9757-339197257b52',
              gaMeasurementId: 'G-N1TS0FHL8H'
            };
            var c = a.createElement('script');
            var d = a.querySelector('script');
            c.src = 'https://static.joinboulevard.com/injector.min.js';
            c.async = true;
            c.onload = function() {
              if (typeof blvd !== 'undefined') {
                blvd.init(b);
              }
            };
            d.parentNode.insertBefore(c, d);
          })(document);
        `}
      </Script>

      {/* 2️⃣ Intercept /book/* links and open BLVD drawer (location-forcing aware) */}
      <Script id="blvd-booking-link-interceptor" strategy="afterInteractive">
        {`
        (function () {
          // ---- Booking paths by slug (service) ----
          var bookingMap = {
            tox:   { path: '/cart/menu/Injectables: Wrinkle Relaxers (Tox) + Fillers/s_f57a8a20-d32d-4e1a-bb78-5f366dc73cf1', visitType: 'SELF_VISIT' },
            botox: { path: '/cart/menu/Injectables: Wrinkle Relaxers (Tox) + Fillers/s_f57a8a20-d32d-4e1a-bb78-5f366dc73cf1', visitType: 'SELF_VISIT' },
            dysport:{ path: '/cart/menu/Injectables: Wrinkle Relaxers (Tox) + Fillers/s_f57a8a20-d32d-4e1a-bb78-5f366dc73cf1', visitType: 'SELF_VISIT' },
            jeuveau:{ path: '/cart/menu/Injectables: Wrinkle Relaxers (Tox) + Fillers/s_f57a8a20-d32d-4e1a-bb78-5f366dc73cf1', visitType: 'SELF_VISIT' },
            daxxify:{ path: '/cart/menu/Injectables: Wrinkle Relaxers (Tox) + Fillers/s_f57a8a20-d32d-4e1a-bb78-5f366dc73cf1', visitType: 'SELF_VISIT' },
            prp:   { path: '/cart/menu/Injectables:%20Wrinkle%20Relaxers%20%28Tox%29%20%2B%20Fillers/s_55c393d3-4bc7-46ae-a2f8-e696c45eb2f2', visitType: 'SELF_VISIT' },
            filler:{ path: '/cart/menu/Injectables:%20Wrinkle%20Relaxers%20%28Tox%29%20%2B%20Fillers/s_3fd6eb78-f596-486f-a2b0-179e33b424f7', visitType: 'SELF_VISIT' },
            rha:   { path: '/cart/menu/Injectables:%20Wrinkle%20Relaxers%20%28Tox%29%20%2B%20Fillers/s_3fd6eb78-f596-486f-a2b0-179e33b424f7', visitType: 'SELF_VISIT' },
            facialbalancing: { path: '/cart/menu/Consultations%20&%20Follow-Ups/s_0b53c178-1c07-4620-bf6e-505c5f76a24a', visitType: 'SELF_VISIT' },
            'filler-dissolving': { path: '/cart/menu/Injectables:%20Wrinkle%20Relaxers%20%28Tox%29%20%2B%20Fillers/s_c35e5b52-c42d-405e-9676-b56537dc3658', visitType: 'SELF_VISIT' },
            sculptra: { path: '/cart/menu/Injectables:%20Wrinkle%20Relaxers%20%28Tox%29%20%2B%20Fillers/s_40baf4e1-3e0a-4737-8608-518e169e7b8e', visitType: 'SELF_VISIT' },
            consult: { path: '/cart/menu/Consultations%20&%20Follow-Ups', visitType: 'SELF_VISIT' },
            'tox-consult': { path: '/cart/menu/Consultations%20&%20Follow-Ups/s_2f718b9d-27b3-48a6-8877-f29e45ed37d4', visitType: 'SELF_VISIT' },
            massage: { path: '/cart/menu/Massage', visitType: 'SELF_VISIT' },
            '60-minute-choice-massage': { path: '/cart/menu/Massage/s_22296534-3a47-475b-8056-fe911317c22b', visitType: 'SELF_VISIT' },
            intromassage: { path: '/cart/menu/Massage/s_c20c2018-45b2-410d-b160-27a68ca7b2c6', visitType: 'SELF_VISIT' },
            massageintro: { path: '/cart/menu/Massage/s_c20c2018-45b2-410d-b160-27a68ca7b2c6', visitType: 'SELF_VISIT' },
            skinpen: { path: '/cart/menu/Microneedling%20%28Morpheus8%20&%20SkinPen%29/s_9be00f2c-f0c5-4333-abbc-3fb955562838', visitType: 'SELF_VISIT' },
            'lip-flip': { path: '/cart/menu/Injectables:%20Wrinkle%20Relaxers%20%28Tox%29%20%2B%20Fillers/s_93f3a755-5ad7-4d18-8416-c9bf5c0200e6', visitType: 'SELF_VISIT' },
            facials: { path: '/cart/menu/Signature%20Facials,%20Masks,%20Dermaplane,%20&%20Peels', visitType: 'SELF_VISIT' },
            'signature-facial': { path: '/cart/menu/Signature%20Facials,%20Masks,%20Dermaplane,%20&%20Peels/s_3101d014-5a79-418a-80d8-e2c78fcdf541', visitType: 'SELF_VISIT' },
            biorepeel: { path: '/cart/menu/Signature%20Facials,%20Masks,%20Dermaplane,%20&%20Peels/s_712c0f4c-18ba-456f-b313-108115bae7f2', visitType: 'SELF_VISIT' },
            'the-perfect-dermapeel': { path: '/cart/menu/Signature%20Facials,%20Masks,%20Dermaplane,%20&%20Peels/s_aa963e4b-d087-4534-9451-1ee0b535e799', visitType: 'SELF_VISIT' },
            'chemical-peel': { path: '/cart/menu/Signature%20Facials,%20Masks,%20Dermaplane,%20&%20Peels/s_c2626b50-9007-49b4-a701-97aa230f1b2c', visitType: 'SELF_VISIT' },
            dermaplane: { path: '/cart/menu/Signature%20Facials,%20Masks,%20Dermaplane,%20&%20Peels/s_bab15280-f62e-4b30-8f69-fd38310638fa', visitType: 'SELF_VISIT' },
            'lash-lift-tint': { path: '/cart/menu/Signature%20Facials,%20Masks,%20Dermaplane,%20&%20Peels/s_6ce1edab-b912-4bb8-939b-cafbedb4579d', visitType: 'SELF_VISIT' },
            'teen-facial': { path: '/cart/menu/Signature%20Facials,%20Masks,%20Dermaplane,%20&%20Peels/s_5ee35d44-a9a0-4f4b-9a00-7c4406ae855c', visitType: 'SELF_VISIT' },
            hydrafacial: { path: '/cart/menu/Hydrafacial™%20Premium%20Facials', visitType: 'SELF_VISIT' },
            glo2facial: { path: '/cart/menu/Glo2Facial™%20Premium%20Facials', visitType: 'SELF_VISIT' },
            morpheus8: { path: '/cart/menu/Microneedling%20%28Morpheus8%20&%20SkinPen%29/s_f7e2d350-427f-4292-97aa-eb74fc86d228', visitType: 'SELF_VISIT' },
            opus: { path: '/cart/menu/Laser%20Treatments:%20Opus,%20IPL,%20Hair%20Removal,%20ClearLift/s_35e8d13c-516c-4a84-a4b6-2fd81e065d23', visitType: 'SELF_VISIT' },
            'laser-hair-removal': { path: '/cart/menu/Laser%20Treatments:%20Opus,%20IPL,%20Hair%20Removal,%20ClearLift/s_20eba50f-1d8b-434b-bb64-b8fd8bca016e', visitType: 'SELF_VISIT' },
            clearlift: { path: '/cart/menu/Laser%20Treatments:%20Opus,%20IPL,%20Hair%20Removal,%20ClearLift/s_ef2b57db-69d7-49ee-89e9-27475ea1001e', visitType: 'SELF_VISIT' },
            ipl: { path: '/cart/menu/Laser%20Treatments:%20Opus,%20IPL,%20Hair%20Removal,%20ClearLift/s_8f5b3d81-58f0-400e-93dd-c83b0ca60e41', visitType: 'SELF_VISIT' },
            co2: { path: '/cart/menu/Laser%20Treatments%3A%20CO%E2%82%82%2C%20IPL%2C%20ClearLift%2C%20Clearskin%2C%20Vascupen%2C%20Opus', visitType: 'SELF_VISIT' },
            clearskin: { path: '/cart/menu/Laser%20Treatments:%20Opus,%20IPL,%20Hair%20Removal,%20ClearLift/s_0df5eeda-be41-4f67-94d8-1e21a7dacba0', visitType: 'SELF_VISIT' },
            vascupen: { path: '#/cart/menu/Laser%20Treatments:%20Opus,%20IPL,%20Hair%20Removal,%20ClearLift/s_3b9e9259-c659-400d-ac22-d8cd7db3676b', visitType: 'SELF_VISIT' },
            'body-contouring': { path: '/cart/menu/Body%20Contouring%20w%2FEvolveX/s_f132103a-ff13-465c-8e26-6ee2370cb909', visitType: 'SELF_VISIT' },
            'salt-sauna': { path: '/cart/menu/IR%20Sauna%20&%20Salt%20Booth', visitType: 'SELF_VISIT' },
            'refine': { path: '/cart/menu/Consultations%20%26%20Follow-Ups/s_f776cf0e-0e44-4a3f-bcad-8e0125d004a0', visitType: 'SELF_VISIT' },
            'remodel': { path: '/cart/menu/Consultations%20%26%20Follow-Ups/s_38732a5c-cb23-49e0-abb0-b4efa3985e95', visitType: 'SELF_VISIT' },
            'bf25': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals', visitType: 'PACKAGE' },
            'bf25-dysport': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_6e933c7c-92f6-46a9-93cd-cdb232d4b0c1', visitType: 'PACKAGE' },
            'bf25-botox': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_c9b5e156-8363-4070-9d1b-c7e55ea2869c', visitType: 'PACKAGE' },
            'bf25-daxxify': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_2dd356c7-8aa8-40d9-8a7e-991a6c8a2296', visitType: 'PACKAGE' },
            'bf25-jeuveau': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_ea7dd109-8248-4e19-9c71-5146045360a8', visitType: 'PACKAGE' },
            'bf25-m8': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_5ff68818-d3d8-4970-85e0-446b20c6ee10', visitType: 'PACKAGE' },
            'bf25-bank': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_b0dff980-d29c-477c-9e6c-05789b592d08', visitType: 'PACKAGE' },
            'bf25-facial': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_0a0acadf-54f6-4866-9c92-36d221571e60', visitType: 'PACKAGE' },
            'bf25-filler1': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_3eb2ecbd-ca1d-4457-8f2b-c2c4f1942be5', visitType: 'PACKAGE' },
            'bf25-filler2': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_d0a7e7b8-cf24-4da1-abec-1c151ca11c02', visitType: 'PACKAGE' },
            'bf25-filler3': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_560cda51-6d5d-4d21-8d8e-e636eeb092eb', visitType: 'PACKAGE' },
            'bf25-laser': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_032f3b92-2a6c-4673-ba2b-6bc225408742', visitType: 'PACKAGE' },
            'bf25-co2': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_a0e5138e-0b49-48d5-92ed-7edf0e54bb36', visitType: 'PACKAGE' },
            'bf25-texturetone': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_62cc1087-f856-4028-84ba-887e699cb613', visitType: 'PACKAGE' },
            'bf25-massage60': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_46f8b9fe-78d1-4667-a49d-3408486b5900', visitType: 'PACKAGE' },
            'bf25-massage90': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_6aa134fd-a3b7-4b10-b278-8c6a92cc2c5c', visitType: 'PACKAGE' },
            'bf25-glp1': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Deals/p_50a027c8-c7a3-451a-bf1e-51ffab2e7ac3', visitType: 'PACKAGE' },
            'flash-evolvex': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_31e2f89c-71ad-405e-ba50-e030816ba3b4', visitType: 'PACKAGE' },
            'flash-alphabody': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_8698c21e-ec17-4a56-8c63-0539042c99e3', visitType: 'PACKAGE' },
            'flash-massage60': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_75591c33-9d24-45f6-ac26-abbc51ada65f', visitType: 'PACKAGE' },
            'flash-cleanser': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_54ff3ffd-215d-4d63-b22d-5119de2450a9', visitType: 'PACKAGE' },
            'flash-filler': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_ce168096-b95f-4170-9823-391748da7d92', visitType: 'PACKAGE' },
            'flash-ourself': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_7153eec7-ec27-4ebd-b085-f18714538579', visitType: 'PACKAGE' },
            'flash-sauna': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_d613692c-75e1-49ed-923e-06d0f4e4c05b', visitType: 'PACKAGE' },
            'flash-glo2': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_7dc58de4-51bd-43b0-a2d4-f453be37a88d', visitType: 'PACKAGE' },
            'flash-b12': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_1f1dd391-9cc6-4e2e-8571-b43037fba36c', visitType: 'PACKAGE' },
            'flash-100member': { path: '/cart/menu/Memberships/p_5cf9fb30-b95b-4170-a2c3-d27733f076f6', visitType: 'MEMBERSHIP' },
            'flash-200member': { path: '/cart/menu/Memberships/p_0ae4c58f-1799-4a67-842a-02a97b2debb7', visitType: 'MEMBERSHIP' },
            'flash-lhr-large': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_e338ea14-0494-4f77-b886-ab7e85d09017', visitType: 'PACKAGE' },
            'flash-lhr-standard': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_ad1ce0cb-d07a-4e54-98a9-5d47a3e903fd', visitType: 'PACKAGE' },
            'flash-lhr-small': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_8389cc63-df4d-4ca6-a701-42ecfe599dc8', visitType: 'PACKAGE' },
            'flash-iv': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_275fcd15-95a9-42e7-ba38-f7c5a05e08d7', visitType: 'PACKAGE' },            
            'flash-hbot': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_ae367f63-63a7-47f9-a334-d6896e44b3a8', visitType: 'PACKAGE' },            
            'flash-free': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_02e9a193-aa38-4006-a949-7cd7f1b6f469', visitType: 'PACKAGE' },
            'flash-uskin': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_65dd8381-e819-41ac-9c4f-3724ee343828', visitType: 'PACKAGE' },
            'flash-ateam': { path: '/cart/menu/2025%20Black%20Friday%20%2F%20Cyber%20Monday%20Flash%20Sales/p_c308d08f-b3d3-4189-8973-0d56f434794a', visitType: 'PACKAGE' },
            'hoh-skinny': { path: '/cart/menu/Black%20Friday%20%2F%20Cyber%20Monday%20House%20of%20Health/p_97b05eaf-8edd-4d8a-a874-2c538851ce58', visitType: 'PACKAGE' },
            'hoh-hbot10': { path: '/cart/menu/Black%20Friday%20%2F%20Cyber%20Monday%20House%20of%20Health/p_6ba00964-64d2-4a28-a673-860cd9f2eb80', visitType: 'PACKAGE' },
            'hoh-hbot40': { path: '/cart/menu/Black%20Friday%20%2F%20Cyber%20Monday%20House%20of%20Health/p_63c9b2bc-7253-4c6f-b27e-163bafb99dd1', visitType: 'PACKAGE' },
            'hoh-thermography': { path: '/cart/menu/Black%20Friday%20%2F%20Cyber%20Monday%20House%20of%20Health/p_56fcea06-c6b2-49d6-8fe6-83781e75f8e7', visitType: 'PACKAGE' },
            'hoh-immunity': { path: '/cart/menu/Black%20Friday%20%2F%20Cyber%20Monday%20House%20of%20Health/p_fb2a3138-f11d-41d5-9d9a-71bc31c68096', visitType: 'PACKAGE' },
            'hoh-nad5': { path: '/cart/menu/Black%20Friday%20%2F%20Cyber%20Monday%20House%20of%20Health/p_ba7d85bd-5b28-4873-a6d5-3a18c201c42e', visitType: 'PACKAGE' },
            '': { path: '/cart/menu', visitType: 'SELF_VISIT' }
          };

          var LOCATION_IDS = {
            westfield: 'cf34bcaa-6702-46c6-9f5f-43be8943cc58',
            carmel: '3ce18260-2e1f-4beb-8fcf-341bc85a682c'
          };

          function readCookie(name){
            var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
            return m ? decodeURIComponent(m[1]) : null;
          }

          function setPreferredLocation(loc){
            try { localStorage.setItem('reluxeLocation', loc); } catch(e){}
            try { localStorage.setItem('reluxe.location', loc); } catch(e){}
            try { document.cookie = 'reluxeLocation=' + loc + '; path=/; max-age=31536000'; } catch(e){}
            try { document.cookie = 'reluxe_location=' + loc + '; path=/; max-age=31536000'; } catch(e){}
          }

          function LOCATIONIDS_HAS(k){ return Object.prototype.hasOwnProperty.call(LOCATION_IDS, k); }

          function getPreferredLocationKey(){
            try {
              var params = new URLSearchParams(location.search);
              var locq = params.get('loc');
              if (locq && LOCATIONIDS_HAS(locq)) return locq; // query wins for overrides
            } catch(e){}
            var ck = readCookie('reluxeLocation') || readCookie('reluxe_location');
            if (ck && LOCATIONIDS_HAS(ck)) return ck;
            try {
              var ls = localStorage.getItem('reluxeLocation') || localStorage.getItem('reluxe.location');
              if (ls && LOCATIONIDS_HAS(ls)) return ls;
            } catch(e){}
            return null;
          }

          function whenBlvdReady(cb){
            if (typeof blvd !== 'undefined' && blvd) return cb();
            var tries = 0, max = 100;
            var iv = setInterval(function(){
              if (typeof blvd !== 'undefined' && blvd) { clearInterval(iv); cb(); }
              else if (++tries >= max) { clearInterval(iv); }
            }, 50);
          }

          // Open booking; overrideLocKey can be 'carmel' or 'westfield'
          function openBookingForSlug(slug, overrideLocKey){
            slug = String(slug || '').toLowerCase();
            var cfg = bookingMap[slug] || bookingMap[''];
            if (!cfg) return false;

            var locKey = overrideLocKey || getPreferredLocationKey();
            if (!locKey) {
              try { window.dispatchEvent(new CustomEvent('open-location-chooser', { detail: { slug: slug } })); } catch(e){}
              return true;
            }

            var locationId = LOCATION_IDS[locKey];
            if (!locationId || !blvd || !blvd.openBookingWidget) return false;

            blvd.openBookingWidget({ urlParams: { locationId: locationId, path: cfg.path, visitType: cfg.visitType } });

            try {
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({ event: 'begin_checkout', method: 'blvd_drawer', service_slug: slug, service_path: cfg.path, location_id: locationId });
            } catch(e){}

            return true;
          }

          // Expose for React
          window.bookingMap = bookingMap;
          window.__openBlvdForSlug = function(slug, overrideLocKey){ whenBlvdReady(function(){ openBookingForSlug(slug, overrideLocKey); }); };

          function isBookHref(href){
            if (!href) return false;
            try {
              var u = new URL(href, location.origin);
              return u.origin === location.origin && u.pathname.startsWith('/book');
            } catch(e){ return false; }
          }

          // Parse /book/* and ?loc=; return { slug, locFromPath, locFromQuery }
          function parseBookUrl(urlLike){
            var u = new URL(urlLike, location.origin);
            var parts = u.pathname.split('/').filter(Boolean); // ['book', 'carmel', 'tox']
            var slug = '';
            var locFromPath = null;

            if (parts[0] === 'book') {
              if (parts[1] === 'carmel' || parts[1] === 'westfield') {
                locFromPath = parts[1];
                slug = parts[2] || '';
              } else {
                slug = parts[1] || '';
              }
            }

            var locFromQuery = (u.searchParams.get('loc') || '').toLowerCase();
            if (!(locFromQuery === 'carmel' || locFromQuery === 'westfield')) locFromQuery = null;

            return { slug: slug, locFromPath: locFromPath, locFromQuery: locFromQuery };
          }

          // Main handler; if location is in the path => persist; if via data-attr or query => override only
          function handleBook(urlLike, preventers, attrOverride){
            var parsed = parseBookUrl(urlLike);
            var override = attrOverride || parsed.locFromQuery || null;

            if (preventers) preventers.forEach(function(p){ try{ p(); }catch(e){} });

            // Persist preference ONLY if location is in the path:
            if (parsed.locFromPath) setPreferredLocation(parsed.locFromPath);

            whenBlvdReady(function(){
              openBookingForSlug(parsed.slug, override || parsed.locFromPath || null);
            });
          }

          // ---- Intercept clicks to /book/*; respect data-book-loc/data-loc override ----
          function captureHandler(e){
            var t = e.target && e.target.closest ? e.target.closest('a[href],button[data-book-loc],button[data-loc]') : null;
            if (!t) return;

            var attrOverride = (t.getAttribute('data-book-loc') || t.getAttribute('data-loc') || '').toLowerCase();
            if (attrOverride && !(attrOverride === 'carmel' || attrOverride === 'westfield')) attrOverride = null;

            var href = t.getAttribute('href');
            // If it's an anchor with a /book href, intercept
            if (href && isBookHref(href)) {
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
              handleBook(href, null, attrOverride);
              return;
            }

            // If it's a button with only a data override + optional data-slug, open directly
            var dataSlug = (t.getAttribute && t.getAttribute('data-slug')) || '';
            if (attrOverride && dataSlug) {
              e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
              whenBlvdReady(function(){ openBookingForSlug(String(dataSlug).toLowerCase(), attrOverride); });
            }
          }
          document.addEventListener('click', captureHandler, true);
          document.addEventListener('pointerdown', captureHandler, true);

          // Keyboard activation for focused anchors
          document.addEventListener('keydown', function(e){
            if (e.key !== 'Enter' && e.key !== ' ') return;
            var el = document.activeElement;
            if (el && el.matches && el.matches('a[href]') && isBookHref(el.getAttribute('href'))){
              var attrOverride = (el.getAttribute('data-book-loc') || el.getAttribute('data-loc') || '').toLowerCase();
              if (attrOverride && !(attrOverride === 'carmel' || attrOverride === 'westfield')) attrOverride = null;
              e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
              handleBook(el.getAttribute('href'), null, attrOverride);
            }
          }, true);

          // ---- Direct landings on /book or /book/* ----
          if (location.pathname === '/book' || location.pathname.startsWith('/book/')) {
            var parsed = parseBookUrl(location.href);
            // Persist only if location is in the PATH; ignore query for persistence
            if (parsed.locFromPath) setPreferredLocation(parsed.locFromPath);
            whenBlvdReady(function(){
              if (openBookingForSlug(parsed.slug, parsed.locFromQuery || parsed.locFromPath || null)) {
                var ref, fallback = '/';
                try {
                  ref = document.referrer ? new URL(document.referrer) : null;
                  if (ref && ref.origin === location.origin) fallback = ref.pathname + ref.search + ref.hash;
                } catch(e){}
                try { history.replaceState({}, '', fallback); } catch(e){}
              }
            });
          }

          // ✅ Auto-open on /services/<slug>?book=1 (now also honors ?loc=)
          (function(){
            var params = new URLSearchParams(location.search);
            if (!params.has('book')) return;
            var parts = location.pathname.replace(/\\/+$/,'').split('/').filter(Boolean);
            if (parts[0] === 'services' && parts[1]) {
              var slug2 = parts[1].toLowerCase();
              var locOverride = (params.get('loc') || '').toLowerCase();
              if (!(locOverride === 'carmel' || locOverride === 'westfield')) locOverride = null;
              whenBlvdReady(function(){
                if (openBookingForSlug(slug2, locOverride)) {
                  params.delete('book');
                  var newUrl = location.pathname + (params.toString() ? ('?' + params.toString()) : '') + location.hash;
                  try { history.replaceState({}, '', newUrl); } catch(e){}
                }
              });
            }
          })();

        })();
        `}
        </Script>


      {/* 3️⃣ BLVD analytics shims */}
      {/* —— Wrap open() so every widget open logs —— */}
      <Script id="blvd-analytics-wrap" strategy="afterInteractive">
        {`
          (function() {
            var _open = null;
            function wrap(){
              if (!_open && window.blvd && typeof blvd.openBookingWidget === 'function') {
                _open = blvd.openBookingWidget;
                blvd.openBookingWidget = function(opts){
                  try {
                    window.dataLayer = window.dataLayer || [];
                    var payload = {
                      location_id: opts?.urlParams?.locationId || undefined,
                      service_path: opts?.urlParams?.path || undefined,
                      visit_type: opts?.urlParams?.visitType || undefined,
                      method: 'blvd_drawer'
                    };

                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({ event: 'booking_widget_open', ...payload });

                    // ✅ Also send to GA4/Meta (no GTM required)
                    if (window.reluxeTrack) window.reluxeTrack('booking_widget_open', payload);

                  } catch(e){}
                  return _open.apply(this, arguments);
                };
              }
            }
            var t = setInterval(function(){
              if (window.blvd) { clearInterval(t); wrap(); }
            }, 50);
          })();
        `}
      </Script>

      {/* —— Observe overlay visible/close —— */}
      <Script id="blvd-observer" strategy="afterInteractive">
        {`
          (function(){
            var overlaySelector = '[class*="blvd-overlay"], [id*="blvd"], .blvd-modal';
            var isOpen = false, lastOpenAt = 0;

           function fire(evt, extra){
              try {
                extra = extra || {};
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push(Object.assign({ event: evt }, extra));

                // ✅ Also send to GA4/Meta
                if (window.reluxeTrack) window.reluxeTrack(evt, extra);
              } catch(e){}
            }


            var mo = new MutationObserver(function(){
              var node = document.querySelector(overlaySelector);
              if (node && !isOpen) {
                isOpen = true; lastOpenAt = Date.now();
                fire('booking_widget_visible');
                node.addEventListener('click', function(e){
                  var t = e.target.closest('button,[role="button"]');
                  if (!t) return;
                  var txt = (t.textContent||'').trim().toLowerCase();
                  if (txt.includes('continue') || txt.includes('next')) fire('booking_widget_step', { step_name: 'continue' });
                  if (txt.includes('book') || txt.includes('confirm')) fire('booking_widget_step', { step_name: 'confirm' });
                  if (txt.includes('back')) fire('booking_widget_step', { step_name: 'back' });
                }, true);
              } else if (!node && isOpen) {
                isOpen = false;
                var dur = Date.now() - lastOpenAt;
                fire('booking_widget_close', { reason: 'overlay_removed', duration_ms: dur });
              }
            });

            mo.observe(document.documentElement, { childList: true, subtree: true });
          })();
        `}
      </Script>

      {/* —— Detect submit (confirmation UI) —— */}
      <Script id="blvd-submit-detect" strategy="afterInteractive">
        {`
          (function(){
            var mo = new MutationObserver(function(){
              var n = document.querySelector('[class*="confirmation"], [data-test="booking-confirmation"]');
              if (n) {
                try {
                  window.dataLayer = window.dataLayer || [];
                  window.dataLayer.push({ event: 'booking_widget_submit', success: true });

                  // ✅ Also send to GA4/Meta
                  if (window.reluxeTrack) window.reluxeTrack('booking_widget_submit', { success: true });

                } catch(e){}
              }
            });
            mo.observe(document.documentElement, { childList: true, subtree: true });
          })();
        `}
      </Script>

      {/* Wrap the site so React can read/set preference */}
      <LocationProvider>
        <Layout>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="shortcut icon" href="/favicon.png" />
          </Head>

          <Component {...pageProps} />
          <ScrollToTop />

          {/* First-time chooser modal lives at app root */}
          <LocationChooserModal />
        </Layout>
      </LocationProvider>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
}

export default MyApp
