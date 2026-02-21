import Head from 'next/head';
import { fontPairings, colors } from '@/components/preview/tokens';
import BetaNavBar from '@/components/beta/BetaNavBar';
import BetaFooter from '@/components/beta/BetaFooter';
import BoulevardScripts from '@/components/booking/BoulevardScripts';
import { LocationProvider } from '@/context/LocationContext';
import { MemberProvider } from '@/context/MemberContext';
import LocationChooserModal from '@/components/location/LocationChooserModal';
import MemberDrawerPortal from '@/components/beta/MemberDrawerPortal';

// Beta uses the "bold" font pairing (Playfair Display + Outfit)
// This can be changed site-wide by updating this single value
const FONT_KEY = 'bold';

export default function BetaLayout({ children, title, description, noindex = true }) {
  const fonts = fontPairings[FONT_KEY];

  return (
    <>
      <Head>
        <title>{title ? `${title} — RELUXE Med Spa` : 'RELUXE Med Spa'}</title>
        {description && <meta name="description" content={description} />}
        {noindex && <meta name="robots" content="noindex, nofollow" />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="stylesheet" href={fontPairings[FONT_KEY].googleUrl} />
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
            <BetaFooter fontKey={FONT_KEY} />
          </div>
          <LocationChooserModal />
          <MemberDrawerPortal fonts={fonts} />
        </MemberProvider>
      </LocationProvider>
    </>
  );
}

// Export for use in pages that need font info
BetaLayout.fontKey = FONT_KEY;
BetaLayout.fonts = fontPairings[FONT_KEY];
