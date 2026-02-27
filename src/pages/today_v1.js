import Head from 'next/head'
import { useRouter } from 'next/router'
import GetInFastWidget from '@/components/booking/GetInFastWidget'

export default function TodayV1Page() {
  const router = useRouter()
  const { locationId, providerId, serviceId, serviceCategoryId } = router.query || {}

  return (
    <>
      <Head>
        <title>Today Availability | RELUXE</title>
        <meta
          name="description"
          content="Live same-day and near-term appointment openings at RELUXE. Availability updates live and some times fill quickly."
        />
      </Head>

      <main
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(1200px 700px at 50% -8%, rgba(124,58,237,0.24), transparent 62%), #0f0b18',
          padding: '0.85rem',
        }}
      >
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <GetInFastWidget
            locationId={typeof locationId === 'string' ? locationId : undefined}
            providerId={typeof providerId === 'string' ? providerId : undefined}
            serviceId={typeof serviceId === 'string' ? serviceId : undefined}
            serviceCategoryId={typeof serviceCategoryId === 'string' ? serviceCategoryId : undefined}
            maxResults={9}
            showSocialProofCards
          />
        </div>
      </main>
    </>
  )
}
