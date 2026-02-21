import { getStartBookingBaseProps } from '@/lib/start-booking';

export async function getStartFlowServerSideProps(ctx) {
  const { providers, globalBundles, routingConfig, prefill } = await getStartBookingBaseProps(ctx.query || {});
  return {
    props: {
      providers,
      globalBundles,
      routingConfig,
      prefill,
    },
  };
}
