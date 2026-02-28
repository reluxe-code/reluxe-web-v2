import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, gradients, fontPairings } from '@/components/preview/tokens';
import { useLocationPref } from '@/context/LocationContext';
import { useMember } from '@/context/MemberContext';

export default function MobileStickyFooter({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];
  const { locationKey } = useLocationPref();
  const { openBookingModal, bookingModalOpen, drawerOpen, rebookOpen } = useMember();
  const [visible, setVisible] = useState(false);

  // Show after scrolling past the hero (300px)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hide when any modal/drawer is open
  const show = visible && !bookingModalOpen && !drawerOpen && !rebookOpen;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="fixed bottom-0 inset-x-0 z-[45] lg:hidden"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Fade gradient so it doesn't clip content harshly */}
          <div style={{
            height: 20,
            background: 'linear-gradient(to bottom, transparent, rgba(26,26,26,0.6))',
            pointerEvents: 'none',
          }} />

          <div style={{
            backgroundColor: 'rgba(26,26,26,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(250,248,245,0.08)',
            padding: '12px 16px max(12px, env(safe-area-inset-bottom))',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              maxWidth: 480,
              margin: '0 auto',
            }}>
              {/* Call button */}
              <a
                href="tel:3177631142"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  borderRadius: 999,
                  border: '1px solid rgba(250,248,245,0.15)',
                  background: 'rgba(250,248,245,0.06)',
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span style={{
                  fontFamily: fonts.body,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'rgba(250,248,245,0.8)',
                  whiteSpace: 'nowrap',
                }}>Call Us</span>
              </a>

              {/* Book button — takes remaining space */}
              <button
                onClick={() => openBookingModal(locationKey || 'westfield')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 20px',
                  borderRadius: 999,
                  background: gradients.primary,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: fonts.body,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Book Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
