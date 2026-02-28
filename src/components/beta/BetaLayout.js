import Head from 'next/head';
import { fontPairings, colors } from '@/components/preview/tokens';
import BetaNavBar from '@/components/beta/BetaNavBar';
import BetaFooter from '@/components/beta/BetaFooter';
import OldBookingCTA from '@/components/beta/OldBookingCTA';
import BoulevardScripts from '@/components/booking/BoulevardScripts';
import { LocationProvider } from '@/context/LocationContext';
import { MemberProvider } from '@/context/MemberContext';
import LocationChooserModal from '@/components/location/LocationChooserModal';
import MemberDrawerPortal from '@/components/beta/MemberDrawerPortal';
import MobileStickyFooter from '@/components/beta/MobileStickyFooter';

// Beta uses the "bold" font pairing (Playfair Display + Outfit)
// This can be changed site-wide by updating this single value
const FONT_KEY = 'bold';

const SITE_NAME = 'RELUXE Med Spa';
const BASE_URL = 'https://reluxemedspa.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og/new-default-1200x630.png`;

export default function BetaLayout({
  children, title, description, noindex = false,
  rawTitle, canonical, ogImage, ogType, structuredData,
}) {
  const fonts = fontPairings[FONT_KEY];
  const pageTitle = rawTitle || (title ? `${title} — ${SITE_NAME}` : SITE_NAME);
  const ogTitle = title || SITE_NAME;
  const img = ogImage || DEFAULT_OG_IMAGE;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
        {noindex && <meta name="robots" content="noindex, nofollow" />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="stylesheet" href={fontPairings[FONT_KEY].googleUrl} />

        {canonical && <link rel="canonical" href={canonical} />}

        {/* Open Graph */}
        <meta property="og:title" content={ogTitle} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:image" content={img} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content={ogType || 'website'} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_US" />
        {canonical && <meta property="og:url" content={canonical} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        {description && <meta name="twitter:description" content={description} />}
        <meta name="twitter:image" content={img} />

        {/* Structured Data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </Head>

      <script src="/blvd-widget.js" defer />
      <BoulevardScripts />

      <LocationProvider>
        <MemberProvider>
          <div style={{ backgroundColor: '#fff' }}>
            <BetaNavBar fontKey={FONT_KEY} />
            {typeof children === 'function'
              ? children({ fontKey: FONT_KEY, fonts })
              : children}
            <OldBookingCTA fontKey={FONT_KEY} />
            <BetaFooter fontKey={FONT_KEY} />
          </div>
          <LocationChooserModal />
          <MemberDrawerPortal fonts={fonts} />
          <MobileStickyFooter fontKey={FONT_KEY} />
        </MemberProvider>
      </LocationProvider>
    </>
  );
}

// Export for use in pages that need font info
BetaLayout.fontKey = FONT_KEY;
BetaLayout.fonts = fontPairings[FONT_KEY];
