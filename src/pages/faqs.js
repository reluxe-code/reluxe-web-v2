// src/pages/faq.js
import { useRef, useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Tab, Disclosure } from '@headlessui/react'
import { AiOutlineQuestionCircle, AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Layout from '@/components/layout/layout'
import HeaderTwo from '@/components/header/header-2'
import faqData from '@/data/faqs'

export default function FAQPage() {
  // remove any empty keys
  const sections = Object.keys(faqData).filter(Boolean)

  // refs & state for scrolling tabs
  const listRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateArrows() {
    const el = listRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 1)
  }

  function scrollTabs(dir) {
    const el = listRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  useEffect(() => {
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [])

  // Build FAQ schema from all sections
  const allFaqs = sections.flatMap(sec => (faqData[sec] || []))
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <Layout>
      <Head>
        <title>FAQs | RELUXE Med Spa in Westfield & Carmel, IN</title>
        <meta name="description" content="Frequently asked questions about RELUXE Med Spa. Learn about Botox, facials, injectables, booking, cancellations, and more at our Westfield & Carmel locations." />
        <link rel="canonical" href="https://reluxemedspa.com/faqs" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      {/* Hero */}
      <HeaderTwo
        title="Frequently Asked Questions"
        subtitle="Everything you need to know before your visit"
        image="/images/faq/faq-hero.jpg"
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tab.Group>
          <div className="relative mb-4">
            {/* label above tabs */}
            <p className="text-sm text-gray-600 mb-2">Browse by category:</p>

            {/* left arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scrollTabs('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
              </button>
            )}

            {/* tab list */}
            <Tab.List
              ref={listRef}
              onScroll={updateArrows}
              className="flex space-x-3 overflow-x-auto no-scrollbar px-8 py-2"
            >
              {sections.map((sec) => (
                <Tab
                  key={sec}
                  className={({ selected }) =>
                    `whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      selected
                        ? 'bg-reluxe-primary text-black shadow-lg'
                        : 'text-gray-600 hover:bg-reluxe-primary/10 hover:text-reluxe-primary'
                    }`
                  }
                >
                  {sec}
                </Tab>
              ))}
            </Tab.List>

            {/* right arrow */}
            {canScrollRight && (
              <button
                onClick={() => scrollTabs('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* panels */}
          <Tab.Panels className="space-y-12">
            {sections.map((sec) => (
              <Tab.Panel key={sec}>
                {/* banner image */}
                <div className="relative h-48 w-full mb-8 rounded-xl overflow-hidden shadow">
                  <Image
                    src={`/images/faq/${sec
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')}.jpg`}
                    alt={sec}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>

                {/* accordions */}
                <div className="space-y-4">
                  {faqData[sec].map(({ q, a }) => (
                    <Disclosure
                      key={q}
                      as="div"
                      className="bg-white rounded-xl shadow-sm border border-gray-200"
                    >
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="w-full flex items-center justify-between px-6 py-4 text-left">
                            <div className="flex items-center space-x-2">
                              <AiOutlineQuestionCircle className="w-5 h-5 text-reluxe-primary" />
                              <span className="font-semibold text-gray-800">{q}</span>
                            </div>
                            {open ? (
                              <AiOutlineMinus className="w-5 h-5 text-gray-500" />
                            ) : (
                              <AiOutlinePlus className="w-5 h-5 text-gray-500" />
                            )}
                          </Disclosure.Button>
                          <Disclosure.Panel className="px-6 pb-4 text-gray-700">
                            {a}
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))}
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </main>
    </Layout>
  )
}
