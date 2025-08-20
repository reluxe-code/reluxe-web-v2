// components/header/header-1.js

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { FaBars } from 'react-icons/fa'
import { AiOutlineClose } from 'react-icons/ai'
import { OffcanvasData } from './offcanvas-data'
import WhiteLogo from './white-logo'

function HeaderOne() {
  const [offcanvas, setOffcanvas] = useState(false)
  const showOffcanvas = () => setOffcanvas(!offcanvas)

  const header = useRef()
  useEffect(() => {
    window.addEventListener('scroll', isSticky)
    return () => {
      window.removeEventListener('scroll', isSticky)
    }
  }, [])

  const isSticky = () => {
    const scrollTop = window.scrollY
    scrollTop >= 90
      ? header.current?.classList.add('is-sticky')
      : header.current?.classList.remove('is-sticky')
  }

  const router = useRouter()
  const headerCss = `flex lg:justify-end justify-end items-center gap-4`

  return (
    <>
      <header className="absolute w-full z-10">
        <div className="sticky-holder header-section sticky-style-1" ref={header}>
          <div className="custom-container container">
            <div className="grid grid-cols-12 items-center py-4">
              {/* Logo */}
              <div className="lg:col-span-2 col-span-6">
                <div className="pl-2">
                  <WhiteLogo />
                </div>
              </div>

              {/* Main Nav */}
              <div className="lg:col-span-7 lg:block hidden">
                <nav className="pl-8">
                  <ul className="main-menu text-white flex">
                    <li className="relative group">
                      <Link href="/" className={router.pathname === '/' ? 'active' : ''}>
                        <span>Home</span>
                      </Link>
                    </li>

                    <li className="relative group">
                      <Link
                        href="/locations/westfield"
                        className={router.pathname === '/locations/westfield/' ? 'active' : ''}>
                        <span>Westfield</span>
                      </Link>
                    </li>

                    <li className="relative group">
                      <Link
                        href="/locations/carmel"
                        className={router.pathname === '/locations/carmel/' ? 'active' : ''}>
                        <span>Carmel</span>
                      </Link>
                    </li>

                    <li className="relative group">
                      <Link
                        href="/services/"
                        className={router.pathname === '/services/' ? 'active' : ''}>
                        <span>Services</span>
                      </Link>
                    </li>

                    <li className="relative group">
                      <Link href="/shop" className={router.pathname === '/locations' ? 'active' : ''}>
                        <span>Shop</span>
                      </Link>
                    </li>

                    <li className="relative group">
                      <Link
                        href="/contact"
                        className={router.pathname === '/contact' ? 'active' : ''}>
                        <span>Contact</span>
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* CTAs */}
              <div className="lg:col-span-3 col-span-6">
                <div className={`outer-box ${headerCss}`}>
                  <Link
                    href="#"
                    className="bg-white text-black px-4 py-2 rounded text-sm font-semibold hover:bg-gray-200 transition book">
                    
                      Book Now
                    
                  </Link>
                  <Link
                    href="/profile"
                    className="border border-white text-white px-4 py-2 rounded text-sm font-medium hover:bg-white hover:text-black transition">
                    
                      My Profile
                    
                  </Link>
                  <div className="offcanvas-area">
                    <div className="offcanvas">
                      <button
                        type="button"
                        className="menu-bars flex text-white text-[24px]"
                        aria-label="Menu"
                      >
                        <FaBars onClick={showOffcanvas} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Offcanvas Menu */}
      <div className="offcanvas-menu-holder" onClick={showOffcanvas}>
        <div className={offcanvas ? 'offcanvas-menu-wrap active' : 'offcanvas-menu-wrap'}>
          <nav className="offcanvas-menu" onClick={(e) => e.stopPropagation()}>
            <ul className="offcanvas-menu-items">
              <li className="navbar-toggle flex justify-between items-center pb-[15px]">
                <div className="logo" onClick={showOffcanvas}>
                  <Link href="/">

                    <Image
                      src="/images/logo/logo-2.png"
                      alt="Logo"
                      width={210}
                      height={70}
                    />

                  </Link>
                </div>
                <button
                  type="button"
                  className="menu-bars text-[24px] opacity-80 hover:opacity-50 transition-all tox"
                  aria-label="Close Menu"
                >
                  <AiOutlineClose onClick={showOffcanvas} />
                </button>
              </li>
              {OffcanvasData.map((item) => (
                <li key={item.id} className={item.cName}>
                  <Link href={item.path}>

                    <span onClick={showOffcanvas}>
                      {item.title}
                    </span>

                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default HeaderOne
