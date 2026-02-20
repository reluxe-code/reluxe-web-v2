// components/header/header-2.js
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FaBars } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import WhiteLogo from './white-logo';
import { FiPhone, FiMessageSquare } from 'react-icons/fi';
import LocationSwitcherMini from '@/components/location/LocationSwitcherMini';

function HeaderTwo({ sticky = true }) {
  const [offcanvas, setOffcanvas] = useState(false);
  const router = useRouter();
  const header = useRef(null);
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const openerBtnRef = useRef(null);

  const toggleOffcanvas = useCallback((next) => {
    setOffcanvas((prev) => (typeof next === 'boolean' ? next : !prev));
  }, []);

  // Sticky header (respect the `sticky` prop)
  useEffect(() => {
    if (!sticky) {
      header.current?.classList.remove('is-sticky');
      return;
    }

    const isSticky = () => {
      const scrollTop = window.scrollY || 0;
      if (scrollTop >= 90) header.current?.classList.add('is-sticky');
      else header.current?.classList.remove('is-sticky');
    };

    window.addEventListener('scroll', isSticky);
    isSticky();

    return () => {
      window.removeEventListener('scroll', isSticky);
      header.current?.classList.remove('is-sticky');
    };
  }, [sticky]);

  // Body scroll lock + focus management
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

  // ---------- Active link ----------
  const normalize = (p) => (p || '').replace(/\/+$/, '') || '/';
  const isActivePath = (testPath) => {
    const curr = normalize(router.asPath || router.pathname);
    const test = normalize(testPath);
    if (test === '/') return curr === '/';
    return curr === test || curr.startsWith(`${test}/`);
  };

  // Link styles
  const linkShell = 'relative inline-flex items-center px-1 py-2 text-white/90 hover:text-white transition';
  const labelClass = (active) =>
    [
      'relative inline-block whitespace-nowrap',
      'after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-[6px] after:h-[2px] after:rounded-full',
      'after:opacity-0 after:transition-opacity after:duration-200',
      active
        ? 'after:opacity-100 after:bg-gradient-to-r after:from-fuchsia-500 after:via-violet-500 after:to-indigo-500'
        : 'hover:after:opacity-100 hover:after:bg-white',
    ].join(' ');

  // Utility bar link style
  const utilLink = 'text-white/70 hover:text-white text-xs transition whitespace-nowrap';

  // Desktop nav items
  const mainNav = [
    { href: '/services', label: 'Our Treatments' },
    { href: '/locations/westfield', label: 'Westfield' },
    { href: '/locations/carmel', label: 'Carmel' },
    { href: '/team', label: 'Our Providers' },
    { href: '/reluxe-way', label: 'The RELUXE Way' },
  ];

  // Utility bar items (right side)
  const utilItems = [
    { href: '/deals', label: 'Deals' },
    { href: 'https://blvd.me/reluxemedspa/gift-cards', label: 'Gift Cards', external: true },
    { href: '/memberships', label: 'Memberships' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/contact', label: 'Contact' },
    { href: '/profile', label: 'My Profile' },
  ];

  return (
    <>
      {/* ===== Utility Bar (desktop only) ===== */}
      <div className="hidden lg:block bg-neutral-900 border-b border-white/10">
        <div className="custom-container container">
          <div className="flex items-center justify-between py-1.5">
            <a
              href="tel:+13177631142"
              className={`${utilLink} inline-flex items-center gap-1.5`}
              aria-label="Call RELUXE Med Spa at (317) 763-1142"
            >
              <FiPhone className="h-3 w-3" />
              (317) 763-1142
            </a>
            <nav aria-label="Utility navigation">
              <ul className="flex items-center gap-4">
                {utilItems.map(({ href, label, external }) => (
                  <li key={href}>
                    {external ? (
                      <a href={href} target="_blank" rel="noreferrer" className={utilLink}>{label}</a>
                    ) : (
                      <Link href={href} className={utilLink}>{label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* ===== Main Header ===== */}
      <header className="header-section bg-black" ref={header} data-sticky={sticky ? 'on' : 'off'}>
        <div className="custom-container container">
          <div className="grid grid-cols-12 items-center py-4">
            {/* Logo */}
            <div className="lg:col-span-2 col-span-6">
              <div className="pl-2">
                <WhiteLogo />
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="lg:col-span-6 lg:block hidden">
              <nav className="pl-4" aria-label="Main navigation">
                <ul className="main-menu text-white flex">
                  {mainNav.map(({ href, label }) => {
                    const active = isActivePath(href);
                    return (
                      <li key={href}>
                        <Link href={href} className={linkShell} aria-current={active ? 'page' : undefined}>
                          <span className={labelClass(active)}>{label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* CTA + Mobile Controls */}
            <div className="lg:col-span-4 col-span-6">
              <div className="flex justify-end items-center gap-2 pr-2">
                <Link
                  href="/book"
                  className="hidden sm:inline-block bg-black border border-white text-white px-4 py-2 rounded text-sm font-semibold hover:bg-white hover:text-black transition"
                >
                  Book Now
                </Link>
                <a
                  href="tel:+13177631142"
                  className="inline-block bg-black text-white px-4 py-2 rounded text-sm font-semibold hover:bg-white hover:text-black transition lg:hidden"
                  aria-label="Call RELUXE Med Spa at (317) 763-1142"
                >
                  <FiPhone className="h-5 w-5" />
                </a>

                <LocationSwitcherMini variant="icon" className="flex-none z-20" />

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

      {/* ===== Offcanvas / Drawer ===== */}
      <div
        className={`fixed inset-0 z-[100] ${offcanvas ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!offcanvas}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${offcanvas ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => toggleOffcanvas(false)}
          style={{ touchAction: 'none' }}
        />

        {/* Panel */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Main Menu"
          ref={drawerRef}
          onKeyDown={onKeyDownDrawer}
          className={`absolute right-0 top-0 h-full w-[84%] max-w-xs bg-white shadow-xl transform transition-transform
            ${offcanvas ? 'translate-x-0' : 'translate-x-full'}
            flex flex-col`}
        >
          {/* Drawer header (fixed) */}
          <div className="flex items-center justify-between p-4 border-b flex-none">
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

          {/* Top CTAs (fixed) */}
          <div className="p-4 border-b grid grid-cols-1 gap-2 flex-none">
            <LocationSwitcherMini variant="segmented" />
            <Link
              href="/book"
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
            {/* Call / Text row */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:+13177631142"
                className="w-full rounded bg-black text-white px-4 py-3 font-semibold flex flex-col items-center justify-center gap-1 hover:bg-neutral-900 transition"
                aria-label="Call RELUXE Med Spa at (317) 763-1142"
              >
                <span className="inline-flex items-center gap-2">
                  <FiPhone className="h-5 w-5" />
                  Call
                </span>
              </a>

              <a
                href="sms:+13177631142"
                className="w-full rounded text-black px-4 py-3 font-semibold flex flex-col items-center justify-center gap-1 hover:border-black transition"
                aria-label="Text RELUXE Med Spa at (317) 763-1142"
              >
                <span className="inline-flex items-center gap-2">
                  <FiMessageSquare className="h-5 w-5" />
                  Text
                </span>
              </a>
            </div>
            <a href="sms:+13177631142" className="text-center">
              <span className="text-xs tracking-wide text-black text-center">317-763-1142</span>
            </a>
          </div>

          {/* SCROLLABLE CONTENT AREA */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {(() => {
              const linkCls = (href) =>
                [
                  'block w-full px-3 py-2 rounded transition',
                  isActivePath(href) ? 'bg-gray-100 text-neutral-900 font-semibold' : 'hover:bg-gray-100',
                ].join(' ');

              const Section = ({ title, children }) => (
                <section className="mb-6 px-4">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">{title}</h3>
                  {children}
                </section>
              );

              const Group = ({ title, items = [], defaultOpen = false }) => (
                <details className="group border rounded-lg mx-4 mb-4" open={defaultOpen}>
                  <summary className="flex items-center justify-between cursor-pointer px-3 py-2 text-sm font-semibold">
                    <span>{title}</span>
                    <svg
                      className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </summary>
                  <ul className="px-2 pb-2 space-y-1">
                    {items.map(({ href, label, external }) => (
                      <li key={href}>
                        {external ? (
                          <a href={href} target="_blank" rel="noreferrer" className={linkCls(href)} onClick={() => toggleOffcanvas(false)}>
                            {label}
                          </a>
                        ) : (
                          <Link href={href} className={linkCls(href)} onClick={() => toggleOffcanvas(false)}>
                            {label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              );

              const quickBook = [
                { href: '/book/', label: 'Book Now' },
                { href: '/book/tox/', label: 'Tox' },
                { href: '/book/facials/', label: 'Facial' },
                { href: '/book/laser-hair-removal/', label: 'Hair Removal' },
              ];

              const dealsGifts = [
                { href: '/deals', label: 'Current Deals' },
                { href: 'https://blvd.me/reluxemedspa/gift-cards', label: 'Gift Cards', external: true },
                { href: '/memberships', label: 'Memberships' },
                { href: '/cherry-financing', label: 'Cherry Financing' },
                { href: '/spafinder', label: 'SpaFinder' },
              ];

              const services = [
                { href: '/services', label: 'All Treatments' },
                { href: '/services/injectables', label: 'Injectables' },
                { href: '/services/laser', label: 'Skin & Laser' },
                { href: '/services/facials', label: 'Facials' },
                { href: '/services/laser-hair-removal', label: 'Laser Hair Removal' },
                { href: '/services/body', label: 'Body Contouring' },
                { href: '/services/massage', label: 'Massage' },
                { href: '/conditions', label: 'Conditions We Treat' },
              ];

              const aboutTeam = [
                { href: '/team', label: 'Our Providers' },
                { href: '/about', label: 'About RELUXE' },
                { href: '/reluxe-way', label: 'The RELUXE Way' },
                { href: '/locations', label: 'Locations & Hours' },
                { href: '/affiliations', label: 'Affiliations' },
                { href: '/partners/house-of-health', label: 'House of Health' },
              ];

              const events = [
                { href: '/events', label: 'Events Hub' },
                { href: '/wedding', label: 'Weddings & Bridal' },
                { href: '/men', label: 'For Men' },
                { href: '/events/proms-formals', label: 'Proms & Formals' },
                { href: '/events/red-carpet-galas', label: 'Red Carpet & Galas' },
                { href: '/events/local-indy-events', label: 'Local Events' },
              ];

              const resultsResources = [
                { href: '/results', label: 'Before & After' },
                { href: '/reviews', label: 'Reviews' },
                { href: '/blog', label: 'Blog' },
                { href: '/faqs', label: 'FAQs' },
                { href: '/pricing', label: 'Pricing' },
              ];

              const legalContact = [
                { href: '/contact', label: 'Contact' },
                { href: '/legal', label: 'Policies & Legal' },
              ];

              return (
                <>
                  {/* Search */}
                  <Section title="Search">
                    <form action="/search" method="GET" className="flex gap-2">
                      <input
                        name="q"
                        type="search"
                        inputMode="search"
                        placeholder="Search treatments, concerns…"
                        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button
                        className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                        type="submit"
                      >
                        Go
                      </button>
                    </form>
                  </Section>

                  {/* Quick Book */}
                  <Section title="Quick Book">
                    <ul className="grid grid-cols-2 gap-2">
                      {quickBook.map(({ href, label }) => (
                        <li key={href}>
                          <Link
                            href={href}
                            className="block w-full rounded-md border px-3 py-2 text-center text-sm font-semibold hover:bg-gray-100"
                            onClick={() => toggleOffcanvas(false)}
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Section>

                  {/* Groups */}
                  <div className="space-y-4 pb-6">
                    <Group title="Deals & Gifts" items={dealsGifts} defaultOpen />
                    <Group title="Treatments" items={services} defaultOpen />
                    <Group title="About & Providers" items={aboutTeam} />
                    <Group title="Events & Occasions" items={events} />
                    <Group title="Results & Resources" items={resultsResources} />

                    {/* Legal & Contact group with tel/sms as <a> */}
                    <details className="group border rounded-lg mx-4" open={false}>
                      <summary className="flex items-center justify-between cursor-pointer px-3 py-2 text-sm font-semibold">
                        <span>Legal & Contact</span>
                        <svg
                          className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </summary>
                      <ul className="px-2 pb-2 space-y-1">
                        {legalContact.map(({ href, label }) => (
                          <li key={href}>
                            <Link href={href} className={linkCls(href)} onClick={() => toggleOffcanvas(false)}>
                              {label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <a href="tel:+13177631142" className="block w-full px-3 py-2 rounded hover:bg-gray-100">
                            Call: (317) 763-1142
                          </a>
                        </li>
                        <li>
                          <a href="sms:+13177631142" className="block w-full px-3 py-2 rounded hover:bg-gray-100">
                            Text: (317) 763-1142
                          </a>
                        </li>
                      </ul>
                    </details>
                  </div>
                </>
              );
            })()}
          </div>
        </aside>
      </div>
    </>
  );
}

export default HeaderTwo;
