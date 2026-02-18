// pages/_app.js
import Head from 'next/head'
import PropTypes from 'prop-types'
import Layout from '../components/layout/layout'
import { ScrollToTop } from '../components/scroll'
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useGAUX } from '@/hooks/useGAUX'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Extracted script components
import AnalyticsScripts, { GA_ID } from '@/components/analytics/AnalyticsScripts'
import BoulevardScripts from '@/components/booking/BoulevardScripts'

// Location preference provider & chooser
import { LocationProvider } from '@/context/LocationContext'
import LocationChooserModal from '@/components/location/LocationChooserModal'

// Pageview helpers
function sendGAPageview(url) {
  if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
  })
}

function sendFBPageview() {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView')
  }
}

function waitForGtag(cb, maxTries = 60) {
  let tries = 0
  const t = setInterval(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function' && window.__gaReady) {
      clearInterval(t)
      cb()
    } else if (++tries >= maxTries) {
      clearInterval(t)
    }
  }, 50)
}

function MyApp({ Component, pageProps }) {
  useGAUX()
  const router = useRouter()

  useEffect(() => {
    const firstUrl = window.location.pathname + window.location.search

    waitForGtag(() => {
      sendGAPageview(firstUrl)
    })

    if (!window.__fbPageviewSent) {
      sendFBPageview()
      window.__fbPageviewSent = true
    }

    const handleRoute = (url) => {
      sendGAPageview(url)
      sendFBPageview()
    }

    router.events.on('routeChangeComplete', handleRoute)
    router.events.on('hashChangeComplete', handleRoute)

    return () => {
      router.events.off('routeChangeComplete', handleRoute)
      router.events.off('hashChangeComplete', handleRoute)
    }
  }, [router.events])

  return (
    <>
      <script src="/blvd-widget.js" defer />
      <AnalyticsScripts />
      <BoulevardScripts />

      <LocationProvider>
        <Layout>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="shortcut icon" href="/favicon.png" />
          </Head>

          <Component {...pageProps} />
          <ScrollToTop />
          <LocationChooserModal />
        </Layout>
      </LocationProvider>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
}

export default MyApp
