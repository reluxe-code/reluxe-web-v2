import StartFlowPage from '@/components/booking/StartFlowPage';
import { getStartFlowServerSideProps } from '@/lib/start-page-props';

StartProviderPage.getLayout = (page) => page;

export default function StartProviderPage(props) {
  return (
    <StartFlowPage
      {...props}
      fixedPath="provider"
      title="Book With Your Provider"
      subtitle="Pick your provider first, then finish the booking flow."
    />
  );
}

export const getServerSideProps = getStartFlowServerSideProps;
