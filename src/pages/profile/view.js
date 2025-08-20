// pages/profile/view.js
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function ProfileMobileView() {
  const router = useRouter()
  const [url, setUrl] = useState('')

  useEffect(() => {
    const link = router.query.url
    if (link) {
      setUrl(decodeURIComponent(link))
    }
  }, [router.query.url])

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="bg-black text-white p-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 text-white font-bold"
        >
          ← Back
        </button>
        <h1 className="text-lg font-semibold">Your RELUXE Hub</h1>
      </div>
      {url && (
        <iframe
          src={url}
          className="w-full h-full border-none"
          title="RELUXE View"
        />
      )}
    </div>
  )
}
