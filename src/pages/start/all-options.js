import StartFlowPage from '@/components/booking/StartFlowPage';
import { getStartFlowServerSideProps } from '@/lib/start-page-props';

StartAllOptionsPage.getLayout = (page) => page;

export default function StartAllOptionsPage(props) {
  return (
    <StartFlowPage
      {...props}
      fixedPath="all-options"
      title="See All Service Options"
      subtitle="Start from categories first, then choose provider, date, and time."
    />
  );
}

export const getServerSideProps = getStartFlowServerSideProps;
