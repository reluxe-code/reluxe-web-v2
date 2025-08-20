// src/pages/team/[slug].js

import { gql } from '@apollo/client'
import client from '@/lib/apollo'
import Head from 'next/head'
import HeaderTwo from '@/components/header/header-2'
import Layout from '@/components/layout/layout'
import ResultsSection from '@/components/gallery/ResultsSection'
import HeroSplitSection from '@/components/team/HeroSplitSection'
import ServiceSlider from '@/components/team/ServiceSlider'
import MoreAboutMeSliderSection from '@/components/team/MoreAboutMeSliderSection'

// —————————————————————————————————————————————
// Data fetching
// —————————————————————————————————————————————
export async function getStaticPaths() {
  const { data } = await client.query({
    query: gql`
      query {
        staffs(first: 200) {
          nodes { slug }
        }
      }
    `
  })

  const paths = (data?.staffs?.nodes || []).map((person) => ({
    params: { slug: person.slug }
  }))

  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const { data } = await client.query({
    query: gql`
      query GetStaffBySlug($slug: ID!) {
        staff(id: $slug, idType: SLUG) {
          title
          slug
          featuredImage { node { sourceUrl } }
          staffFields {
            stafftitle
            staffbookingurl
            stafffunfact
            videoIntro
            staffBio
            transparentbg {
              id
              altText
              mediaItemUrl
              sourceUrl
            }
            specialties { specialty }
            credentials { credentialItem }
            availability { day hours }
            socialProfiles { label url }
          }
        }
      }
    `,
    variables: { slug: params.slug }
  })

  if (!data?.staff) return { notFound: true }

  return {
    props: { person: data.staff },
    revalidate: 60
  }
}

// —————————————————————————————————————————————
// Helpers to build UI from queried fields
// —————————————————————————————————————————————
const sliderSettings = {
  slidesPerView: 2,
  breakpoints: { 640: { slidesPerView: 3 }, 1024: { slidesPerView: 5 } },
  loop: true
}

// Map specialties -> logo + href (extend as you add specialties)
const SPECIALTY_ASSETS = [
  { key: /tox|botox|jeuveau|xeomin|dysport/i, title: 'Tox',       img: '/images/service/210x70/jeuveau.png', href: '/services/tox' },
  { key: /filler|lip/i,                         title: 'Filler',    img: '/images/service/210x70/filler.png',  href: '/services/filler' },
  { key: /sculptra/i,                           title: 'Sculptra',  img: '/images/service/210x70/sculptra.png',href: '/services/sculptra' },
  { key: /morpheus/i,                           title: 'Morpheus8', img: '/images/service/210x70/m8.png',      href: '/services/morpheus8' },
  { key: /skinpen|microneed/i,                  title: 'SkinPen',   img: '/images/service/210x70/skinpen.png', href: '/services/skinpen' },
  { key: /ipl|photofacial/i,                    title: 'IPL',       img: '/images/service/210x70/ipl.png',     href: '/services/ipl' },
  { key: /laser hair/i,                         title: 'Hair Removal', img: '/images/service/210x70/lhr.png',  href: '/services/laser-hair-removal' },
  { key: /hydrafacial/i,                        title: 'HydraFacial', img: '/images/service/210x70/hydrafacial.png', href: '/services/hydrafacial' },
  { key: /glo2/i,                               title: 'Glo2Facial', img: '/images/service/210x70/glo2.png',   href: '/services/glo2facial' },
]

// e.g., getStaticProps or getServerSideProps
const now = new Date()
const rotationKey = `${now.getUTCFullYear()}-W${Math.ceil((((now - new Date(Date.UTC(now.getUTCFullYear(),0,1))) / 86400000) + new Date(Date.UTC(now.getUTCFullYear(),0,1)).getUTCDay()+1) / 7)}`


function buildBrandItemsFromSpecialties(specialties = []) {
  const items = []
  const seen = new Set()

  specialties.forEach((sObj) => {
    const name = (sObj?.specialty || '').trim()
    if (!name) return
    // find first matching asset
    const match = SPECIALTY_ASSETS.find(a => a.key.test(name))
    if (match && !seen.has(match.title)) {
      seen.add(match.title)
      items.push({
        id: items.length + 1,
        title: match.title,
        clientimage: match.img,
        href: match.href
      })
    }
  })

  return items
}

function formatCredentials(credentials = []) {
  const list = credentials.map(c => c?.credentialItem).filter(Boolean)
  return list.length ? list.join(' • ') : ''
}

function formatAvailability(avail = []) {
  const list = avail
    .filter(a => a?.day && a?.hours)
    .map(a => `${a.day}: ${a.hours}`)
  return list.length ? list.join(' • ') : ''
}

function formatSpecialties(specialties = []) {
  const list = specialties.map(s => s?.specialty).filter(Boolean)
  return list.length ? list.join(' • ') : ''
}

// —————————————————————————————————————————————
// Page
// —————————————————————————————————————————————
export default function StaffProfile({ person }) {
  const f = person?.staffFields || {}

  const specialties = f?.specialties || []
  const credentials = f?.credentials || []
  const availability = f?.availability || []
  const socials = f?.socialProfiles || []

  // Prefer transparent bg if provided
  const transparentBgUrl = f?.transparentbg?.sourceUrl || f?.transparentbg?.mediaItemUrl || null
  const featuredUrl = person?.featuredImage?.node?.sourceUrl || null
  const heroImageUrl = transparentBgUrl || featuredUrl

  // Build dynamic sections from query
  const brandItems = buildBrandItemsFromSpecialties(specialties)

  const credentialsText = formatCredentials(credentials)
  const availabilityText = formatAvailability(availability)
  const specialtiesText = formatSpecialties(specialties)

  const moreItems = []
  if (credentialsText) {
    moreItems.push({
      title: 'Credentials',
      description: credentialsText,
      footer: 'Verified'
    })
  }
  if (availabilityText) {
    moreItems.push({
      title: 'Availability',
      description: availabilityText,
      footer: 'Current Hours'
    })
  }
  if (specialtiesText) {
    moreItems.push({
      title: 'My Specialties',
      description: specialtiesText,
      footer: 'Most Popular'
    })
  }
  if (f?.stafffunfact) {
    moreItems.push({
      title: 'Fun Fact',
      description: f.stafffunfact,
      footer: person.title
    })
  }

  return (
    <>
      <Head>
        <title>{person.title} | RELUXE Team</title>
        <meta name="description" content={`${person.title} — ${f?.stafftitle || ''} at RELUXE Med Spa`} />
      </Head>

      <HeaderTwo />

      <section className="w-full bg-azure">
        <div className="max-w-5xl mx-auto px-6">
          <HeroSplitSection
            name={person.title}
            subtitle={f?.stafftitle || ''}
            bio={(f?.staffBio || '').replace(/<[^>]*>/g, '')}
            imageUrl={heroImageUrl}
            bookingUrl={f?.staffbookingurl || ''}
            socials={socials}
          />
        </div>
      </section>

      {brandItems.length > 0 && (
        <section className="w-full bg-white">
          <ServiceSlider brandItems={brandItems} settings={sliderSettings} />
        </section>
      )}

      <section name="XXXX" className="w-full bg-white">
        <ResultsSection providerSlug={person.title} rotationKey={rotationKey} />
      </section>

      <section className="w-full bg-white">
        <MoreAboutMeSliderSection
          title={`About ${person.title}`}
          bio={f?.staffBio || ''}
          backgroundImage={heroImageUrl || '/images/staff/default-blur.png'}
          items={moreItems}
        />

        {f?.videoIntro && (
          <div className="mt-10 max-w-5xl mx-auto px-6">
            <h2 className="text-xl font-semibold mb-2">Intro Video</h2>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={f.videoIntro}
                title={`Video intro by ${person.title}`}
                frameBorder="0"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          </div>
        )}
      </section>
    </>
  )
}
