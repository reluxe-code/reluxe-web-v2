import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, gradients, fontPairings } from '@/components/preview/tokens';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { useMember } from '@/context/MemberContext';

const navLinks = [
  { label: 'Services', href: '/beta/services' },
  { label: 'Team', href: '/beta/team' },
  { label: 'Westfield', href: '/beta/locations/westfield' },
  { label: 'Carmel', href: '/beta/locations/carmel' },
  { label: 'Inspiration', href: '/beta/inspiration' },
  { label: 'Contact', href: '/beta/contact' },
];

export default function BetaNavBar({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { member, isAuthenticated, openDrawer } = useMember();

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
        <a href="/beta" className="relative z-50">
          <img
            src="/images/logo/logo.png"
            alt="RELUXE Med Spa"
            style={{ height: 40, width: 'auto' }}
          />
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="relative group">
                <a
                  href={link.href}
                  className="transition-colors duration-200 hover:text-white inline-flex items-center gap-1"
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'rgba(250,248,245,0.65)',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5 }}><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200"
                >
                  <div className="rounded-xl overflow-hidden py-2 px-1" style={{ backgroundColor: 'rgba(26,26,26,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(250,248,245,0.08)', minWidth: 160 }}>
                    {link.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 rounded-lg transition-colors duration-150 hover:bg-white/5"
                        style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(250,248,245,0.7)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
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
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <GravityBookButton fontKey={fontKey} size="nav" />
          {isAuthenticated && member && (
            <button
              onClick={() => openDrawer('account')}
              title={member.first_name || 'My Account'}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: gradients.primary, color: '#fff',
                fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {(member.first_name || '?')[0].toUpperCase()}
            </button>
          )}
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
              <div key={link.label} className="text-center">
                <motion.a
                  href={link.children ? undefined : link.href}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={link.children ? undefined : () => setMobileOpen(false)}
                  style={{
                    fontFamily: fonts.display,
                    fontSize: '1.75rem',
                    fontWeight: 600,
                    color: colors.white,
                    textDecoration: 'none',
                    cursor: link.children ? 'default' : 'pointer',
                  }}
                >
                  {link.children ? 'Locations' : link.label}
                </motion.a>
                {link.children && (
                  <div className="flex justify-center gap-6 mt-2">
                    {link.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 500, color: colors.violet, textDecoration: 'none' }}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <GravityBookButton fontKey={fontKey} size="hero" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
