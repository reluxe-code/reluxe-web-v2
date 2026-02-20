import Head from 'next/head';
import { useState } from 'react';
import { colors, fontPairings } from '@/components/preview/tokens';
import ColorPalette from '@/components/preview/design-system/ColorPalette';
import TypographySpecimen from '@/components/preview/design-system/TypographySpecimen';
import ButtonShowcase from '@/components/preview/design-system/ButtonShowcase';
import CardShowcase from '@/components/preview/design-system/CardShowcase';
import SectionBackgrounds from '@/components/preview/design-system/SectionBackgrounds';
import AnimationDemo from '@/components/preview/design-system/AnimationDemo';

const sections = [
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'cards', label: 'Cards' },
  { id: 'sections', label: 'Sections' },
  { id: 'animation', label: 'Animation' },
];

export default function DesignSystemPreview() {
  const [activeSection, setActiveSection] = useState('colors');
  const fonts = fontPairings.bold;

  return (
    <>
      <Head>
        <title>RELUXE Design System Preview</title>
        <meta name="robots" content="noindex, nofollow" />
        {/* Load all font pairings */}
        {Object.values(fontPairings).map((fp) => (
          <link key={fp.name} rel="stylesheet" href={fp.googleUrl} />
        ))}
      </Head>

      <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
        {/* Sticky top bar */}
        <div
          className="sticky top-0 z-50 border-b backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderColor: `${colors.taupe}40`,
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1
                style={{
                  fontFamily: fonts.display,
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  color: colors.heading,
                }}
              >
                RELUXE Design System
              </h1>
              <span
                className="inline-block rounded-full px-3 py-1"
                style={{
                  backgroundColor: colors.violet,
                  color: '#fff',
                  fontFamily: fonts.body,
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Preview
              </span>
            </div>

            <a
              href="/preview/home"
              className="text-sm font-medium transition-colors hover:text-lux-fuchsia"
              style={{ color: colors.violet, fontFamily: fonts.body }}
            >
              View Homepage Prototype &rarr;
            </a>
          </div>

          {/* Section tabs */}
          <div className="max-w-7xl mx-auto px-6 pb-3 flex gap-1 overflow-x-auto">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap"
                style={{
                  fontFamily: fonts.body,
                  backgroundColor: activeSection === s.id ? colors.ink : 'transparent',
                  color: activeSection === s.id ? colors.white : colors.body,
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-16 space-y-24">
          {/* Colors */}
          <section id="colors">
            <SectionHeader
              label="01"
              title="Color Palette"
              description="Warm neutrals ground the design. Violet/fuchsia provides energy without overwhelming."
              fonts={fonts}
            />
            <ColorPalette />
          </section>

          {/* Typography */}
          <section id="typography">
            <SectionHeader
              label="02"
              title="Typography"
              description="Three font pairing options. Same scale, same weights — the personality changes."
              fonts={fonts}
            />
            <TypographySpecimen />
          </section>

          {/* Buttons */}
          <section id="buttons">
            <SectionHeader
              label="03"
              title="Buttons"
              description="Two styles: gradient primary for key actions, outline secondary for everything else. Pill shape, consistent sizing."
              fonts={fonts}
            />
            <ButtonShowcase />
          </section>

          {/* Cards */}
          <section id="cards">
            <SectionHeader
              label="04"
              title="Cards"
              description="Service cards and testimonial cards — the two most repeated patterns across the site."
              fonts={fonts}
            />
            <CardShowcase />
          </section>

          {/* Section Backgrounds */}
          <section id="sections">
            <SectionHeader
              label="05"
              title="Section Backgrounds"
              description="Alternating backgrounds create rhythm. White → Cream → Stone for light sections, Charcoal → Ink for dark."
              fonts={fonts}
            />
            <SectionBackgrounds />
          </section>

          {/* Animation */}
          <section id="animation">
            <SectionHeader
              label="06"
              title="Animation"
              description="Restrained motion. Scroll-triggered reveals, staggered grids, subtle hover lifts. Max 2 animation types per page."
              fonts={fonts}
            />
            <AnimationDemo />
          </section>
        </div>
      </div>
    </>
  );
}

function SectionHeader({ label, title, description, fonts }) {
  return (
    <div className="mb-10">
      <p
        className="mb-2"
        style={{
          fontFamily: fonts.body,
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: colors.violet,
        }}
      >
        {label}
      </p>
      <h2
        className="mb-3"
        style={{
          fontFamily: fonts.display,
          fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
          fontWeight: 500,
          color: colors.heading,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      <p
        className="max-w-2xl"
        style={{
          fontFamily: fonts.body,
          fontSize: '1rem',
          color: colors.body,
          lineHeight: 1.625,
        }}
      >
        {description}
      </p>
    </div>
  );
}

// Bypass the default Layout wrapper from _app.js
DesignSystemPreview.getLayout = (page) => page;
