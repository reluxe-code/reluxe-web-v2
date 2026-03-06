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

// Global Organization + MedicalBusiness JSON-LD (renders once per page)
const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': ['MedicalBusiness', 'LocalBusiness'],
  '@id': `${BASE_URL}/#organization`,
  name: SITE_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}/images/og/new-default-1200x630.png`,
  image: `${BASE_URL}/images/og/new-default-1200x630.png`,
  description:
    'RELUXE Med Spa offers Botox, fillers, facials, laser treatments, body contouring, and medical-grade skincare at two Indianapolis-area locations in Westfield and Carmel, IN.',
  telephone: '+1-317-763-1142',
  priceRange: '$$',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Cash, Credit Card',
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: { '@type': 'GeoCoordinates', latitude: 39.99, longitude: -86.14 },
    geoRadius: '40000',
    description: 'Indianapolis metro area including Carmel, Westfield, Fishers, Noblesville, and Zionsville',
  },
  sameAs: [
    'https://www.instagram.com/reluxemedspa',
    'https://www.facebook.com/reluxemedspa',
    'https://www.tiktok.com/@reluxemedspa',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Med Spa Services',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Injectables — Botox, Fillers, Lip Augmentation' },
      { '@type': 'OfferCatalog', name: 'Facials — Medical-Grade Facials, Chemical Peels, Glo2Facial' },
      { '@type': 'OfferCatalog', name: 'Laser & Skin — ClearLift, ClearSkin, CO2, SkinIQ' },
      { '@type': 'OfferCatalog', name: 'Body Contouring — EvolveX, Massage' },
    ],
  },
  department: [
    {
      '@type': 'MedicalBusiness',
      name: 'RELUXE Med Spa — Westfield',
      telephone: '+1-317-763-1142',
      url: `${BASE_URL}/locations/westfield`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '514 E State Road 32',
        addressLocality: 'Westfield',
        addressRegion: 'IN',
        postalCode: '46074',
        addressCountry: 'US',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 40.04298, longitude: -86.12955 },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Friday'], opens: '09:00', closes: '17:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday', opens: '09:00', closes: '19:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '15:00' },
      ],
    },
    {
      '@type': 'MedicalBusiness',
      name: 'RELUXE Med Spa — Carmel',
      telephone: '+1-317-763-1142',
      url: `${BASE_URL}/locations/carmel`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '10485 N Pennsylvania St, Suite 150',
        addressLocality: 'Carmel',
        addressRegion: 'IN',
        postalCode: '46280',
        addressCountry: 'US',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 39.94054, longitude: -86.16063 },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00' },
      ],
    },
  ],
};

export default function BetaLayout({
  children, title, description, noindex = false,
  rawTitle, canonical, ogImage, ogType, structuredData,
  minimal = false,
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

        {/* Global Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />

        {/* Page-specific structured data */}
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
            {!minimal && <BetaNavBar fontKey={FONT_KEY} />}
            {typeof children === 'function'
              ? children({ fontKey: FONT_KEY, fonts })
              : children}
            {!minimal && <OldBookingCTA fontKey={FONT_KEY} />}
            {!minimal && <BetaFooter fontKey={FONT_KEY} />}
          </div>
          <LocationChooserModal />
          <MemberDrawerPortal fonts={fonts} />
          {!minimal && <MobileStickyFooter fontKey={FONT_KEY} />}
        </MemberProvider>
      </LocationProvider>
    </>
  );
}

// Export for use in pages that need font info
BetaLayout.fontKey = FONT_KEY;
BetaLayout.fonts = fontPairings[FONT_KEY];
