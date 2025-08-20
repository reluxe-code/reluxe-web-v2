// components/header/header-2.js

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FaBars } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { OffcanvasData } from './offcanvas-data';
import WhiteLogo from './white-logo';

function HeaderTwo() {
  const [offcanvas, setOffcanvas] = useState(false);
  const router = useRouter();
  const header = useRef(null);
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const openerBtnRef = useRef(null);

  const toggleOffcanvas = useCallback((next) => {
    setOffcanvas((prev) => (typeof next === 'boolean' ? next : !prev));
  }, []);

  // Sticky header
  useEffect(() => {
    const isSticky = () => {
      const scrollTop = window.scrollY;
      if (scrollTop >= 90) header.current?.classList.add('is-sticky');
      else header.current?.classList.remove('is-sticky');
    };
    window.addEventListener('scroll', isSticky);
    isSticky();
    return () => window.removeEventListener('scroll', isSticky);
  }, []);

  // Body scroll lock + focus
  useEffect(() => {
    if (offcanvas) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtnRef.current?.focus(), 0);
      return () => {
        document.body.style.overflow = prev;
        openerBtnRef.current?.focus?.();
      };
    }
  }, [offcanvas]);

  // Close on route change
  useEffect(() => {
    const handleRoute = () => toggleOffcanvas(false);
    router.events.on('routeChangeStart', handleRoute);
    return () => router.events.off('routeChangeStart', handleRoute);
  }, [router.events, toggleOffcanvas]);

  // Focus trap
  const onKeyDownDrawer = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      toggleOffcanvas(false);
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = drawerRef.current?.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || !focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // ---------- Active link + underline logic ----------
  const normalize = (p) => (p || '').replace(/\/+$/, '') || '/';
  const isActivePath = (testPath) => {
    const curr = normalize(router.asPath || router.pathname);
    const test = normalize(testPath);
    if (test === '/') return curr === '/';
    return curr === test || curr.startsWith(`${test}/`);
  };

  // Link wrapper (padding/click area)
  const linkShell = 'relative inline-flex items-center px-1 py-2 text-white/90 hover:text-white transition';

  // Underline attached to JUST the text width (not padding)
  // - Non-active: white underline on hover
  // - Active: persistent purple gradient underline (same size as hover)
  const labelClass = (active) =>
    [
      'relative inline-block whitespace-nowrap',
      'after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-[6px] after:h-[2px] after:rounded-full',
      'after:opacity-0 after:transition-opacity after:duration-200',
      active
        ? 'after:opacity-100 after:bg-gradient-to-r after:from-fuchsia-500 after:via-violet-500 after:to-indigo-500'
        : 'hover:after:opacity-100 hover:after:bg-white',
    ].join(' ');

  // ---- Build mobile drawer menus -----------------------------------------
  const PRIMARY_KEYS = ['/', '/posts', '/locations', '/faqs'];
  const dataMap = new Map(
    (OffcanvasData || []).map((item) => [normalize(item.path), item])
  );

  const primaryMenu = PRIMARY_KEYS.map((key) => {
    const item = dataMap.get(normalize(key));
    if (item) return item;
    return {
      id: key,
      title:
        key === '/' ? 'Home' :
        key === '/posts' ? 'Posts' :
        key === '/locations' ? 'Locations' :
        key === '/faqs' ? 'FAQs' : key,
      path: key,
      cName: 'offcanvas-text',
    };
  });

  const primarySet = new Set(primaryMenu.map((i) => normalize(i.path)));
  const extraMenu = (OffcanvasData || []).filter(
    (i) => !primarySet.has(normalize(i.path))
  );

  return (
    <>
      <header className="header-section bg-black" ref={header}>
        <div className="custom-container container">
          <div className="grid grid-cols-12 items-center py-4">
            {/* Logo */}
            <div className="lg:col-span-2 col-span-6">
              <div className="pl-2">
                <WhiteLogo />
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="lg:col-span-7 lg:block hidden">
              <nav className="pl-4">
                <ul className="main-menu text-white flex">
                  <li>
                    {(() => {
                      const active = isActivePath('/');
                      return (
                        <Link href="/" className={linkShell} aria-current={active ? 'page' : undefined}>
                          <span className={labelClass(active)}>Home</span>
                        </Link>
                      );
                    })()}
                  </li>

                  <li>
                    {(() => {
                      const active = isActivePath('/team/');
                      return (
                        <Link href="/team/" className={linkShell} aria-current={active ? 'page' : undefined}>
                          <span className={labelClass(active)}>Our Team</span>
                        </Link>
                      );
                    })()}
                  </li>

                  <li>
                    {(() => {
                      const active = isActivePath('/locations/westfield');
                      return (
                        <Link href="/locations/westfield" className={linkShell} aria-current={active ? 'page' : undefined}>
                          <span className={labelClass(active)}>Westfield</span>
                        </Link>
                      );
                    })()}
                  </li>

                  <li>
                    {(() => {
                      const active = isActivePath('/locations/carmel');
                      return (
                        <Link href="/locations/carmel" className={linkShell} aria-current={active ? 'page' : undefined}>
                          <span className={labelClass(active)}>Carmel</span>
                        </Link>
                      );
                    })()}
                  </li>

                  <li>
                    {(() => {
                      const active = isActivePath('/services/');
                      return (
                        <Link href="/services/" className={linkShell} aria-current={active ? 'page' : undefined}>
                          <span className={labelClass(active)}>Services</span>
                        </Link>
                      );
                    })()}
                  </li>

                  <li>
                    {(() => {
                      const active = isActivePath('/shop');
                      return (
                        <Link href="/shop" className={linkShell} aria-current={active ? 'page' : undefined}>
                          <span className={labelClass(active)}>Shop</span>
                        </Link>
                      );
                    })()}
                  </li>

                  <li>
                    {(() => {
                      const active = isActivePath('/contact');
                      return (
                        <Link href="/contact" className={linkShell} aria-current={active ? 'page' : undefined}>
                          <span className={labelClass(active)}>Contact</span>
                        </Link>
                      );
                    })()}
                  </li>
                </ul>
              </nav>
            </div>

            {/* CTA + Mobile Controls */}
            <div className="lg:col-span-3 col-span-6">
              <div className="flex justify-end items-center gap-2 pr-2">
                <Link
                  href="/book"
                  className="hidden sm:inline-block bg-black border border-white text-white px-4 py-2 rounded text-sm font-semibold hover:bg-white hover:text-black transition"
                >
                  Book Now
                </Link>
                <Link
                  href="/profile"
                  className="hidden sm:inline-block bg-white border border-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-black hover:text-white transition"
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  className="menu-bars flex text-[24px] ml-2 sm:ml-3"
                  aria-label="Open menu"
                  aria-haspopup="dialog"
                  aria-expanded={offcanvas}
                  onClick={() => toggleOffcanvas(true)}
                  ref={openerBtnRef}
                >
                  <FaBars className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Offcanvas / Drawer */}
      <div
        className={`fixed inset-0 z-[100] ${offcanvas ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!offcanvas}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${offcanvas ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => toggleOffcanvas(false)}
        />

        {/* Panel */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Main Menu"
          ref={drawerRef}
          onKeyDown={onKeyDownDrawer}
          className={`absolute right-0 top-0 h-full w-[84%] max-w-xs bg-white shadow-xl transform transition-transform
            ${offcanvas ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo/logo-2.png"
                alt="Logo"
                width={140}
                height={44}
                priority
              />
            </Link>
            <button
              ref={closeBtnRef}
              type="button"
              className="text-[24px] opacity-80 hover:opacity-60 focus:outline-none"
              aria-label="Close menu"
              onClick={() => toggleOffcanvas(false)}
            >
              <AiOutlineClose />
            </button>
          </div>

          {/* Buttons at the TOP of the menu */}
          <div className="p-4 border-b grid grid-cols-1">
            <Link
              href="#"
              className="w-full text-center bg-black text-white px-4 py-3 rounded font-semibold"
              onClick={() => toggleOffcanvas(false)}
            >
              Book Now
            </Link>
            <Link
              href="/profile"
              className="w-full text-center bg-gray-100 text-gray-900 px-4 py-3 rounded font-medium"
              onClick={() => toggleOffcanvas(false)}
            >
              My Profile
            </Link>
          </div>

          {/* MAIN NAV (top section) */}
          <nav className="p-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Navigation</h3>
            <ul className="space-y-1">
              {primaryMenu.map((item) => (
                <li key={item.id || item.path}>
                  <Link
                    href={item.path}
                    className="block w-full px-3 py-2 rounded hover:bg-gray-100"
                    onClick={() => toggleOffcanvas(false)}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* EXTRAS (bottom section) */}
          {extraMenu.length > 0 && (
            <nav className="mt-auto p-4 border-t">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">More</h3>
              <ul className="space-y-1">
                {extraMenu.map((item) => (
                  <li key={item.id || item.path}>
                    <Link
                      href={item.path}
                      className="block w-full px-3 py-2 rounded hover:bg-gray-100"
                      onClick={() => toggleOffcanvas(false)}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>

    </>
  );
}

export default HeaderTwo;
