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
                <meta name="description" content="Get in touch with RELUXE Med Spa in Carmel and Westfield, Indiana. Questions about Botox, facials, or booking? Call (317) 763-1142 or send us a message." />
                <link rel="canonical" href="https://reluxemedspa.com/contact" />
                <meta property="og:title" content="Contact Us | RELUXE Med Spa in Carmel & Westfield, IN" />
                <meta property="og:description" content="Get in touch with RELUXE Med Spa in Carmel and Westfield, Indiana. Questions about Botox, facials, or booking? Call (317) 763-1142 or send us a message." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://reluxemedspa.com/contact" />
                <meta property="og:site_name" content="RELUXE Med Spa" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Contact Us | RELUXE Med Spa" />
                <meta name="twitter:description" content="Questions about Botox, facials, or booking? Call (317) 763-1142 or send us a message." />
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
