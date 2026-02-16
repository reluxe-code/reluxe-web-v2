import Head from 'next/head';
import PropTypes from 'prop-types';
import HeaderTwo from '../components/header/header-2';
import ContactForm from '../components/contact/contact-form';
import { getAllItems } from '../lib/items-util';
import dynamic from 'next/dynamic'
const GoogleMap = dynamic(
  () => import('../components/contact/google-map'),
  { ssr: false } // 👈 prevents SSR “window is not defined”
)

function ContactPage({ contactItems }) {
    return (
        <>
            <Head>
                <title>Contact Us | RELUXE Med Spa in Carmel & Westfield, IN</title>
                <meta name="description" content="Send us your messages for Carmel & Westfield!" />
            </Head>
            <HeaderTwo />
            <GoogleMap height={480} />
            <ContactForm contactItems={contactItems} />
        </>
    );
}

export function getStaticProps() {
    const contactItems = getAllItems('contact');
    return {
        props: {
            contactItems,
        },
    };
}

ContactPage.propTypes = {
    contactItems: PropTypes.instanceOf(Object).isRequired,
};

export default ContactPage;
