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

// 🔁 Location preference provider & chooser
import { LocationProvider } from '@/context/LocationContext'
import LocationChooserModal from '@/components/location/LocationChooserModal'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || ''

config.autoAddCss = false

function MyApp({ Component, pageProps }) {
  return (
    <>
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
              fbq('track', 'PageView');
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

      {/* 2️⃣ Intercept /book/* links and open BLVD drawer using preferred location */}
      <Script id="blvd-booking-link-interceptor" strategy="afterInteractive">
        {`
      (function () {
        // ---- Booking paths by slug (location resolved at runtime) ----
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
          clearskin: { path: '/cart/menu/Laser%20Treatments:%20Opus,%20IPL,%20Hair%20Removal,%20ClearLift/s_0df5eeda-be41-4f67-94d8-1e21a7dacba0', visitType: 'SELF_VISIT' },
          vascupen: { path: '#/cart/menu/Laser%20Treatments:%20Opus,%20IPL,%20Hair%20Removal,%20ClearLift/s_3b9e9259-c659-400d-ac22-d8cd7db3676b', visitType: 'SELF_VISIT' },
          'body-contouring': { path: '/cart/menu/Body%20Contouring%20w%2FEvolveX/s_f132103a-ff13-465c-8e26-6ee2370cb909', visitType: 'SELF_VISIT' },
          'salt-sauna': { path: '/cart/menu/IR%20Sauna%20&%20Salt%20Booth', visitType: 'SELF_VISIT' },
          '': { path: '/cart/menu', visitType: 'SELF_VISIT' }
        };

        // Preferred location (cookie/localStorage)
        var LOCATION_IDS = {
          westfield: 'cf34bcaa-6702-46c6-9f5f-43be8943cc58',
          carmel: '3ce18260-2e1f-4beb-8fcf-341bc85a682c'
        };

        function readCookie(name){
          var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
          return m ? decodeURIComponent(m[1]) : null;
        }

        function getPreferredLocationKey(){
          try {
            var params = new URLSearchParams(location.search);
            var loc = params.get('loc');
            if (loc && LOCATION_IDS[loc]) return loc;
          } catch(e){}
          var ck = readCookie('reluxeLocation');
          if (ck && LOCATION_IDS[ck]) return ck;
          try {
            var ls = localStorage.getItem('reluxeLocation');
            if (ls && LOCATION_IDS[ls]) return ls;
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

        function openBookingForSlug(slug){
          slug = String(slug || '').toLowerCase();
          var cfg = bookingMap[slug] || bookingMap[''];
          if (!cfg) return false;

          var locKey = getPreferredLocationKey();
          if (!locKey) {
            // ask React to open chooser, and continue booking after selection
            try { window.dispatchEvent(new CustomEvent('open-location-chooser', { detail: { slug: slug } })); } catch(e){}
            return true;
          }

          var locationId = LOCATION_IDS[locKey];
          if (!locationId || !blvd || !blvd.openBookingWidget) return false;

          blvd.openBookingWidget({ urlParams: { locationId: locationId, path: cfg.path, visitType: cfg.visitType } });

          // 🔑 Analytics event
          try {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'begin_checkout', method: 'blvd_drawer', service_slug: slug, service_path: cfg.path, location_id: locationId });
          } catch(e){}

          return true;
        }

        // Expose globally in case you want to trigger from React
        window.bookingMap = bookingMap;
        window.__openBlvdForSlug = function(slug){ whenBlvdReady(function(){ openBookingForSlug(slug); }); };

        function isBookHref(href){
          if (!href) return false;
          try {
            var u = new URL(href, location.origin);
            return u.origin === location.origin && u.pathname.startsWith('/book');
          } catch(e){ return false; }
        }

        function handleBook(urlLike, preventers){
          var url = new URL(urlLike, location.origin);
          var parts = url.pathname.split('/').filter(Boolean); // ['book','skinpen']
          var slug = parts[1] || '';
          if (preventers) preventers.forEach(function(p){ try{ p(); }catch(e){} });
          whenBlvdReady(function(){ openBookingForSlug(slug); });
        }

        // ---- Intercept clicks to /book/* (prevents navigation) ----
        function captureHandler(e){
          var t = e.target && e.target.closest ? e.target.closest('a[href]') : null;
          if (!t) return;
          var href = t.getAttribute('href');
          if (!isBookHref(href)) return;
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          var preventers = [
            function(){ e.preventDefault(); },
            function(){ e.stopPropagation(); },
            function(){ if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
          ];
          handleBook(href, preventers);
        }
        document.addEventListener('click', captureHandler, true);
        document.addEventListener('pointerdown', captureHandler, true);
        document.addEventListener('keydown', function(e){
          if (e.key !== 'Enter' && e.key !== ' ') return;
          var el = document.activeElement;
          if (el && el.matches && el.matches('a[href]') && isBookHref(el.getAttribute('href'))){
            e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            handleBook(el.getAttribute('href'));
          }
        }, true);

        // ---- Direct landings on /book or /book/<slug> ----
        if (location.pathname === '/book' || location.pathname.startsWith('/book/')) {
          var p1 = location.pathname.split('/').filter(Boolean);
          var slug1 = p1[1] || '';
          whenBlvdReady(function(){
            if (openBookingForSlug(slug1)) {
              // visually restore URL (no reload)
              var ref, fallback = '/';
              try {
                ref = document.referrer ? new URL(document.referrer) : null;
                if (ref && ref.origin === location.origin) fallback = ref.pathname + ref.search + ref.hash;
              } catch(e){}
              try { history.replaceState({}, '', fallback); } catch(e){}
            }
          });
        }

        // ✅ Auto-open on /services/<slug>?book=1 (or any ?book)
        (function(){
          var params = new URLSearchParams(location.search);
          if (!params.has('book')) return;
          var parts = location.pathname.replace(/\\/+$/,'').split('/').filter(Boolean);
          if (parts[0] === 'services' && parts[1]) {
            var slug2 = parts[1].toLowerCase();
            whenBlvdReady(function(){
              if (openBookingForSlug(slug2)) {
                // remove ?book from the URL to avoid re-opening on refresh
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
    </>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
}

export default MyApp