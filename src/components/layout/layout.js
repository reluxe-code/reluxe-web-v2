import PropTypes from 'prop-types';
import BetaNavBar from '@/components/beta/BetaNavBar';
import BetaFooter from '@/components/beta/BetaFooter';
import OldBookingCTA from '@/components/booking/OldBookingCTA';

export * from '../scroll';

const FONT_KEY = 'bold';

function Layout({ children }) {
    return (
        <>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-2 focus:left-2 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded focus:shadow-lg">
                Skip to content
            </a>
            <div style={{ backgroundColor: '#fff' }}>
                <BetaNavBar fontKey={FONT_KEY} />
                <main id="main-content">{children}</main>
                <OldBookingCTA fontKey={FONT_KEY} />
                <BetaFooter fontKey={FONT_KEY} />
            </div>
        </>
    );
}

Layout.propTypes = {
    children: PropTypes.instanceOf(Object).isRequired,
};

export default Layout;
