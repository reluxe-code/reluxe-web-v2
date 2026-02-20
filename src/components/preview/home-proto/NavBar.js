import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, gradients, fontPairings } from '../tokens';

const navLinks = [
  { label: 'Services', href: '/preview/services' },
  { label: 'Team', href: '/preview/team' },
  { label: 'Locations', href: '/preview/locations' },
  { label: 'Blog', href: '/preview/blog/post' },
  { label: 'Contact', href: '#contact' },
];

export default function NavBar({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(26,26,26,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(250,248,245,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <a href="/" className="relative z-50">
          <span
            style={{
              fontFamily: fonts.display,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: colors.white,
              letterSpacing: '0.06em',
            }}
          >
            RELUXE
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors duration-200 hover:text-white"
              style={{
                fontFamily: fonts.body,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'rgba(250,248,245,0.65)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <button
            className="rounded-full transition-shadow duration-200 hover:shadow-[0_0_24px_rgba(124,58,237,0.3)]"
            style={{
              background: gradients.primary,
              color: '#fff',
              padding: '0.625rem 1.75rem',
              fontSize: '0.875rem',
              fontFamily: fonts.body,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Book Now
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden relative z-50 p-2"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div className="flex flex-col gap-[5px]">
            <span
              className="block w-5 h-[1.5px] rounded-full transition-all duration-300"
              style={{
                backgroundColor: colors.white,
                transform: mobileOpen ? 'rotate(45deg) translate(2px, 5px)' : 'none',
              }}
            />
            <span
              className="block w-5 h-[1.5px] rounded-full transition-all duration-300"
              style={{
                backgroundColor: colors.white,
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-[1.5px] rounded-full transition-all duration-300"
              style={{
                backgroundColor: colors.white,
                transform: mobileOpen ? 'rotate(-45deg) translate(2px, -5px)' : 'none',
              }}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden flex flex-col items-center justify-center gap-6"
            style={{ backgroundColor: 'rgba(26,26,26,0.96)', backdropFilter: 'blur(24px)' }}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: fonts.display,
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  color: colors.white,
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 rounded-full"
              style={{
                background: gradients.primary,
                color: '#fff',
                padding: '0.875rem 2.5rem',
                fontSize: '1rem',
                fontFamily: fonts.body,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Book Now
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
