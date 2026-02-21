import StartFlowPage from '@/components/booking/StartFlowPage';
import { getStartFlowServerSideProps } from '@/lib/start-page-props';

StartConcernPage.getLayout = (page) => page;

export default function StartConcernPage(props) {
  return (
    <StartFlowPage
      {...props}
      fixedPath="concern"
      title="Let's Start With Your Concern"
      subtitle="Choose a bundle, then we will guide service, provider, date, and time."
    />
  );
}

export const getServerSideProps = getStartFlowServerSideProps;
