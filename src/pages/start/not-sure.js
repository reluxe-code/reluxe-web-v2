import StartFlowPage from '@/components/booking/StartFlowPage';
import { getStartFlowServerSideProps } from '@/lib/start-page-props';

StartNotSurePage.getLayout = (page) => page;

export default function StartNotSurePage(props) {
  return (
    <StartFlowPage
      {...props}
      fixedPath="not-sure"
      title="Not Sure Where To Start?"
      subtitle="Start with the consult path and we will guide everything else."
    />
  );
}

export const getServerSideProps = getStartFlowServerSideProps;
