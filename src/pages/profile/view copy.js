// pages/profile/view.js
import { useRouter } from 'next/router'
import Head from 'next/head'
import HeaderTwo from '@/components/header/header-2'

export default function ProfileView() {
  const router = useRouter()
  const { title, url } = router.query

  if (!url) return null

  return (
    <>
      <Head>
        <title>{title || 'Profile'} | RELUXE Med Spa</title>
      </Head>
      <HeaderTwo />
      <div className="h-[calc(100vh-130px)]">
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    </>
  )
}
