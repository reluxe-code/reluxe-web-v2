import StartPageLayout from '@/components/booking/StartPageLayout';
import StartBookingFlow from '@/components/booking/StartBookingFlow';
import { START_FONTS, buildLocationOptions } from '@/lib/start-booking';

export default function StartFlowPage({
  providers = [],
  globalBundles = null,
  routingConfig = null,
  prefill = {},
  fixedPath,
  title,
  subtitle,
}) {
  const locationOptions = buildLocationOptions(null);

  return (
    <StartPageLayout>
      <p style={{ fontFamily: START_FONTS.body, fontSize: '0.86rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '0.6rem' }}>
        Find Your Match
      </p>
      <h1 style={{ fontFamily: START_FONTS.display, fontSize: 'clamp(2rem, 4.6vw, 4rem)', color: '#fff', lineHeight: 1.05, marginBottom: '0.6rem' }}>
        {title}
      </h1>
      <p style={{ fontFamily: START_FONTS.body, color: 'rgba(250,248,245,0.66)', fontSize: '1.04rem', maxWidth: '46rem', marginBottom: '1rem' }}>
        {subtitle}
      </p>

      <StartBookingFlow
        providers={providers}
        globalBundles={globalBundles}
        routingConfig={routingConfig}
        locationOptions={locationOptions}
        prefill={prefill}
        fonts={START_FONTS}
        fontKey="bold"
        fixedPath={fixedPath}
        showPathSelector={false}
      />
    </StartPageLayout>
  );
}
