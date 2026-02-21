import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, gradients, fontPairings } from '@/components/preview/tokens';
import { useLocationPref } from '@/context/LocationContext';
import { useMember } from '@/context/MemberContext';

/**
 * Gravity Drawer — single "Book Now" button.
 * First click: slim drawer drops from the button with two location cards.
 * After choosing: future clicks go straight to BLVD booking.
 * A small location badge on the button lets you re-open the drawer to switch.
 */
export default function GravityBookButton({ fontKey = 'bold', size = 'nav' }) {
  const fonts = fontPairings[fontKey];
  const { locationKey, setLocationKey } = useLocationPref();
  const { openBookingModal } = useMember();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const containerRef = useRef(null);

  const hasPreference = !!locationKey;
  const isNav = size === 'nav';
  const locationLabel = locationKey === 'westfield' ? 'Westfield' : locationKey === 'carmel' ? 'Carmel' : null;

  // Close drawer on outside click
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [drawerOpen]);

  const handleMainClick = () => {
    if (hasPreference) {
      openBookingModal(locationKey);
    } else {
      setDrawerOpen(true);
    }
  };

  const handleLocationPick = (loc) => {
    setLocationKey(loc);
    setDrawerOpen(false);
    setTimeout(() => openBookingModal(loc), 150);
  };

  const handleBadgeClick = (e) => {
    e.stopPropagation();
    setDrawerOpen((v) => !v);
  };

  const py = isNav ? '0.5rem' : '0.75rem';
  const fontSize = isNav ? '0.8125rem' : '0.9375rem';

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Main button */}
      <div className="flex items-center gap-0" style={{ whiteSpace: 'nowrap' }}>
        <motion.button
          className="rounded-full flex items-center gap-2"
          style={{
            background: gradients.primary,
            color: '#fff',
            padding: `${py} 1.5rem`,
            paddingRight: hasPreference ? '0.75rem' : '1.5rem',
            fontSize,
            fontFamily: fonts.body,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            borderTopRightRadius: hasPreference ? 0 : undefined,
            borderBottomRightRadius: hasPreference ? 0 : undefined,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleMainClick}
        >
          Book Now
        </motion.button>

        {/* Location badge — only shows after picking */}
        {hasPreference && (
          <motion.button
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            className="flex items-center gap-1 rounded-full"
            style={{
              background: 'rgba(250,248,245,0.1)',
              border: '1px solid rgba(250,248,245,0.15)',
              color: 'rgba(250,248,245,0.8)',
              padding: `${py} 0.75rem`,
              fontSize: isNav ? '0.6875rem' : '0.8125rem',
              fontFamily: fonts.body,
              fontWeight: 500,
              cursor: 'pointer',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              whiteSpace: 'nowrap',
            }}
            whileHover={{
              background: 'rgba(250,248,245,0.18)',
              color: '#fff',
            }}
            onClick={handleBadgeClick}
            title="Switch location"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {locationLabel}
            <motion.svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ rotate: drawerOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </motion.button>
        )}
      </div>

      {/* Gravity Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute right-0 mt-3 rounded-2xl overflow-hidden z-50"
            style={{
              width: 320,
              backgroundColor: 'rgba(26,26,26,0.96)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(250,248,245,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(250,248,245,0.04)',
            }}
          >
            {/* Arrow */}
            <div
              className="absolute -top-1.5 right-6"
              style={{
                width: 12,
                height: 12,
                backgroundColor: 'rgba(26,26,26,0.96)',
                border: '1px solid rgba(250,248,245,0.08)',
                borderBottom: 'none',
                borderRight: 'none',
                transform: 'rotate(45deg)',
              }}
            />

            <div className="p-4">
              <p
                className="mb-3 text-center"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'rgba(250,248,245,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Choose Your Location
              </p>

              <div className="space-y-2">
                {/* Westfield card */}
                <motion.button
                  className="w-full rounded-xl p-4 text-left flex items-center gap-3"
                  style={{
                    background: locationKey === 'westfield'
                      ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(124,58,237,0.08))'
                      : 'rgba(250,248,245,0.04)',
                    border: locationKey === 'westfield'
                      ? '1px solid rgba(124,58,237,0.3)'
                      : '1px solid rgba(250,248,245,0.06)',
                    cursor: 'pointer',
                  }}
                  whileHover={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.06))',
                    borderColor: 'rgba(124,58,237,0.25)',
                  }}
                  onClick={() => handleLocationPick('westfield')}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-lg"
                    style={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>W</span>
                  </div>
                  <div className="min-w-0">
                    <p style={{ fontFamily: fonts.display, fontSize: '0.9375rem', fontWeight: 600, color: colors.white }}>
                      Westfield
                      {locationKey === 'westfield' && (
                        <span style={{ fontSize: '0.6875rem', color: colors.violet, marginLeft: 6, fontFamily: fonts.body, fontWeight: 500 }}>Current</span>
                      )}
                    </p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>514 E State Road 32</p>
                  </div>
                  <svg className="ml-auto flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(250,248,245,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </motion.button>

                {/* Carmel card */}
                <motion.button
                  className="w-full rounded-xl p-4 text-left flex items-center gap-3"
                  style={{
                    background: locationKey === 'carmel'
                      ? 'linear-gradient(135deg, rgba(192,38,211,0.2), rgba(192,38,211,0.08))'
                      : 'rgba(250,248,245,0.04)',
                    border: locationKey === 'carmel'
                      ? '1px solid rgba(192,38,211,0.3)'
                      : '1px solid rgba(250,248,245,0.06)',
                    cursor: 'pointer',
                  }}
                  whileHover={{
                    background: 'linear-gradient(135deg, rgba(192,38,211,0.15), rgba(192,38,211,0.06))',
                    borderColor: 'rgba(192,38,211,0.25)',
                  }}
                  onClick={() => handleLocationPick('carmel')}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-lg"
                    style={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #C026D3, #9333EA)',
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>C</span>
                  </div>
                  <div className="min-w-0">
                    <p style={{ fontFamily: fonts.display, fontSize: '0.9375rem', fontWeight: 600, color: colors.white }}>
                      Carmel
                      {locationKey === 'carmel' && (
                        <span style={{ fontSize: '0.6875rem', color: colors.fuchsia, marginLeft: 6, fontFamily: fonts.body, fontWeight: 500 }}>Current</span>
                      )}
                    </p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>10485 N Pennsylvania St</p>
                  </div>
                  <svg className="ml-auto flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(250,248,245,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </motion.button>
              </div>

              <p
                className="mt-3 text-center"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.625rem',
                  color: 'rgba(250,248,245,0.25)',
                }}
              >
                We&apos;ll remember your choice
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
