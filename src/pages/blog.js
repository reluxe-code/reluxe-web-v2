// src/pages/blog.js
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { Tab } from '@headlessui/react'
import Layout from '@/components/layout/layout'
import HeaderTwo from '@/components/header/header-2'

/**
 * Splits on " // " and inserts a <br/>
 */
function LabelWithBreak({ text }) {
  const [first, second] = text.split(/\s*\/\/\s*/)
  return (
    <span className="whitespace-nowrap text-sm font-medium">
      {first}
      {second && (
        <>
          <br />
          {second}
        </>
      )}
    </span>
  )
}

export default function BlogIndex({ posts, categories }) {
  // prepend an "All" tab
  const tabs = [{ id: 'all', slug: 'all', name: 'ALL' }, ...categories]

  return (
    <Layout>
      <Head>
        <title>Blog | RELUXE Med Spa</title>
      </Head>

      <HeaderTwo
        title="Our Blog"
        subtitle="Latest tips, news & offers"
        image="/images/blog/blog-hero.jpg"
      />

      {/* RE[CONNECT] with Background */}
      <section className="relative w-full overflow-hidden">
        {/* background image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/blog/connect-bg.jpg"
            alt="Connect background"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
          />
          {/* optional dark overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* text content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">
            RE[CONNECT]
          </h2>
          <p className="mt-4 text-lg text-gray-200">
            Insights. Inspiration. Innovation.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tab.Group>
          {/* ----- Tab List ----- */}
          <Tab.List className="flex space-x-4 overflow-x-auto border-b border-gray-200 pb-4 no-scrollbar">
            {tabs.map((cat) => (
              <Tab
                key={cat.slug}
                className={({ selected }) =>
                  `px-3 py-2 transition ${
                    selected
                      ? 'text-reluxe-primary border-b-2 border-reluxe-primary'
                      : 'text-gray-600 hover:text-gray-800'
                  }`
                }
              >
                <LabelWithBreak text={cat.name} />
              </Tab>
            ))}
          </Tab.List>

          {/* ----- Tab Panels ----- */}
          <Tab.Panels className="mt-8">
            {tabs.map((cat) => (
              <Tab.Panel key={cat.slug}>
                <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
                  {posts
                    .filter((post) =>
                      cat.slug === 'all'
                        ? true
                        : post.categories.includes(cat.id)
                    )
                    .map((post) => {
                      const media = post._embedded?.['wp:featuredmedia']?.[0]
                      const img =
                        media?.media_details?.sizes?.medium?.source_url ||
                        media?.source_url ||
                        '/images/blog/default-card.jpg'
                      const date = new Date(post.date).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )

                      return (
                        <article
                          key={post.id}
                          className="group bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden"
                        >
                          <div className="relative h-48 w-full">
                            <Link href={`/blog/${post.slug}`} legacyBehavior>
                              <a className="block h-full w-full">
                                <Image
                                  src={img}
                                  alt={post.title.rendered}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </a>
                            </Link>
                          </div>
                          <div className="p-6">
                            <time className="text-xs text-gray-500">{date}</time>
                            <h2 className="mt-2 text-lg font-semibold text-gray-800 group-hover:text-reluxe-primary transition-colors">
                              <Link href={`/blog/${post.slug}`} legacyBehavior>
                                <a>{post.title.rendered}</a>
                              </Link>
                            </h2>
                            <p
                              className="mt-2 text-gray-600 text-sm"
                              dangerouslySetInnerHTML={{
                                __html: post.excerpt.rendered
                                  .slice(0, 100)
                                  .replace(/<\/?[^>]+(>|$)/g, '') + '…',
                              }}
                            />
                            <Link href={`/blog/${post.slug}`} legacyBehavior>
                              <a className="inline-block mt-4 text-reluxe-primary font-medium hover:underline">
                                Read more →
                              </a>
                            </Link>
                          </div>
                        </article>
                      )
                    })}
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </main>
    </Layout>
  )
}

export async function getStaticProps() {
  const WP_API = process.env.WP_API
  if (!WP_API) throw new Error('Missing WP_API env var')

  const [postsRes, catsRes] = await Promise.all([
    fetch(`${WP_API}/posts?_embed&per_page=100`),
    fetch(`${WP_API}/categories`)
  ])

  if (!postsRes.ok || !catsRes.ok) {
    throw new Error('Failed to fetch blog data')
  }

  const posts = await postsRes.json()
  const categories = await catsRes.json()

  return {
    props: { posts, categories },
    revalidate: 60,
  }
}
