import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { colors, fontPairings, typeScale, gradients } from '../tokens';

// Fallback placeholder data when API isn't configured
const fallbackPosts = [
  { id: '1', gradient: `linear-gradient(135deg, ${colors.violet}30, ${colors.fuchsia}20)`, label: 'Before & After' },
  { id: '2', gradient: `linear-gradient(135deg, ${colors.fuchsia}25, ${colors.rose}18)`, label: 'BTS' },
  { id: '3', gradient: `linear-gradient(135deg, ${colors.rose}28, ${colors.violet}15)`, label: 'Product Faves' },
  { id: '4', gradient: `linear-gradient(135deg, ${colors.violet}22, ${colors.rose}12)`, label: 'Team' },
  { id: '5', gradient: `linear-gradient(135deg, ${colors.fuchsia}20, ${colors.violet}28)`, label: 'Treatment Day' },
  { id: '6', gradient: `linear-gradient(135deg, ${colors.rose}22, ${colors.fuchsia}18)`, label: 'Results' },
  { id: '7', gradient: `linear-gradient(135deg, ${colors.violet}18, ${colors.fuchsia}22)`, label: 'Glow Ups' },
  { id: '8', gradient: `linear-gradient(135deg, ${colors.fuchsia}28, ${colors.rose}14)`, label: 'Events' },
];

function PostCard({ post, fonts, index }) {
  const isLive = !!post.media_url;

  return (
    <motion.a
      href={post.permalink || '#'}
      target={post.permalink ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="relative rounded-xl overflow-hidden cursor-pointer block"
      style={{
        background: isLive ? colors.ink : post.gradient,
        aspectRatio: '1',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* Real image or placeholder */}
      {isLive ? (
        <img
          src={post.media_url}
          alt={post.caption?.slice(0, 60) || 'Instagram post'}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <>
          {/* Grain placeholder */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
              pointerEvents: 'none',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
        </>
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 hover:opacity-100"
        style={{
          backgroundColor: `${colors.ink}70`,
        }}
      >
        {isLive && post.caption ? (
          <p
            className="px-4 text-center"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.75rem',
              fontWeight: 500,
              color: colors.white,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.caption.slice(0, 120)}
          </p>
        ) : (
          <span
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.caption.size,
              fontWeight: 600,
              color: colors.white,
            }}
          >
            {post.label || 'View Post'}
          </span>
        )}
      </div>
    </motion.a>
  );
}

export default function InstagramFeed({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];
  const [posts, setPosts] = useState(fallbackPosts);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Try to fetch from our Instagram API route
    // Set up: add INSTAGRAM_ACCESS_TOKEN to .env.local
    // Get token at: https://developers.facebook.com/docs/instagram-basic-display-api
    fetch('/api/instagram')
      .then((res) => {
        if (!res.ok) throw new Error('No Instagram API configured');
        return res.json();
      })
      .then((data) => {
        if (data.posts?.length) {
          setPosts(data.posts.slice(0, 8));
          setIsLive(true);
        }
      })
      .catch(() => {
        // Silently fall back to placeholders
      });
  }, []);

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p
              style={{
                fontFamily: fonts.body,
                ...typeScale.label,
                color: colors.violet,
                marginBottom: '1rem',
              }}
            >
              @reluxemedspa
            </p>
            <h2
              style={{
                fontFamily: fonts.display,
                fontSize: typeScale.sectionHeading.size,
                fontWeight: typeScale.sectionHeading.weight,
                lineHeight: typeScale.sectionHeading.lineHeight,
                color: colors.heading,
              }}
            >
              Follow the Glow
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {!isLive && (
              <span
                className="rounded-full px-3 py-1"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: colors.muted,
                  background: colors.stone,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Placeholder — add INSTAGRAM_ACCESS_TOKEN
              </span>
            )}
            <a
              href="https://www.instagram.com/reluxemedspa/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-all duration-200"
              style={{
                fontFamily: fonts.body,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: colors.violet,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Follow on Instagram
              <span style={{ transition: 'transform 0.2s' }}>&rarr;</span>
            </a>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} fonts={fonts} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
