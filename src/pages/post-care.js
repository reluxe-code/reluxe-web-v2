// src/pages/post-care.js
// Aftercare instructions hub — aggregates common post-treatment guidance.
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, typeScale, fontPairings } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]

const categories = [
  {
    title: 'Tox (Botox, Dysport, Jeuveau, Daxxify)',
    icon: '💉',
    items: [
      'Stay upright for 4 hours after treatment',
      'Avoid rubbing or massaging the treated area for 24 hours',
      'Skip intense exercise, saunas, and hot tubs for 24 hours',
      'Avoid alcohol for 24 hours',
      'Results develop over 7–14 days — full effect at 2 weeks',
      'Follow-up: schedule a 2-week check-in if recommended',
      'Maintenance: typically every 3–4 months',
    ],
  },
  {
    title: 'Dermal Fillers',
    icon: '✨',
    items: [
      'Apply ice gently to reduce swelling (10 min on, 10 min off)',
      'Avoid touching, pressing, or massaging the area for 48 hours',
      'Skip intense exercise for 24–48 hours',
      'Avoid alcohol for 24 hours (increases bruising)',
      'Sleep elevated the first night to minimize swelling',
      'Mild swelling and bruising are normal and resolve in 5–7 days',
      'Final results settle in 2–4 weeks',
      'Arnica supplements can help with bruising if approved by your provider',
    ],
  },
  {
    title: 'Morpheus8 / RF Microneedling',
    icon: '🔥',
    items: [
      'Redness and mild swelling are normal for 2–5 days',
      'Apply the provided post-care serum and SPF 30+ daily',
      'Avoid direct sun exposure for 1–2 weeks',
      'No makeup for 24 hours after treatment',
      'Skip retinols, acids, and active skincare for 5–7 days',
      'Skin may feel tight or dry — keep moisturized',
      'Avoid hot showers, saunas, and intense exercise for 48 hours',
      'Full collagen remodeling results develop over 3–6 months',
    ],
  },
  {
    title: 'CO2 Laser Resurfacing',
    icon: '⚡',
    items: [
      'Follow your provider\'s specific wound-care instructions closely',
      'Keep the treated area clean and moist with recommended ointment',
      'Avoid sun exposure — wear SPF 50+ daily for at least 3 months',
      'Expect redness and peeling for 5–10 days',
      'No makeup until skin has fully healed (typically 7–10 days)',
      'Skip retinols, glycolic acid, and active ingredients for 2–4 weeks',
      'Avoid picking or peeling flaking skin',
      'Stay hydrated and avoid alcohol during recovery',
    ],
  },
  {
    title: 'IPL Photofacial',
    icon: '💡',
    items: [
      'Treated spots may darken before flaking off (this is normal)',
      'Apply SPF 30+ daily — avoid direct sun for 2 weeks',
      'No hot showers, saunas, or intense exercise for 24 hours',
      'Skip retinols and exfoliating acids for 3–5 days',
      'Mild redness may last a few hours to a day',
      'Results continue improving over 2–4 weeks',
    ],
  },
  {
    title: 'Facials (HydraFacial, Glo2Facial, Peels)',
    icon: '🧖',
    items: [
      'Avoid touching your face for at least 6 hours',
      'Skip makeup for 12–24 hours if possible',
      'Use gentle, fragrance-free skincare for 48 hours',
      'Apply SPF 30+ — freshly treated skin is more sun-sensitive',
      'Avoid retinols and active acids for 24–48 hours',
      'Stay hydrated to maximize results',
      'For chemical peels: expect light flaking for 3–5 days; do not pick',
    ],
  },
  {
    title: 'Laser Hair Removal',
    icon: '🪒',
    items: [
      'Avoid sun exposure and tanning for 2 weeks before and after',
      'Apply aloe or soothing gel if redness occurs',
      'Skip hot showers, saunas, and pools for 24 hours',
      'Shave (don\'t wax or pluck) between sessions',
      'Mild redness and bumps are normal and resolve within hours',
      'Sessions are spaced 4–6 weeks apart for best results',
    ],
  },
]

export default function PostCarePage() {
  return (
    <BetaLayout
      title="Post-Care Instructions"
      description="Aftercare instructions for Botox, fillers, Morpheus8, CO2, IPL, facials, and laser hair removal at RELUXE Med Spa in Westfield and Carmel, IN."
      canonical="https://reluxemedspa.com/post-care"
    >
      {/* Hero */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28 text-center">
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>
            Aftercare
          </p>
          <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, lineHeight: 1.15, color: colors.heading, marginBottom: '1rem' }}>
            Post-Care Instructions
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: '1.125rem', lineHeight: 1.6, color: colors.body, maxWidth: 640, margin: '0 auto 2rem' }}>
            Proper aftercare helps you get the best results from your treatment. Find your treatment below for specific guidance. Questions? Call us anytime.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href="tel:3177631142" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: 999, border: `1px solid ${colors.stone}`, fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading, textDecoration: 'none', backgroundColor: '#fff' }}>
              Call (317) 763-1142
            </a>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* Treatment Categories */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-5xl mx-auto px-6 py-16 lg:py-24 space-y-12">
          {categories.map((cat) => (
            <div key={cat.title} className="rounded-2xl p-6 sm:p-8" style={{ border: `1px solid ${colors.stone}`, backgroundColor: colors.cream }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading, marginBottom: '1rem' }}>
                <span style={{ marginRight: 8 }}>{cat.icon}</span>
                {cat.title}
              </h2>
              <ul className="space-y-2">
                {cat.items.map((item, i) => (
                  <li key={i} className="flex gap-3" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.6, color: colors.body }}>
                    <span style={{ color: colors.violet, fontWeight: 700, flexShrink: 0 }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 style={{ fontFamily: fonts.display, fontSize: '1.75rem', fontWeight: 700, color: colors.heading, marginBottom: '0.75rem' }}>
            Questions About Your Recovery?
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1rem', lineHeight: 1.6, color: colors.body, marginBottom: '1.5rem' }}>
            Every person heals differently. If something feels off or you have concerns after your treatment, don&rsquo;t hesitate to reach out. We&rsquo;re here to help.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href="tel:3177631142" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: 999, border: `1px solid ${colors.stone}`, fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading, textDecoration: 'none', backgroundColor: '#fff' }}>
              Call Us
            </a>
            <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: 999, border: `1px solid ${colors.stone}`, fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading, textDecoration: 'none', backgroundColor: '#fff' }}>
              Contact Form
            </a>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

PostCarePage.getLayout = (page) => page
