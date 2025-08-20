// pages/book-cherry-offer.js
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/layout/layout'

export default function CherryOfferPage() {
  // Countdown state
  const [countdown, setCountdown] = useState('')
  useEffect(() => {
    const end = new Date('2025-09-30T23:59:59').getTime()  // ← your real end date
    const iv = setInterval(() => {
      const now = Date.now()
      const diff = end - now
      if (diff <= 0) {
        setCountdown('Offer Expired')
        clearInterval(iv)
        return
      }
      const d = Math.floor(diff / 864e5)
      const h = Math.floor((diff % 864e5) / 36e5)
      const m = Math.floor((diff % 36e5) / 6e4)
      const s = Math.floor((diff % 6e4) / 1e3)
      setCountdown(`${d}d ${h}h ${m}m ${s}s`)
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  // Savings calculator
  const [spend, setSpend] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const cherryPrice = 299
  function calcSave() {
    const your = parseFloat(spend)||0
    const saved = your - cherryPrice
    setSaveMsg(
      saved > 0
        ? `You save $${saved.toFixed(0)} today!`
        : `Cherry’s offer still only $${cherryPrice}!`
    )
  }

  // Financing opener (replace with your real widget/api)
  function openFinancing(){
    if (window.Laybuy?.init) {
      window.Laybuy.init({ amount: cherryPrice, locale: 'en-US' })
    } else {
      window.location.href = `https://cherry-finance.example.com?amt=${cherryPrice}`
    }
  }

  return (
    <Layout>
      <Head>
        <title>Cherry Special Offer | RELUXE Med Spa</title>
      </Head>

      {/* Hero */}
      <section className="text-center py-20 bg-pink-50">
        <h1 className="text-4xl font-bold mb-4">Cherry Special — Only ${cherryPrice}!</h1>
        <p className="mb-6">Limited-time on our signature Cherry treatment.</p>
        <div className="text-2xl font-semibold text-red-600 mb-8">{countdown}</div>
        <button
          onClick={openFinancing}
          className="bg-red-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-red-700 transition"
        >
          Book with Cherry – ${cherryPrice}
        </button>
        <p className="mt-2 text-sm text-gray-600">Or 4 payments of ${(cherryPrice/4).toFixed(2)}/mo at 0% APR</p>
      </section>

      {/* Video Testimonial */}
      <section className="max-w-3xl mx-auto my-16">
        <h2 className="text-2xl font-semibold text-center mb-6">Why Cherry’s Clients Love It</h2>
        <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://www.youtube.com/embed/VIDEO_ID?rel=0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">See Your Savings</h3>
          <label className="block mb-3">
            Your typical spend: 
            <input
              type="number"
              value={spend}
              onChange={e => setSpend(e.target.value)}
              className="ml-2 border px-2 py-1 w-24"
            />
          </label>
          <button
            onClick={calcSave}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Calculate
          </button>
          {saveMsg && <p className="mt-4 text-lg font-medium">{saveMsg}</p>}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-2xl mx-auto my-16 px-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Cherry Offer FAQs</h2>
        <div className="space-y-4">
          {[
            { q: "Is Cherry’s treatment painful?", a: "Not at all—numbing cream keeps you comfy." },
            { q: "How long do results last?", a: "Up to 4 months, with touch-ups available." },
            { q: "How many sessions will I need?", a: "Most see their best results in one session." },
            { q: "Is there any downtime?", a: "You can return to normal activities immediately." },
            { q: "Who is a good candidate?", a: "Almost everyone—your consult will confirm." },
          ].map(({q,a}, idx) => (
            <details key={idx} className="border rounded-lg p-4">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-gray-700">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </Layout>
  )
}
