// src/pages/blog/[slug].js

import React from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/layout'
import HeaderTwo from '@/components/header/header-2'

/**
 * Helper: splits a raw title into words,
 * appends a dot after each except the last,
 * and wraps them with RE[ ... ]
 */
function FancyTitle({ raw }) {
  const words = raw.split(/\s+/).filter(Boolean)
  return (
    <h1
      className={`
        flex flex-wrap justify-center text-center
        font-black leading-tight
        text-4xl sm:text-5xl lg:text-6xl
        mb-4
      `}
    >
      {/* opening brand bracket */}
      <span className="mr-2">RE[</span>

      {/* each word + dot */}
      {words.map((w, i) => {
        const isLast = i === words.length - 1
        return (
          <span
            key={i}
            className={`inline-block mr-2 ${!isLast ? 'after:content-["."]' : ''}`}
          >
            {w}
          </span>
        )
      })}

      {/* closing bracket */}
      <span>]</span>
    </h1>
  )
}

export default function PostPage({ post, featuredUrl, publishedDate }) {
  const router = useRouter()
  if (router.isFallback) {
    return <Layout><p>Loading…</p></Layout>
  }

  return (
    <Layout>
      <Head>
        <title>{post.title.rendered} | RELUXE Med Spa</title>
        <meta name="description" content={post.excerpt.rendered.replace(/<[^>]+>/g, '')} />
      </Head>

      {/* Hero with FancyTitle */}
      <HeaderTwo
        title={<FancyTitle raw={post.title.rendered} />}
        subtitle={publishedDate}
        image={featuredUrl ?? '/images/blog/blog-hero.jpg'}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured image */}
        {featuredUrl && (
          <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={featuredUrl}
              alt={post.title.rendered}
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}

        {/* Post content */}
        <article
          className="prose prose-lg mx-auto"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </main>
    </Layout>
  )
}

/**
 * Generate all slugs
 */
export async function getStaticPaths() {
  const WP_API = process.env.WP_API
  const res = await fetch(`${WP_API}/posts?_fields=slug&per_page=100`)
  const posts = await res.json()

  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: true,
  }
}

/**
 * Fetch a single post by slug
 */
export async function getStaticProps({ params }) {
  const WP_API = process.env.WP_API
  // fetch post data
  const postRes = await fetch(`${WP_API}/posts?slug=${params.slug}&_embed`)
  const [post] = await postRes.json()

  if (!post) {
    return { notFound: true }
  }

  // extract featured image URL if present
  const featuredUrl =
    post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null

  // format date
  const publishedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    props: { post, featuredUrl, publishedDate },
    revalidate: 60 * 5, // ISR: every 5 minutes
  }
}
