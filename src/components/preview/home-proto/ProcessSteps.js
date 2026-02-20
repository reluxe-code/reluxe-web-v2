import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { colors, fontPairings, typeScale, gradients } from '../tokens';

const steps = [
  {
    number: '01',
    title: 'Book Your Consult',
    description: 'Tell us your goals — we\'ll match you with the right provider and build a custom plan. Takes 2 minutes online.',
    detail: 'Free for all first-time patients. Zero commitment.',
    gradient: `linear-gradient(135deg, ${colors.violet}, ${colors.fuchsia})`,
  },
  {
    number: '02',
    title: 'Get Your Game Plan',
    description: 'Your provider walks you through options, pricing, and what to expect. We answer every question until you feel 100%.',
    detail: 'Transparent pricing. No hidden fees. Ever.',
    gradient: `linear-gradient(135deg, ${colors.fuchsia}, ${colors.rose})`,
  },
  {
    number: '03',
    title: 'Treatment Day',
    description: 'Relax in our luxury suite while our experts work their magic. Most treatments take under an hour.',
    detail: 'Private suites. Premium products. Good vibes only.',
    gradient: `linear-gradient(135deg, ${colors.rose}, ${colors.violet})`,
  },
  {
    number: '04',
    title: 'Glow Up Complete',
    description: 'Walk out feeling confident. We follow up to make sure you\'re absolutely loving your results.',
    detail: 'Complimentary follow-ups included with every treatment.',
    gradient: `linear-gradient(135deg, ${colors.violet}, #5B21B6)`,
  },
];

export default function ProcessSteps({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section style={{ backgroundColor: colors.ink, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow that moves with active step */}
      <motion.div
        style={{
          position: 'absolute',
          width: '40%',
          height: '60%',
          borderRadius: '50%',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          opacity: 0.08,
        }}
        animate={{
          background: steps[activeStep].gradient,
          top: `${20 + activeStep * 10}%`,
          left: `${10 + activeStep * 20}%`,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 relative">
        <motion.div
          className="text-center mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <p
            style={{
              fontFamily: fonts.body,
              ...typeScale.label,
              color: colors.violet,
              marginBottom: '1rem',
            }}
          >
            How It Works
          </p>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.white,
            }}
          >
            Four Steps to Your Best Self
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left — Step selector / vertical timeline */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Vertical gradient line */}
              <div
                className="absolute left-[19px] top-0 bottom-0 hidden lg:block"
                style={{
                  width: 2,
                  background: 'rgba(250,248,245,0.06)',
                }}
              />
              {/* Active progress indicator */}
              <motion.div
                className="absolute left-[19px] hidden lg:block"
                style={{
                  width: 2,
                  background: gradients.primary,
                  top: 0,
                }}
                animate={{
                  height: `${((activeStep + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              />

              <div className="space-y-2">
                {steps.map((step, i) => (
                  <motion.button
                    key={step.number}
                    className="w-full text-left flex items-start gap-5 rounded-xl px-4 py-5 transition-colors duration-300"
                    style={{
                      backgroundColor: activeStep === i ? 'rgba(250,248,245,0.04)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    onClick={() => setActiveStep(i)}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    {/* Number node */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-full relative z-10 transition-all duration-300"
                      style={{
                        width: 40,
                        height: 40,
                        background: activeStep === i ? gradients.primary : 'rgba(250,248,245,0.06)',
                        border: activeStep === i ? 'none' : '1px solid rgba(250,248,245,0.08)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fonts.body,
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: activeStep === i ? '#fff' : 'rgba(250,248,245,0.3)',
                        }}
                      >
                        {step.number}
                      </span>
                    </div>

                    {/* Text */}
                    <div>
                      <h3
                        className="transition-colors duration-300"
                        style={{
                          fontFamily: fonts.display,
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          color: activeStep === i ? colors.white : 'rgba(250,248,245,0.4)',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="transition-colors duration-300"
                        style={{
                          fontFamily: fonts.body,
                          fontSize: typeScale.caption.size,
                          color: activeStep === i ? 'rgba(250,248,245,0.5)' : 'rgba(250,248,245,0.2)',
                          lineHeight: 1.5,
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Active step detail card */}
          <div className="lg:col-span-7 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                className="relative w-full rounded-3xl overflow-hidden"
                style={{
                  minHeight: 380,
                  background: steps[activeStep].gradient,
                }}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Grain */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
                    pointerEvents: 'none',
                  }}
                />

                {/* Large step number watermark */}
                <div
                  className="absolute top-6 right-8"
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 'clamp(6rem, 12vw, 10rem)',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: 'rgba(255,255,255,0.08)',
                    pointerEvents: 'none',
                  }}
                >
                  {steps[activeStep].number}
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-end h-full p-8 lg:p-10" style={{ minHeight: 380 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                  >
                    <h3
                      style={{
                        fontFamily: fonts.display,
                        fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '1rem',
                        lineHeight: 1.15,
                      }}
                    >
                      {steps[activeStep].title}
                    </h3>
                    <p
                      style={{
                        fontFamily: fonts.body,
                        fontSize: '1.0625rem',
                        lineHeight: 1.6,
                        color: 'rgba(255,255,255,0.8)',
                        maxWidth: '28rem',
                        marginBottom: '1.5rem',
                      }}
                    >
                      {steps[activeStep].description}
                    </p>
                    <div
                      className="inline-block rounded-full px-5 py-2.5"
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fonts.body,
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#fff',
                        }}
                      >
                        {steps[activeStep].detail}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
