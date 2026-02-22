import { colors } from '@/components/preview/tokens'
import WidgetRenderer from '@/components/inspiration/widgets'
import ConciergeCallout from '@/components/inspiration/ConciergeCallout'
import GravityBookButton from '@/components/beta/GravityBookButton'

export default function ArticleBody({ blocks, fonts, fontKey, widgets = {}, articleSlug }) {
  if (!blocks || !blocks.length) return null

  return blocks.map((block, i) => {
    // Heading 2
    if (block.type === 'h2') {
      return (
        <h2
          key={i}
          style={{
            fontFamily: fonts?.display,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: colors.heading,
            lineHeight: 1.3,
            marginTop: '2.5rem',
            marginBottom: '0.75rem',
          }}
        >
          {block.text}
        </h2>
      )
    }

    // Heading 3
    if (block.type === 'h3') {
      return (
        <h3
          key={i}
          style={{
            fontFamily: fonts?.display,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: colors.heading,
            lineHeight: 1.35,
            marginTop: '2rem',
            marginBottom: '0.5rem',
          }}
        >
          {block.text}
        </h3>
      )
    }

    // List
    if (block.type === 'list') {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag
          key={i}
          style={{
            fontFamily: fonts?.body,
            fontSize: '1.0625rem',
            lineHeight: 1.75,
            color: colors.body,
            marginBottom: '1.25rem',
            paddingLeft: '1.5rem',
          }}
          className={block.ordered ? 'list-decimal' : 'list-disc'}
        >
          {(block.items || []).map((item, j) => (
            <li key={j} style={{ marginBottom: '0.375rem' }}>{item}</li>
          ))}
        </Tag>
      )
    }

    // Callout
    if (block.type === 'callout') {
      const variants = {
        tip: { bg: '#F5F3FF', border: '#7C3AED', icon: '💡' },
        warning: { bg: '#FFF7ED', border: '#EA580C', icon: '⚠️' },
        'pro-tip': { bg: '#ECFDF5', border: '#059669', icon: '✨' },
      }
      const v = variants[block.variant] || variants.tip
      return (
        <div
          key={i}
          style={{
            backgroundColor: v.bg,
            borderLeft: `4px solid ${v.border}`,
            borderRadius: '0.75rem',
            padding: '1rem 1.25rem',
            margin: '1.5rem 0',
          }}
        >
          <p style={{ fontFamily: fonts?.body, fontSize: '0.9375rem', lineHeight: 1.6, color: colors.heading }}>
            <span style={{ marginRight: '0.5rem' }}>{v.icon}</span>
            {block.text}
          </p>
          {block.attribution && (
            <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: colors.muted, marginTop: '0.5rem' }}>
              — {block.attribution}
            </p>
          )}
        </div>
      )
    }

    // Blockquote
    if (block.type === 'blockquote') {
      return (
        <blockquote
          key={i}
          style={{
            borderLeft: `3px solid ${colors.violet}`,
            paddingLeft: '1.25rem',
            margin: '1.5rem 0',
            fontStyle: 'italic',
          }}
        >
          <p style={{ fontFamily: fonts?.body, fontSize: '1.0625rem', lineHeight: 1.6, color: colors.body }}>
            {block.text}
          </p>
          {block.attribution && (
            <cite style={{ fontFamily: fonts?.body, fontSize: '0.875rem', color: colors.muted, fontStyle: 'normal' }}>
              — {block.attribution}
            </cite>
          )}
        </blockquote>
      )
    }

    // Image
    if (block.type === 'image') {
      return (
        <figure key={i} style={{ margin: '2rem 0' }}>
          <img
            src={block.src}
            alt={block.alt || ''}
            style={{ width: '100%', borderRadius: '0.75rem' }}
            loading="lazy"
          />
          {block.caption && (
            <figcaption style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: colors.muted, textAlign: 'center', marginTop: '0.5rem' }}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    }

    // Divider
    if (block.type === 'divider') {
      return <hr key={i} style={{ border: 'none', borderTop: `1px solid ${colors.stone}`, margin: '2rem 0' }} />
    }

    // Widget
    if (block.type === 'widget') {
      const widgetData = widgets[block.key]
      if (!widgetData) return null
      return (
        <div key={i}>
          <WidgetRenderer
            componentName={widgetData.component_name}
            config={{ ...(widgetData.default_config || {}), ...(widgetData.config || {}) }}
            articleSlug={articleSlug}
          />
        </div>
      )
    }

    // Concierge callout
    if (block.type === 'concierge') {
      return (
        <ConciergeCallout
          key={i}
          logged_in_text={block.logged_in_text}
          guest_text={block.guest_text}
          cta_href={block.cta_href}
        />
      )
    }

    // CTA
    if (block.type === 'cta') {
      return (
        <div key={i} className="my-10 text-center">
          <div
            className="rounded-2xl p-8 inline-block"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(192,38,211,0.04))',
              border: `1px solid ${colors.stone}`,
            }}
          >
            <p
              style={{
                fontFamily: fonts?.display,
                fontSize: '1.125rem',
                fontWeight: 600,
                color: colors.heading,
                marginBottom: '1rem',
              }}
            >
              {block.text}
            </p>
            <GravityBookButton fontKey={fontKey} size="hero" />
          </div>
        </div>
      )
    }

    // Default: paragraph
    return (
      <p
        key={i}
        style={{
          fontFamily: fonts?.body,
          fontSize: '1.0625rem',
          lineHeight: 1.75,
          color: colors.body,
          marginBottom: '1.25rem',
        }}
      >
        {block.text}
      </p>
    )
  })
}
