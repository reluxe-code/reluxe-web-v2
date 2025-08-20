// src/components/locations/CollaborationSection.js

import { FiActivity, FiHeart, FiLayers } from 'react-icons/fi'

export default function CollaborationSection({
  locationSlug = '',
  partnerName = 'House of Health',
  partnerLead = 'Dr. Tracy Warhop & team',
  partnerUrl = '#'
}) {
  const slug = String(locationSlug).toLowerCase()
  if (slug !== 'carmel') return null

  return (
    <section className="relative py-14">
      <div className="absolute inset-0 bg-gradient-to-r from-azure/40 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1">
              <span className="inline-block text-xs tracking-widest uppercase text-gray-500">Carmel Collaboration</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">
                RELUXE × {partnerName}: collaborating & sharing space at our combined second location
              </h2>
              <p className="text-gray-600 mt-3">
                We’re partnering with <strong>{partnerName}</strong> ({partnerLead}) to bring advanced wellness options
                alongside RELUXE aesthetics. We’re independent businesses working together in our shared Carmel space—so you can pair
                injectables, facials, and lasers with wellness-forward options under one roof.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <Feature icon={<FiLayers className="h-5 w-5" />} title="Independent, Together">
                  Two independent teams, one convenient shared space—clear, coordinated care.
                </Feature>
                <Feature icon={<FiActivity className="h-5 w-5" />} title="Wellness Add-Ons">
                  Ask about IVs, hyperbaric chambers, ozone, and red light therapy via our partners.
                </Feature>
                <Feature icon={<FiHeart className="h-5 w-5" />} title="Holistic Plans">
                  Recovery and skin health that complement your aesthetic goals.
                </Feature>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/services" className="px-5 py-2 rounded-md text-sm font-semibold bg-black text-white hover:opacity-90">
                  Book at RELUXE Carmel
                </a>
                <a href={partnerUrl} className="px-5 py-2 rounded-md text-sm font-semibold border border-black hover:bg-black hover:text-white transition-colors">
                  Learn about {partnerName}
                </a>
              </div>
            </div>

            {/* Side visual */}
            <div className="md:w-[420px] w-full">
              <div className="rounded-2xl bg-azure/30 border border-azure/60 p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-widest text-gray-600">Aesthetics + Wellness</div>
                  <div className="text-4xl font-extrabold mt-1">RELUXE</div>
                  <div className="text-xl font-semibold mt-1">×</div>
                  <div className="text-2xl font-bold mt-1">{partnerName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* tiny footnote */}
          <p className="text-xs text-gray-500 mt-6">
            Availability and pricing for partner services are managed by {partnerName}. Ask our team for details.
          </p>
        </div>
      </div>
    </section>
  )
}

function Feature({ icon, title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-1">
        <div className="rounded-full bg-azure/70 p-2">{icon}</div>
        <p className="font-semibold">{title}</p>
      </div>
      <p className="text-sm text-gray-600">{children}</p>
    </div>
  )
}
