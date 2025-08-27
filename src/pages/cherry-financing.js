import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'
import FinanceEstimator from '@/components/finance/FinanceEstimator';

const APPLY_URL = 'https://withcherry.com/patient/apply/?partner_id=reluxemedspa' // Replace with your partner link

export default function CherryFinancingPage() {
  return (
    <>
      <Head>
        <title>Cherry Med Spa Financing | Carmel & Westfield | RELUXE Med Spa</title>
        <meta
          name="description"
          content="RELUXE Med Spa offers flexible payment plans with Cherry Financing in Carmel & Westfield. Split Botox, fillers, facials, laser, and memberships into monthly payments—no hard credit check."
        />
        <link rel="canonical" href="https://reluxemedspa.com/cherry-financing" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">Cherry Financing at RELUXE Med Spa</h1>
          <p className="mt-4 text-lg text-neutral-300">
            Get the treatments you want—Botox, fillers, facials, laser hair removal, and more—without waiting. 
            Cherry lets you split payments into easy monthly plans, with <strong>no hard credit check</strong>.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Apply Now with Cherry
            </a>
            <a href="/book/" className="px-6 py-3 rounded-2xl font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition">
              Book a Consult
            </a>
          </div>
        </div>
      </section>


      <div className="mt-8">
        <FinanceEstimator
        mode="estimator"
        imageSide="left"
        imageSrc="/images/finance/cherry.png"
        qrSrc="/images/finance/qr-apply.png"
        services={[
            { label: '30 Units of Jeuveau', price: 360 },
            { label: 'FDA Dosage - Full Face Tox', price: 896 },
            { label: 'Skinpen Package (4)', price: 1400 },
            { label: 'Unlimited Laser Hair', price: 2500 },
            { label: 'Morpheus8 Package (3)', price: 3000 },
        ]}
        />
    </div>

    {/* How It Works */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">How Cherry Financing Works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StepCard
              num="1"
              title="Apply in Seconds"
              copy="Fill out a quick application online or in our office. Approval is fast—with no hard credit check."
            />
            <StepCard
              num="2"
              title="Choose Your Plan"
              copy="Select from flexible payment options that fit your budget. Break payments into manageable monthly installments."
            />
            <StepCard
              num="3"
              title="Get Treated Today"
              copy="Enjoy Botox, fillers, facials, laser, or body contouring now—and pay later over time."
            />
          </div>
          <div className="mt-10 text-center">
            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg">
              Apply with Cherry
            </a>
          </div>
        </div>
      </section>

      {/* Example Payment Scenarios */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-center">See What’s Possible with Cherry</h2>
        <p className="mt-3 text-neutral-600 text-center max-w-2xl mx-auto">
          With Cherry, your self-care plan becomes affordable and stress-free. Here are some examples:
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ExampleCard
            title="Botox® or Jeuveau®"
            copy="Average treatment $360–$575. With Cherry, split into 3 monthly payments of around $120–$190."
          />
          <ExampleCard
            title="Filler Packages"
            copy="Full-face balancing or lips ($600–$1,200). Finance with Cherry in 6–12 payments as low as $55/month."
          />
          <ExampleCard
            title="Laser Hair Removal"
            copy="Unlimited laser hair removal packages start at $500. Apply Cherry to pay as low as $45/month."
          />
          <ExampleCard
            title="Morpheus8 or EvolveX"
            copy="Transformative series ($1,500+). Use Cherry to spread cost into manageable payments."
          />
          <ExampleCard
            title="Facials & Memberships"
            copy="Monthly memberships, HydraFacial®, or Glo2Facial®. Finance a year of glowing skin affordably."
          />
          <ExampleCard
            title="Wedding or Event Prep"
            copy="Bundle tox, facials, and laser ahead of your big day—pay monthly with Cherry."
          />
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold">Why Patients Love Cherry</h2>
          <ul className="mt-6 space-y-3 text-neutral-700 text-left max-w-2xl mx-auto list-disc pl-5">
            <li>No hard credit check—applying won’t impact your credit score</li>
            <li>High approval rates, even for first-time patients</li>
            <li>Choose from flexible plans that fit your lifestyle</li>
            <li>Quick and easy—apply in minutes, use instantly</li>
            <li>Make self-care a priority without stressing about payment upfront</li>
          </ul>
          <div className="mt-10">
            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg">
              Apply Now
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold">Make Your Dream Treatments Affordable</h2>
          <p className="mt-3 text-neutral-200">
            From Botox and filler to facials, body contouring, and laser—RELUXE and Cherry make it easy to invest in yourself now and pay later.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-2xl font-semibold text-white bg-white/20 ring-1 ring-white/30 hover:bg-white/30 transition">
              Apply Now
            </a>
            <a href="/book/" className="px-6 py-3 rounded-2xl font-semibold text-white bg-black/40 ring-1 ring-white/20 hover:bg-black/50 transition">
              Book a Consult
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

// --- Components ---
function StepCard({ num, title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
        {num}
      </div>
      <h3 className="mt-4 font-bold text-xl">{title}</h3>
      <p className="mt-2 text-neutral-700">{copy}</p>
    </div>
  )
}

function ExampleCard({ title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h4 className="font-bold text-lg">{title}</h4>
      <p className="mt-2 text-neutral-700">{copy}</p>
    </div>
  )
}
