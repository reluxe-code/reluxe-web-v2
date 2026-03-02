import { useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { motion } from 'framer-motion'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, typeScale } from '@/components/preview/tokens'
import { getServiceClient } from '@/lib/supabase'
import { useMember } from '@/context/MemberContext'

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

const VIDEO_EXT = /\.(mp4|mov|webm|avi|mkv|m4v)$/i
function isVideoUrl(url) { return VIDEO_EXT.test(url || '') }

function MediaItem({ url, alt, caption, fonts, maxHeight, style }) {
  if (!url) return null
  const isVideo = isVideoUrl(url)
  return (
    <div>
      {isVideo ? (
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          style={{ width: '100%', borderRadius: 12, maxHeight: maxHeight || 400, objectFit: 'cover', ...style }}
        />
      ) : (
        <img
          src={url}
          alt={alt || ''}
          style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: maxHeight || 400, ...style }}
        />
      )}
      {caption && (
        <p style={{ fontFamily: fonts?.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.35)', marginTop: '0.375rem' }}>{caption}</p>
      )}
    </div>
  )
}

/* ─── Social Embed Component ─── */
function SocialEmbed({ embed, fonts }) {
  const { platform, url, caption } = embed
  if (!url) return null

  if (platform === 'youtube') {
    // Extract video ID from various YouTube URL formats
    const match = url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    const videoId = match?.[1]
    if (!videoId) return null
    return (
      <div>
        <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 16, overflow: 'hidden' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={caption || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
        {caption && (
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', marginTop: '0.5rem', textAlign: 'center' }}>
            {caption}
          </p>
        )}
      </div>
    )
  }

  if (platform === 'instagram') {
    // Extract post/reel ID for embedding
    const postMatch = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
    const postId = postMatch?.[1]
    if (!postId) return null
    return (
      <div>
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={`https://www.instagram.com/p/${postId}/`}
          data-instgrm-version="14"
          style={{
            background: '#1a1a1a',
            border: '1px solid rgba(250,248,245,0.1)',
            borderRadius: 16,
            margin: 0,
            maxWidth: '100%',
            minWidth: 280,
            padding: 0,
            width: '100%',
          }}
        />
        {caption && (
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', marginTop: '0.5rem', textAlign: 'center' }}>
            {caption}
          </p>
        )}
      </div>
    )
  }

  if (platform === 'tiktok') {
    // Extract TikTok video ID from various URL formats:
    // https://www.tiktok.com/@user/video/1234567890
    // https://www.tiktok.com/t/ZTF.../
    // https://vm.tiktok.com/ZTF.../
    const longMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
    const genericMatch = url.match(/\/(\d{15,})/)
    const videoId = longMatch?.[1] || genericMatch?.[1]

    // Use oEmbed iframe approach — works for all URL formats including short links
    return (
      <div>
        <div style={{ position: 'relative', maxWidth: 340, margin: '0 auto' }}>
          {videoId ? (
            <iframe
              src={`https://www.tiktok.com/embed/v2/${videoId}`}
              style={{ width: '100%', height: 580, border: 'none', borderRadius: 12 }}
              allowFullScreen
              allow="encrypted-media"
              title={caption || 'TikTok video'}
            />
          ) : (
            // Fallback: link to TikTok if we can't extract the ID
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '2rem',
                borderRadius: 12,
                background: 'rgba(250,248,245,0.04)',
                border: '1px solid rgba(250,248,245,0.1)',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 8px' }}>
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.64a8.28 8.28 0 004.76 1.5v-3.4a4.84 4.84 0 01-1-.05z" fill={colors.white} />
              </svg>
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>Watch on TikTok</p>
            </a>
          )}
        </div>
        {caption && (
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', marginTop: '0.5rem', textAlign: 'center' }}>
            {caption}
          </p>
        )}
      </div>
    )
  }

  return null
}

/* ─── Reload embed scripts after mount ─── */
function useEmbedScripts(embeds) {
  useEffect(() => {
    if (!embeds?.length) return
    const hasIG = embeds.some((e) => e.platform === 'instagram')
    const hasTT = embeds.some((e) => e.platform === 'tiktok')

    if (hasIG && window.instgrm?.Embeds) {
      window.instgrm.Embeds.process()
    }
    if (hasTT && window.tiktokEmbed?.lib) {
      window.tiktokEmbed.lib.render()
    }
  }, [embeds])
}

export default function StoryDetail({ story }) {
  const { openBookingModal } = useMember()
  const treatments = story?.treatments || []
  const socialEmbeds = story?.social_embeds || []
  const gallery = story?.gallery || []

  // Collect all embeds (page-level + nested in treatments) for script loading
  const treatmentEmbeds = treatments.flatMap((t) => t.embeds || [])
  const allEmbeds = [...socialEmbeds, ...treatmentEmbeds]
  const hasIG = allEmbeds.some((e) => e.platform === 'instagram')
  const hasTT = allEmbeds.some((e) => e.platform === 'tiktok')

  useEmbedScripts(allEmbeds)

  if (!story) return null

  return (
    <BetaLayout
      title={story.title}
      description={story.meta_description || story.subtitle || `${story.person_name}'s journey with RELUXE Med Spa`}
      ogImage={story.og_image || story.hero_image}
      noindex
    >
      {({ fonts }) => (
        <>
          {/* Embed scripts */}
          {hasIG && <Script src="https://www.instagram.com/embed.js" strategy="afterInteractive" />}
          {hasTT && <Script src="https://www.tiktok.com/embed.js" strategy="afterInteractive" />}

          {/* ─── Hero ─── */}
          <section className="relative" style={{ minHeight: '70vh', backgroundColor: colors.ink }}>
            {story.hero_image && (
              <img
                src={story.hero_image}
                alt={story.person_name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
              />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,26,26,1) 0%, rgba(26,26,26,0.3) 50%, rgba(26,26,26,0.6) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="relative max-w-4xl mx-auto px-6 flex flex-col justify-end" style={{ minHeight: '70vh', paddingBottom: '4rem' }}>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                {story.person_title && (
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>
                    {story.person_title}
                  </p>
                )}
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, color: colors.white, marginBottom: '1rem' }}>
                  {story.title}
                </h1>
                {story.subtitle && (
                  <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '36rem' }}>
                    {story.subtitle}
                  </p>
                )}
              </motion.div>
            </div>
          </section>

          {/* ─── Intro ─── */}
          {story.intro && (
            <section style={{ backgroundColor: colors.ink }}>
              <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28">
                <motion.div
                  className="flex flex-col md:flex-row gap-10 items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {story.person_image && (
                    <div className="flex-shrink-0">
                      <img
                        src={story.person_image}
                        alt={story.person_name}
                        style={{ width: 180, height: 180, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(124,58,237,0.3)' }}
                      />
                    </div>
                  )}
                  <div>
                    <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.8, color: 'rgba(250,248,245,0.7)', whiteSpace: 'pre-line' }}>
                      {story.intro}
                    </p>
                  </div>
                </motion.div>
              </div>
            </section>
          )}

          {/* ─── Body HTML ─── */}
          {story.body_html && (
            <section style={{ backgroundColor: colors.ink }}>
              <div className="max-w-3xl mx-auto px-6 pb-20">
                <div
                  className="prose prose-invert prose-lg max-w-none"
                  style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }}
                  dangerouslySetInnerHTML={{ __html: story.body_html }}
                />
              </div>
            </section>
          )}

          {/* ─── Treatment Journey Timeline ─── */}
          {treatments.length > 0 && (
            <section style={{ backgroundColor: colors.ink }}>
              <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>
                    Treatment Journey
                  </p>
                  <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white }}>
                    {story.person_name}&rsquo;s RELUXE Timeline
                  </h2>
                </motion.div>

                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-6 md:left-1/2 top-0 bottom-0" style={{ width: 2, background: 'rgba(124,58,237,0.2)', transform: 'translateX(-1px)' }} />

                  {treatments.map((t, i) => (
                    <motion.div
                      key={i}
                      className={`relative flex flex-col md:flex-row gap-6 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      {/* Timeline dot */}
                      <div
                        className="absolute left-6 md:left-1/2 flex items-center justify-center"
                        style={{ width: 16, height: 16, borderRadius: '50%', background: gradients.primary, transform: 'translate(-7px, 4px)', zIndex: 2 }}
                      />

                      {/* Content card */}
                      <div className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                        <div className="rounded-2xl p-6" style={{ background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.06)' }}>
                          {t.date && (
                            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.fuchsia, marginBottom: '0.5rem' }}>
                              {t.date}
                            </p>
                          )}
                          <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white, marginBottom: '0.5rem' }}>
                            {t.treatment}
                          </h3>
                          {t.description && (
                            <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)' }}>
                              {t.description}
                            </p>
                          )}
                          {/* Treatment media (images + videos) */}
                          {(() => {
                            const media = t.images?.length ? t.images : (t.image_url ? [{ url: t.image_url, caption: '' }] : [])
                            return media.length > 0 && (
                              <div className={`mt-4 ${media.length > 1 ? 'grid grid-cols-2 gap-3' : ''}`}>
                                {media.map((m, mi) => (
                                  <MediaItem key={mi} url={m.url} alt={m.caption || t.treatment} caption={m.caption} fonts={fonts} maxHeight={media.length > 1 ? 200 : 300} />
                                ))}
                              </div>
                            )
                          })()}
                          {/* Treatment social embeds */}
                          {t.embeds?.length > 0 && (
                            <div className="mt-4 space-y-4">
                              {t.embeds.map((emb, ei) => (
                                <SocialEmbed key={ei} embed={emb} fonts={fonts} />
                              ))}
                            </div>
                          )}
                          {t.slug && (
                            <button
                              type="button"
                              onClick={() => openBookingModal('all', t.slug)}
                              style={{ display: 'inline-block', marginTop: '1rem', fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              className="hover:underline"
                            >
                              Book {t.treatment} &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ─── Social Feed ─── */}
          {socialEmbeds.length > 0 && (
            <section style={{ backgroundColor: colors.ink }}>
              <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>
                    Follow Along
                  </p>
                  <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white }}>
                    {story.person_name} on Social
                  </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {socialEmbeds.map((embed, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <SocialEmbed embed={embed} fonts={fonts} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ─── Gallery ─── */}
          {gallery.length > 0 && (
            <section style={{ backgroundColor: colors.ink }}>
              <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>
                    Gallery
                  </p>
                  <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white }}>
                    The Journey in Photos
                  </h2>
                </motion.div>

                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                  {gallery.map((img, i) => (
                    <motion.div
                      key={i}
                      className="break-inside-avoid mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    >
                      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(250,248,245,0.06)' }}>
                        {isVideoUrl(img.url) ? (
                          <video
                            src={img.url}
                            controls
                            playsInline
                            preload="metadata"
                            style={{ width: '100%', display: 'block' }}
                          />
                        ) : (
                          <img
                            src={img.url}
                            alt={img.alt || img.caption || `${story.person_name} gallery`}
                            style={{ width: '100%', display: 'block' }}
                          />
                        )}
                        {img.caption && (
                          <div style={{ padding: '0.75rem 1rem', background: 'rgba(250,248,245,0.03)' }}>
                            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)' }}>
                              {img.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ─── CTA ─── */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                Ready to Start Your Own Journey?
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
                Book a free consultation. We&rsquo;ll build a custom plan just for you.
              </p>
              <Link
                href={story.cta_link || '/start/not-sure'}
                style={{
                  display: 'inline-block',
                  padding: '1rem 2.5rem',
                  borderRadius: 999,
                  background: '#fff',
                  fontFamily: fonts.body,
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: colors.ink,
                  textDecoration: 'none',
                }}
                className="hover:scale-105 transition-transform"
              >
                {story.cta_text || 'Book Your Consultation'}
              </Link>
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  )
}

export async function getStaticPaths() {
  let paths = []
  try {
    const sb = getServiceClient()
    const { data } = await sb
      .from('stories')
      .select('slug')
      .eq('status', 'published')
    paths = (data || []).map((s) => ({ params: { slug: s.slug } }))
  } catch (e) {
    console.warn('Stories paths: could not fetch', e.message)
  }
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const { slug } = params
  let story = null
  try {
    const sb = getServiceClient()
    const { data } = await sb
      .from('stories')
      .select('*')
      .eq('slug', slug)
      .limit(1)
      .single()
    story = data
  } catch (e) {
    console.warn('Story detail: could not fetch', e.message)
  }

  if (!story) {
    return { notFound: true }
  }

  return {
    props: { story },
    revalidate: 3600,
  }
}

StoryDetail.getLayout = (page) => page
