// pages/search.js
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import HeaderTwo from '../components/header/header-2'
import { supabase } from '@/lib/supabase'

const LOCAL_INDEX_URL = '/search-index.json' // optional local index (put in /public)

/** Small helper for highlighting matched terms */
function highlight(text = '', q = '') {
  if (!q) return text
  try {
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig')
    return text.split(re).map((chunk, i) =>
      re.test(chunk) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{chunk}</mark> : <span key={i}>{chunk}</span>
    )
  } catch {
    return text
  }
}

export default function SearchPage() {
  const router = useRouter()
  const inputRef = useRef(null)
  const q = (router.query.q || '').toString().trim()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [localResults, setLocalResults] = useState([])   // from /search-index.json
  const [wpResults, setWpResults] = useState([])         // from WP search API

  // Kick focus into the input on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [])

  // Run searches when q changes
  useEffect(() => {
    let active = true
    async function run() {
      if (!q) {
        setLocalResults([])
        setWpResults([])
        setError('')
        return
      }
      setLoading(true)
      setError('')
      try {
        const [localIdx, wp] = await Promise.all([
          fetchLocalIndex(q),
          searchBlogPosts(q)
        ])
        if (!active) return
        setLocalResults(localIdx)
        setWpResults(wp)
      } catch (e) {
        if (!active) return
        setError('There was a problem searching. Please try again.')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [q])

  /** Submit handler (keeps URL in sync) */
  const onSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const nextQ = (fd.get('q') || '').toString().trim()
    router.push({ pathname: '/search', query: nextQ ? { q: nextQ } : {} })
  }

  const hasAny = (localResults?.length || 0) + (wpResults?.length || 0) > 0

  return (
    <>
      <Head>
        <title>{q ? `Search: ${q} | RELUXE Med Spa` : 'Search | RELUXE Med Spa'}</title>
        <meta
          name="description"
          content="Search RELUXE Med Spa services, conditions, events, locations, and blog guides."
        />
        <link rel="canonical" href="https://reluxemedspa.com/search" />
        <meta name="robots" content="noindex, follow" />
      </Head>

      <HeaderTwo />

      {/* Hero / Search bar */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Search RELUXE</h1>
          <p className="mt-3 text-neutral-300">Find services, what we treat, events, providers, and more.</p>

          <form onSubmit={onSubmit} className="mt-6 flex items-stretch gap-2">
            <input
              ref={inputRef}
              name="q"
              defaultValue={q}
              type="search"
              inputMode="search"
              placeholder="Search treatments, concerns, locations, posts…"
              className="w-full rounded-xl bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 outline-none ring-2 ring-transparent focus:ring-violet-500"
              aria-label="Search the site"
            />
            <button
              type="submit"
              className="rounded-xl px-5 py-3 font-semibold bg-white text-neutral-900 hover:bg-neutral-100 transition"
            >
              Search
            </button>
          </form>
          {q && (
            <p className="mt-2 text-sm text-neutral-400">
              Showing results for <span className="font-semibold text-white">{q}</span>
            </p>
          )}
        </div>
      </section>

      {/* Results */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="animate-pulse text-neutral-600">Searching…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
            {error}
          </div>
        )}

        {!loading && !error && q && hasAny && (
          <div className="grid gap-10">
            {/* Local index results (site pages / services / conditions you index) */}
            {localResults?.length > 0 && (
              <ResultSection
                title="Site Pages"
                results={localResults}
                q={q}
                badgeColor="bg-violet-100 text-violet-700"
              />
            )}

            {/* Blog/guide results */}
            {wpResults?.length > 0 && (
              <ResultSection
                title="From the Blog"
                results={wpResults}
                q={q}
                badgeColor="bg-blue-100 text-blue-700"
              />
            )}
          </div>
        )}

        {!loading && !error && q && !hasAny && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <h3 className="text-lg font-bold">No results for “{q}”</h3>
            <p className="mt-2 text-neutral-600">Try a simpler phrase: “Botox”, “Morpheus8”, “under-eye”, “Westfield”.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
              {['botox', 'morpheus8', 'under-eye', 'laser hair removal', 'wedding prep', 'facials'].map((s) => (
                <Link
                  key={s}
                  href={{ pathname: '/search', query: { q: s } }}
                  className="rounded-full bg-neutral-100 px-3 py-1 hover:bg-neutral-200"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && !q && (
          <div className="grid gap-6">
            <QuickLinks />
          </div>
        )}
      </main>
    </>
  )
}

/* ----------------- Helpers & Components ----------------- */

function ResultSection({ title, results, q, badgeColor }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
        <span className="text-xs rounded-full px-2 py-1 bg-neutral-100 text-neutral-700">{results.length}</span>
      </div>
      <div className="grid gap-3">
        {results.map((r) => (
          <ResultCard key={r.url} r={r} q={q} badgeColor={badgeColor} />
        ))}
      </div>
    </section>
  )
}

function ResultCard({ r, q, badgeColor }) {
  const domainBadge = r.domain || r.type || 'Result'
  const href = r.url || r.link || '#'
  const desc = r.snippet || r.excerpt || r.description || ''
  const title = r.title?.rendered || r.title
  return (
    <Link
      href={href}
      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition block"
    >
      <div className="flex items-start gap-3">
        <div className={`text-[11px] ${badgeColor} rounded-full px-2 py-1 font-semibold shrink-0`}>
          {domainBadge}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold">{highlight(stripTags(title), q)}</h3>
          {desc && (
            <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
              {highlight(stripTags(desc), q)}
            </p>
          )}
          <p className="mt-1 text-[12px] text-neutral-400">{href}</p>
        </div>
      </div>
    </Link>
  )
}

function QuickLinks() {
  const items = [
    { href: '/services', label: 'All Services' },
    { href: '/conditions', label: 'What We Treat' },
    { href: '/events', label: 'Wedding & Event Prep' },
    { href: '/men', label: 'For Men' },
    { href: '/locations', label: 'Locations' },
    { href: '/blog', label: 'Beauty Notes' },
  ]
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold">Popular destinations</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {items.map((it) => (
          <li key={it.href}>
            <Link className="block rounded-lg px-3 py-2 hover:bg-neutral-100" href={it.href}>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function stripTags(html = '') {
  if (!html) return ''
  if (typeof window === 'undefined') return html.replace(/<[^>]*>?/gm, '')
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/* ----------------- Data fetchers ----------------- */

/** Fetch local index and run fuzzy search (Fuse if available; fallback to includes). */
async function fetchLocalIndex(q) {
  try {
    const res = await fetch(LOCAL_INDEX_URL, { cache: 'no-store' })
    if (!res.ok) throw new Error('index missing')
    const items = await res.json() // [{title,url,content,tags,type}, ...]
    // Try Fuse
    let Fuse = null
    try {
      const m = await import('fuse.js')
      Fuse = m.default || m
    } catch {
      // no fuse installed, use simple filter
    }
    if (Fuse) {
      const fuse = new Fuse(items, {
        includeScore: true,
        threshold: 0.35,
        keys: [
          { name: 'title', weight: 0.6 },
          { name: 'content', weight: 0.3 },
          { name: 'tags', weight: 0.1 },
        ],
      })
      return fuse.search(q).slice(0, 20).map(({ item }) => ({
        ...item,
        domain: item.type || 'Page',
        snippet: item.content?.slice(0, 180),
      }))
    }
    // Fallback: substring search
    const qq = q.toLowerCase()
    return items
      .filter((it) =>
        (it.title || '').toLowerCase().includes(qq) ||
        (it.content || '').toLowerCase().includes(qq) ||
        (Array.isArray(it.tags) ? it.tags.join(' ').toLowerCase().includes(qq) : false)
      )
      .slice(0, 20)
      .map((it) => ({
        ...it,
        domain: it.type || 'Page',
        snippet: it.content?.slice(0, 180),
      }))
  } catch {
    return [] // silently ignore if index doesn’t exist yet
  }
}

/** Search blog posts via Supabase full-text search. */
async function searchBlogPosts(q) {
  try {
    // Use the search_blog_posts RPC function if available, otherwise fall back to ilike
    const { data, error } = await supabase.rpc('search_blog_posts', {
      search_query: q,
      result_limit: 10,
    })

    if (error) {
      // Fallback: simple ilike search
      const { data: fallbackData } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt')
        .eq('status', 'published')
        .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`)
        .limit(10)

      return (fallbackData || []).map((post) => ({
        title: post.title,
        url: `/blog/${post.slug}`,
        snippet: post.excerpt || '',
        type: 'Blog',
        domain: 'Blog',
      }))
    }

    return (data || []).map((post) => ({
      title: post.title,
      url: `/blog/${post.slug}`,
      snippet: post.excerpt || '',
      type: 'Blog',
      domain: 'Blog',
    }))
  } catch {
    return []
  }
}
