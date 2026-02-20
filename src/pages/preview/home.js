import Head from 'next/head';
import { useRouter } from 'next/router';
import { fontPairings, colors } from '@/components/preview/tokens';
import NavBar from '@/components/preview/home-proto/NavBar';
import VideoHero from '@/components/preview/home-proto/VideoHero';
import AboutSection from '@/components/preview/home-proto/AboutSection';
import ServicesGrid from '@/components/preview/home-proto/ServicesGrid';
import ResultsShowcase from '@/components/preview/home-proto/ResultsShowcase';
import TrustStrip from '@/components/preview/home-proto/TrustStrip';
import LocationsEditorial from '@/components/preview/home-proto/LocationsEditorial';
import TestimonialsSection from '@/components/preview/home-proto/TestimonialsSection';
import CTASection from '@/components/preview/home-proto/CTASection';
import Footer from '@/components/preview/home-proto/Footer';

// New sections
import StatsCounter from '@/components/preview/home-proto/StatsCounter';
import ProcessSteps from '@/components/preview/home-proto/ProcessSteps';
import TeamShowcase from '@/components/preview/home-proto/TeamShowcase';
import PricingTiers from '@/components/preview/home-proto/PricingTiers';
import FAQAccordion from '@/components/preview/home-proto/FAQAccordion';
import InstagramFeed from '@/components/preview/home-proto/InstagramFeed';
import ComparisonTable from '@/components/preview/home-proto/ComparisonTable';
import ScrollingMarquee from '@/components/preview/home-proto/ScrollingMarquee';
import SplitHeroAlt from '@/components/preview/home-proto/SplitHeroAlt';
import MembershipCTA from '@/components/preview/home-proto/MembershipCTA';
import EditorialBlog from '@/components/preview/home-proto/EditorialBlog';
import VideoTestimonials from '@/components/preview/home-proto/VideoTestimonials';

const FONT_KEYS = ['bold', 'dramatic', 'modern'];

function SectionDivider({ label, fonts }) {
  return (
    <div
      style={{
        borderTop: `3px solid ${colors.violet}`,
        position: 'relative',
      }}
    >
      <div
        className="text-center py-2.5"
        style={{
          background: 'rgba(124,58,237,0.06)',
          fontFamily: fonts.body,
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: colors.violet,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function HomePrototype() {
  const router = useRouter();
  const fontKey = FONT_KEYS.includes(router.query.font) ? router.query.font : 'bold';
  const fonts = fontPairings[fontKey];

  return (
    <>
      <Head>
        <title>RELUXE Homepage Prototype — {fonts.name}</title>
        <meta name="robots" content="noindex, nofollow" />
        {Object.values(fontPairings).map((fp) => (
          <link key={fp.name} rel="stylesheet" href={fp.googleUrl} />
        ))}
      </Head>

      <div style={{ backgroundColor: '#fff' }}>
        {/* Prototype toolbar — sticky top */}
        <div
          className="sticky top-0 z-50 border-b backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(26,26,26,0.92)',
            borderColor: 'rgba(250,248,245,0.08)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <a
                href="/preview"
                className="text-sm transition-colors hover:text-white"
                style={{ color: 'rgba(250,248,245,0.5)', fontFamily: fonts.body }}
              >
                &larr; Design System
              </a>
              <span style={{ color: 'rgba(250,248,245,0.15)' }}>|</span>
              <span
                className="text-sm font-medium"
                style={{ color: colors.white, fontFamily: fonts.body }}
              >
                Homepage Prototype
              </span>
            </div>

            {/* Font switcher */}
            <div className="flex items-center gap-2">
              <span
                className="text-xs"
                style={{ color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}
              >
                Font:
              </span>
              {FONT_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => router.push({ query: { font: key } }, undefined, { shallow: true })}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                  style={{
                    fontFamily: fontPairings[key].body,
                    backgroundColor: fontKey === key ? colors.violet : 'rgba(250,248,245,0.08)',
                    color: fontKey === key ? '#fff' : 'rgba(250,248,245,0.5)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {fontPairings[key].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            ORIGINAL SECTIONS + 12 NEW SECTIONS
            Each new section has a violet divider label
            ═══════════════════════════════════════════ */}

        {/* ── HERO OPTION A: Full-Screen Video ── */}
        <NavBar fontKey={fontKey} />
        <VideoHero fontKey={fontKey} />

        {/* ── HERO OPTION B: Split Layout ── */}
        <SectionDivider label="New — Alt Hero: Split Layout" fonts={fonts} />
        <SplitHeroAlt fontKey={fontKey} />

        {/* ── TRUST STRIP ── */}
        <TrustStrip fontKey={fontKey} />

        {/* ── NEW: Scrolling Marquee Ticker ── */}
        <SectionDivider label="New — Scrolling Marquee" fonts={fonts} />
        <ScrollingMarquee fontKey={fontKey} />

        {/* ── ABOUT ── */}
        <AboutSection fontKey={fontKey} />

        {/* ── NEW: Animated Stats Counter ── */}
        <SectionDivider label="New — Stats Counter" fonts={fonts} />
        <StatsCounter fontKey={fontKey} />

        {/* ── SERVICES ── */}
        <ServicesGrid fontKey={fontKey} />

        {/* ── NEW: How It Works / Process Steps ── */}
        <SectionDivider label="New — Process Steps" fonts={fonts} />
        <ProcessSteps fontKey={fontKey} />

        {/* ── RESULTS ── */}
        <ResultsShowcase fontKey={fontKey} />

        {/* ── NEW: Comparison Table (Us vs Others) ── */}
        <SectionDivider label="New — Comparison Table" fonts={fonts} />
        <ComparisonTable fontKey={fontKey} />

        {/* ── NEW: Team Showcase ── */}
        <SectionDivider label="New — Team Showcase" fonts={fonts} />
        <TeamShowcase fontKey={fontKey} />

        {/* ── NEW: Pricing / Membership Tiers ── */}
        <SectionDivider label="New — Pricing Tiers" fonts={fonts} />
        <PricingTiers fontKey={fontKey} />

        {/* ── LOCATIONS ── */}
        <LocationsEditorial fontKey={fontKey} />

        {/* ── NEW: Membership CTA Card ── */}
        <SectionDivider label="New — Membership CTA" fonts={fonts} />
        <MembershipCTA fontKey={fontKey} />

        {/* ── TESTIMONIALS ── */}
        <TestimonialsSection fontKey={fontKey} />

        {/* ── NEW: Video Testimonials ── */}
        <SectionDivider label="New — Video Testimonials" fonts={fonts} />
        <VideoTestimonials fontKey={fontKey} />

        {/* ── NEW: Blog / Editorial Cards ── */}
        <SectionDivider label="New — Editorial Blog" fonts={fonts} />
        <EditorialBlog fontKey={fontKey} />

        {/* ── NEW: Instagram Feed Mosaic ── */}
        <SectionDivider label="New — Instagram Feed" fonts={fonts} />
        <InstagramFeed fontKey={fontKey} />

        {/* ── NEW: FAQ Accordion ── */}
        <SectionDivider label="New — FAQ Accordion" fonts={fonts} />
        <FAQAccordion fontKey={fontKey} />

        {/* ── CTA + FOOTER ── */}
        <CTASection fontKey={fontKey} />
        <Footer fontKey={fontKey} />
      </div>
    </>
  );
}

// Bypass the default Layout wrapper so these pages render standalone
HomePrototype.getLayout = (page) => page;
