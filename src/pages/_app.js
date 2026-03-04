// pages/_app.js
import Head from 'next/head'
import PropTypes from 'prop-types'
import Layout from '../components/layout/layout'

import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useGAUX } from '@/hooks/useGAUX'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { captureTrackingToken } from '@/lib/trackingToken'
import { captureConciergeToken } from '@/lib/concierge/conciergeToken'
import { useAuditTracker } from '@/hooks/useAuditTracker'

// Extracted script components
import AnalyticsScripts, { GA_ID } from '@/components/analytics/AnalyticsScripts'
import BoulevardScripts from '@/components/booking/BoulevardScripts'

// Location preference provider & chooser
import { LocationProvider } from '@/context/LocationContext'
import { MemberProvider } from '@/context/MemberContext'
import LocationChooserModal from '@/components/location/LocationChooserModal'
import MemberDrawerPortal from '@/components/beta/MemberDrawerPortal'
import { fontPairings } from '@/components/preview/tokens'
import dynamic from 'next/dynamic'

const AnnouncementModal = dynamic(() => import('@/components/promo/AnnouncementModal'), { ssr: false })
const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), { ssr: false })

// Guard against React DOM crash when browser extensions or mobile autofill
// modify the DOM outside of React's control. The "removeChild" error
// ("The object can not be found here" on WebKit) happens when React tries
// to unmount a node that was already moved/removed by SMS autofill or
// password managers. This patch is a standard React community fix.
if (typeof window !== 'undefined') {
  const origRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      return child
    }
    return origRemoveChild.apply(this, arguments)
  }
  const origInsertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function (newNode, refNode) {
    if (refNode && refNode.parentNode !== this) {
      return newNode
    }
    return origInsertBefore.apply(this, arguments)
  }
}

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

function waitForGtag(cb, maxTries = 120) {
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
  useAuditTracker()
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

  // Capture Bird tracking token from ?t= and concierge token from ?cg_token= on any page
  useEffect(() => { captureTrackingToken(); captureConciergeToken() }, [])

  // Per-page layout: if a page exports getLayout, use it (e.g. preview pages bypass the default Layout)
  const getLayout = Component.getLayout

  if (getLayout) {
    return (
      <>
        <AnalyticsScripts />
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="shortcut icon" href="/favicon.png" />
        </Head>
        {getLayout(<Component {...pageProps} />)}
        <ChatWidget />
        <Analytics />
        <SpeedInsights />
      </>
    )
  }

  return (
    <>
      <script src="/blvd-widget.js" defer />
      <AnalyticsScripts />
      <BoulevardScripts />

      <LocationProvider>
        <MemberProvider>
          <Layout>
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="shortcut icon" href="/favicon.png" />
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              <link rel="stylesheet" href={fontPairings.bold.googleUrl} />
              {/* Default OG image — overridden by any page that sets its own og:image */}
              <meta property="og:image" content="https://reluxemedspa.com/images/og/new-default-1200x630.png" />
              <meta property="og:image:width" content="1200" />
              <meta property="og:image:height" content="630" />
              <meta property="og:image:type" content="image/png" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:image" content="https://reluxemedspa.com/images/og/new-default-1200x630.png" />
            </Head>

            <Component {...pageProps} />
            <LocationChooserModal />
            <AnnouncementModal />
          </Layout>
          <MemberDrawerPortal fonts={fontPairings.bold} />
          <ChatWidget />
        </MemberProvider>
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
