// pages/landing/lhr-carmel.js
// Permanent redirect to the new LHR landing page — preserves UTM params for ad traffic

export async function getServerSideProps({ query }) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => {
    if (v) params.set(k, v)
  })
  const qs = params.toString()
  return {
    redirect: {
      destination: `/landing/lhr${qs ? `?${qs}` : ''}`,
      permanent: true,
    },
  }
}

export default function LhrCarmelRedirect() {
  return null
}
