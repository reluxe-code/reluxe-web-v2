import PropTypes from 'prop-types';
import Footer from './footer';

export * from '../scroll';

function Layout({ children }) {
    return (
        <>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-2 focus:left-2 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded focus:shadow-lg">
                Skip to content
            </a>
            <main id="main-content">{children}</main>
            <Footer />
        </>
    );
}

Layout.propTypes = {
    children: PropTypes.instanceOf(Object).isRequired,
};

export default Layout;
