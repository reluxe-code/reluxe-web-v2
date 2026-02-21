import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, gradients, fontPairings } from '@/components/preview/tokens';
import { useLocationPref } from '@/context/LocationContext';
import { useMember } from '@/context/MemberContext';

/**
 * Magnetic Split Button — two halves side-by-side.
 * Before picking: equal 50/50 split.
 * After picking: preferred grows to ~75%, other shrinks.
 * Click the small side to swap.
 */
export default function MagneticBookButton({ fontKey = 'bold', size = 'nav' }) {
  const fonts = fontPairings[fontKey];
  const { locationKey, setLocationKey } = useLocationPref();
  const { openBookingModal } = useMember();
  const [hovered, setHovered] = useState(null); // 'westfield' | 'carmel' | null

  const hasPreference = !!locationKey;
  const isNav = size === 'nav';

  // Weight: preferred gets 72%, other gets 28%
  const westfieldWeight = !hasPreference ? 50 : locationKey === 'westfield' ? 72 : 28;
  const carmelWeight = !hasPreference ? 50 : locationKey === 'carmel' ? 72 : 28;

  const isPrimary = (loc) => locationKey === loc;
  const isSecondary = (loc) => hasPreference && locationKey !== loc;

  const handleClick = (loc) => {
    setLocationKey(loc);
    openBookingModal(loc);
  };

  const handleSwitch = (loc, e) => {
    e.stopPropagation();
    setLocationKey(loc);
  };

  const py = isNav ? '0.5rem' : '0.75rem';
  const fontSize = isNav ? '0.8125rem' : '0.9375rem';
  const height = isNav ? 40 : 48;
  const gap = 2;

  return (
    <div
      className="inline-flex items-stretch rounded-full overflow-hidden"
      style={{ height, gap, background: 'rgba(250,248,245,0.08)' }}
      onMouseLeave={() => setHovered(null)}
    >
      {/* Westfield half */}
      <motion.button
        className="relative rounded-full flex items-center justify-center overflow-hidden"
        style={{
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: fonts.body,
          fontSize,
          fontWeight: 600,
        }}
        animate={{
          flex: hovered === 'westfield' && !hasPreference ? 60 : westfieldWeight,
          background: isPrimary('westfield') || hovered === 'westfield'
            ? 'linear-gradient(135deg, #7C3AED, #C026D3)'
            : isSecondary('westfield')
              ? 'rgba(250,248,245,0.06)'
              : 'linear-gradient(135deg, #7C3AED, #9333EA)',
          color: isSecondary('westfield') && hovered !== 'westfield'
            ? 'rgba(250,248,245,0.5)'
            : '#fff',
          paddingLeft: isSecondary('westfield') ? '0.75rem' : '1.25rem',
          paddingRight: isSecondary('westfield') ? '0.75rem' : '1.25rem',
          paddingTop: py,
          paddingBottom: py,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onMouseEnter={() => setHovered('westfield')}
        onClick={isSecondary('westfield')
          ? (e) => handleSwitch('westfield', e)
          : () => handleClick('westfield')
        }
        title={isSecondary('westfield') ? 'Switch to Westfield' : 'Book Westfield'}
      >
        <AnimatePresence mode="wait">
          {isSecondary('westfield') ? (
            <motion.span
              key="short"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              W
            </motion.span>
          ) : (
            <motion.span
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isPrimary('westfield') ? '✦ Westfield' : 'Westfield'}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Active indicator dot */}
        {isPrimary('westfield') && (
          <motion.div
            layoutId="activeDot"
            className="absolute -bottom-0.5 left-1/2 rounded-full"
            style={{
              width: 4,
              height: 4,
              background: '#fff',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 8px rgba(255,255,255,0.5)',
            }}
          />
        )}
      </motion.button>

      {/* Carmel half */}
      <motion.button
        className="relative rounded-full flex items-center justify-center overflow-hidden"
        style={{
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: fonts.body,
          fontSize,
          fontWeight: 600,
        }}
        animate={{
          flex: hovered === 'carmel' && !hasPreference ? 60 : carmelWeight,
          background: isPrimary('carmel') || hovered === 'carmel'
            ? 'linear-gradient(135deg, #C026D3, #E11D73)'
            : isSecondary('carmel')
              ? 'rgba(250,248,245,0.06)'
              : 'linear-gradient(135deg, #C026D3, #E11D73)',
          color: isSecondary('carmel') && hovered !== 'carmel'
            ? 'rgba(250,248,245,0.5)'
            : '#fff',
          paddingLeft: isSecondary('carmel') ? '0.75rem' : '1.25rem',
          paddingRight: isSecondary('carmel') ? '0.75rem' : '1.25rem',
          paddingTop: py,
          paddingBottom: py,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onMouseEnter={() => setHovered('carmel')}
        onClick={isSecondary('carmel')
          ? (e) => handleSwitch('carmel', e)
          : () => handleClick('carmel')
        }
        title={isSecondary('carmel') ? 'Switch to Carmel' : 'Book Carmel'}
      >
        <AnimatePresence mode="wait">
          {isSecondary('carmel') ? (
            <motion.span
              key="short"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              C
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isPrimary('carmel') ? '✦ Carmel' : 'Carmel'}
            </motion.span>
          )}
        </AnimatePresence>

        {isPrimary('carmel') && (
          <motion.div
            layoutId="activeDot"
            className="absolute -bottom-0.5 left-1/2 rounded-full"
            style={{
              width: 4,
              height: 4,
              background: '#fff',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 8px rgba(255,255,255,0.5)',
            }}
          />
        )}
      </motion.button>
    </div>
  );
}
