import Link from 'next/link'
import { motion } from 'framer-motion'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, typeScale } from '@/components/preview/tokens'
import { getServiceClient } from '@/lib/supabase'

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function StoriesIndex({ stories = [] }) {
  return (
    <BetaLayout
      title="Patient Stories & Spotlights"
      description="Real patients, real journeys. See how RELUXE Med Spa transforms skin and confidence through our patient spotlight stories."
      canonical="https://reluxemedspa.com/stories"
    >
      {({ fonts }) => (
        <>
          {/* ─── Hero ─── */}
          <section className="relative" style={{ backgroundColor: colors.ink }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 relative">
              <motion.div
                className="text-center max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>
                  Patient Spotlights
                </p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1, color: colors.white, marginBottom: '1.5rem' }}>
                  Real People.{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Real Results.
                  </span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.7, color: 'rgba(250,248,245,0.55)', maxWidth: '32rem', margin: '0 auto' }}>
                  Every patient has a story. Here's where we spotlight the journeys of some of our amazing patients — athletes, influencers, and everyday people getting real results.
                </p>
              </motion.div>
            </div>
          </section>

          {/* ─── Stories Grid ─── */}
          <section style={{ backgroundColor: colors.ink }}>
            <div className="max-w-7xl mx-auto px-6 pb-24 lg:pb-36">
              {stories.length === 0 ? (
                <div className="text-center py-16">
                  <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(250,248,245,0.4)' }}>
                    Stories coming soon. Stay tuned.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {stories.map((story, i) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <Link href={`/stories/${story.slug}`} className="block group">
                        <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '3/4', background: 'rgba(250,248,245,0.04)' }}>
                          {(story.hero_image || story.person_image) ? (
                            <img
                              src={story.hero_image || story.person_image}
                              alt={story.person_name}
                              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                              className="group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ background: gradients.primary }}>
                              <span style={{ fontFamily: fonts.display, fontSize: '3rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>
                                {story.person_name?.[0]}
                              </span>
                            </div>
                          )}
                          {/* Gradient overlay */}
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }} />
                          {/* Text overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            {story.person_title && (
                              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.5rem' }}>
                                {story.person_title}
                              </p>
                            )}
                            <h3 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.white, marginBottom: '0.25rem' }}>
                              {story.person_name}
                            </h3>
                            <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)' }}>
                              {story.title}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ─── CTA ─── */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                Want to Be Our Next Spotlight?
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
                Start your own RELUXE journey. Book a free consultation today.
              </p>
              <Link
                href="/start/not-sure"
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
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                className="hover:scale-105"
              >
                Book a Consultation
              </Link>
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  )
}

export async function getStaticProps() {
  let stories = []
  try {
    const sb = getServiceClient()
    const { data } = await sb
      .from('stories')
      .select('id, slug, person_name, person_title, title, subtitle, hero_image, person_image')
      .eq('status', 'published')
      .order('sort_order')
      .order('created_at', { ascending: false })
    stories = data || []
  } catch (e) {
    console.warn('Stories index: could not fetch data', e.message)
  }

  return {
    props: { stories },
    revalidate: 3600,
  }
}

StoriesIndex.getLayout = (page) => page
