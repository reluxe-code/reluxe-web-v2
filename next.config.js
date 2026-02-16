// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 180, // was 60
  reactStrictMode: true,
  images: {
    unoptimized: true, // needed for static export with next/image
    domains: ['wordpress-74434-5742908.cloudwaysapps.com'],
    remotePatterns: [
      { protocol: 'https', hostname: 'wordpress-74434-5742908.cloudwaysapps.com', pathname: '/**' },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  webpack(config) {
    config.resolve.alias = { '@': path.resolve(__dirname, 'src'), ...config.resolve.alias };
    return config;
  },

  async redirects() {
    return [
      //
      // --- Explicit page redirects ---
      //
      { source: '/blog-2', destination: '/blog', permanent: true },
      { source: '/gift-cards-products-2', destination: '/shop', permanent: true },
      { source: '/online-booking', destination: '/book', permanent: true },
      { source: '/all-posts', destination: '/blog', permanent: true },
      { source: '/cart-2', destination: '/', permanent: true },
      { source: '/checkout-2', destination: '/', permanent: true },
      { source: '/my-account-2', destination: '/profile', permanent: true },

      { source: '/memberships-packages/our-monthly-memberships', destination: '/memberships', permanent: true },
      { source: '/memberships-packages/beauty-bucks-memberships', destination: '/memberships', permanent: true },
      { source: '/memberships-packages/re-imagine-packages', destination: '/memberships', permanent: true },

      { source: '/sample-page', destination: '/', permanent: true },
      { source: '/cart', destination: '/', permanent: true },
      { source: '/checkout', destination: '/', permanent: true },
      { source: '/my-account', destination: '/profile', permanent: true },

      { source: '/our-services/services-by-treatment-area', destination: '/services', permanent: true },
      { source: '/patients-forms', destination: '/treatment-instructions', permanent: true },
      { source: '/register', destination: '/profile', permanent: true },
      { source: '/register-for-reluxe-med-spa-online-booking', destination: '/profile', permanent: true },
      { source: '/payments-with-cherry', destination: '/shop', permanent: true },
      { source: '/book-v2', destination: '/book', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },

      { source: '/facial-assessment', destination: '/conditions', permanent: true },
      { source: '/thank-you', destination: '/', permanent: true },

      { source: '/book-tox', destination: '/services/tox', permanent: true },
      { source: '/wedding-assessment', destination: '/weddings', permanent: true },
      { source: '/assessment', destination: '/conditions', permanent: true },

      { source: '/botox-treatments', destination: '/services/botox', permanent: true },
      { source: '/spafinder-gift-cards-accepted-at-reluxe-med-spa-in-westfield-in', destination: '/shop', permanent: true },
      { source: '/book-botox-krista', destination: '/book/tox', permanent: true },
      { source: '/wedding', destination: '/weddings', permanent: true },
      { source: '/mothers-day-specials', destination: '/deals', permanent: true },
      { source: '/book-ipl-refresh', destination: '/services/ipl', permanent: true },

      { source: '/privacy-policy-2', destination: '/privacy-policy', permanent: true },
      { source: '/book-yelp-vip', destination: '/deals', permanent: true },
      { source: '/book-facial-offer', destination: '/book/facials', permanent: true },
      { source: '/book-now-v2', destination: '/book', permanent: true },
      { source: '/book-now-v3', destination: '/book', permanent: true },
      { source: '/book-summer-special', destination: '/deals', permanent: true },
      { source: '/book-summer-facial', destination: '/services/facials', permanent: true },
      // skipped: /return-policy -> /return-policy (circular)
      { source: '/book-massage-special', destination: '/book/massage', permanent: true },
      { source: '/join-us', destination: '/careers', permanent: true },
      { source: '/book-hydrafacial-offer', destination: '/services/hydrafacial', permanent: true },
      { source: '/book-new', destination: '/book', permanent: true },

      { source: '/wedding-assessment-thanks', destination: '/weddings', permanent: true },
      { source: '/book-wedding', destination: '/weddings', permanent: true },
      { source: '/book-filler', destination: '/services/filler', permanent: true },
      { source: '/book-facials', destination: '/services/facials', permanent: true },
      { source: '/book-morpheus8', destination: '/services/morpheus8', permanent: true },
      { source: '/book-sauna', destination: '/services/saltsauna', permanent: true },
      { source: '/book-injectables-with-krista-botox-jeuveau-xeomin-rha-versa-neuromodulators-dermal-fillers', destination: '/team/krista', permanent: true },
      { source: '/book-massage-lead', destination: '/services/massage', permanent: true },
      { source: '/book-massage', destination: '/services/massage', permanent: true },
      // skipped: /shop -> /shop (circular)
      { source: '/book-tox-v2', destination: '/services/tox', permanent: true },

      { source: '/conditions/acne', destination: '/conditions/acne-scars', permanent: true },
      { source: '/conditions/anti-aging', destination: '/conditions/wrinkles-fine-lines', permanent: true },
      { source: '/conditions/under-eyes', destination: '/conditions/under-eye', permanent: true },

      { source: '/book-now', destination: '/book', permanent: true },
      { source: '/buy-gift-cards', destination: '/shop', permanent: true },

      { source: '/conditions/fine-lines-wrinkles', destination: '/conditions/wrinkles-fine-lines', permanent: true },
      { source: '/conditions/skin-laxity-sagging', destination: '/conditions/loose-skin', permanent: true },
      { source: '/conditions/stretch-marks', destination: '/conditions', permanent: true },

      { source: '/book-ipl', destination: '/services/ipl', permanent: true },
      { source: '/before-after-pictures-our-aesthetic-services', destination: '/results', permanent: true },
      { source: '/our-services/botox-treatments', destination: '/services/botox', permanent: true },
      { source: '/spafinder-gift-card-accepted-faqs', destination: '/shop', permanent: true },
      { source: '/book-glo2-offer', destination: '/services/glo2facial', permanent: true },
      { source: '/current-specials', destination: '/deals', permanent: true },
      { source: '/conditions/hair-removal', destination: '/services/laser-hair-removal', permanent: true },

      { source: '/beautybash24', destination: '/beauty-bash', permanent: true },
      { source: '/why-choose-jeuveau', destination: '/services/jeuveau', permanent: true },
      { source: '/thank-you-registration', destination: '/', permanent: true },
      { source: '/beauty-bash-registration', destination: '/beauty-bash', permanent: true },
      { source: '/bbraffle', destination: '/beauty-bash', permanent: true },
      { source: '/beauty-bash-after-party-deals', destination: '/beauty-bash', permanent: true },

      { source: '/book-tox-membership', destination: '/memberships', permanent: true },
      { source: '/memberships-packages', destination: '/memberships', permanent: true },
      { source: '/about-reluxe-med-spa-in-westfield-indiana', destination: '/about', permanent: true },

      { source: '/book-tox-bonus', destination: '/book/tox', permanent: true },
      { source: '/tox-specials', destination: '/deals', permanent: true },
      { source: '/jeuveau-wrinkle-reset-duo-special', destination: '/deals', permanent: true },
      { source: '/wrinkle-reset-duo-special', destination: '/deals', permanent: true },
      { source: '/jeuveau-special', destination: '/deals', permanent: true },

      { source: '/wedding-raffle', destination: '/weddings', permanent: true },
      // skipped: /treatment-instructions -> /treatment-instructions (circular)
      { source: '/tox-care', destination: '/treatment-instructions', permanent: true },
      { source: '/book-laser-hair-removal', destination: '/services/laser-hair-removal', permanent: true },
      { source: '/our-services', destination: '/services', permanent: true },
      { source: '/book-dysport-offer', destination: '/services/dysport', permanent: true },
      { source: '/intromassage', destination: '/services/massage', permanent: true },
      { source: '/rebalance', destination: '/services/massage', permanent: true },
      { source: '/bash', destination: '/beauty-bash', permanent: true },
      { source: '/book-jeuveau-offer', destination: '/services/tox', permanent: true },

      //
      // --- Profile → Team ---
      //
      { source: '/profile/carlee-robbins', destination: '/team/carlee', permanent: true },
      { source: '/profile/kim-mcguire', destination: '/team/kim', permanent: true },
      { source: '/profile/anna-coccaro', destination: '/team/anna', permanent: true },
      { source: '/profile/book-services-with-laci-gongwer-medical-aesthetician', destination: '/team/laci', permanent: true },
      { source: '/profile/krista-spalding', destination: '/team/krista', permanent: true },
      { source: '/profile/hannah-kerns', destination: '/team/hannah', permanent: true },
      { source: '/profile/book-services-with-alexis', destination: '/team/alexis', permanent: true },

      //
      // --- Product → Closest Service ---
      //
      { source: '/product/120-minute-choice-massage', destination: '/services/massage', permanent: true },
      { source: '/product/90-minute-choice-massage', destination: '/services/massage', permanent: true },
      { source: '/product/75-minute-choice-massage', destination: '/services/massage', permanent: true },
      { source: '/product/60-minute-choice-massage', destination: '/services/massage', permanent: true },
      { source: '/product/signature-facial', destination: '/services/facials', permanent: true },
      { source: '/product/botox-consultation', destination: '/services/tox', permanent: true },
      { source: '/product/50-units-plus-bonus', destination: '/services/tox', permanent: true },
      { source: '/product/100-units-of-botox-bankable-over-multiple-appointments', destination: '/services/tox', permanent: true },
      { source: '/product/hydrafacial-platinum-most-luxury', destination: '/services/hydrafacial', permanent: true },
      { source: '/product/hydrafacial-reluxe-most-popular', destination: '/services/hydrafacial', permanent: true },
      { source: '/product/versa-lip-filler-syringe-650', destination: '/services/filler', permanent: true },
      { source: '/product/juvederm-voluma', destination: '/services/filler', permanent: true },
      { source: '/product/alto-advanced-defense-and-repair-serum', destination: '/skincare/skinbetterscience', permanent: true },
      { source: '/product/alpharet-overnight-cream', destination: '/skincare/skinbetterscience', permanent: true },
      { source: '/product/cleaning-gel-by-skinbetter-science', destination: '/skincare/skinbetterscience', permanent: true },
      { source: '/product/refining-foam-cleanser-by-skinbetter-science', destination: '/skincare/skinbetterscience', permanent: true },
      { source: '/product/barrier-pro-1-step-cleanser-from-colorscience', destination: '/skincare/colorscience', permanent: true },
      { source: '/product/barrier-pro-essential-moisturizer-from-colorscience', destination: '/skincare/colorscience', permanent: true },
      { source: '/product/total-protection-brush-on-shield-spf-50-from-colorscience', destination: '/skincare/colorscience', permanent: true },
      { source: '/product/truly-unlimited-laser-hair-removal', destination: '/services/laser-hair-removal', permanent: true },
      { source: '/product/laser-hair-removal-session', destination: '/services/laser-hair-removal', permanent: true },
      { source: '/achieving-facial-harmony-the-art-of-facial-balancing-at-reluxe-med-spa-in-westfield-indiana', destination: '/services/facial-balancing', permanent: true },
      { source: '/product/:path*', destination: '/services/skin-iq', permanent: true },

      //
      // --- Service → Closest Service ---
      //
      { source: '/service', destination: '/services', permanent: true },
      { source: '/service/medical-facial-chemical-peel', destination: '/services/micropeels', permanent: true },
      { source: '/service/opus-plasma', destination: '/services/opus', permanent: true },
      { source: '/service/ipl-photofacial', destination: '/services/ipl', permanent: true },
      { source: '/service/iv-therapy', destination: '/services', permanent: true },
      { source: '/service/skinpen-microneedling-prp', destination: '/services/skinpen', permanent: true },
      { source: '/service/injectables-botox-fillers', destination: '/services', permanent: true },
      { source: '/service/xeomin-treatments-in-westfield-in', destination: '/services/tox', permanent: true },
      { source: '/service/rha-fillers-in-westfield-in', destination: '/services/rha', permanent: true },
      { source: '/service/revanesse-versa-lips-dermal-fillers-in-westfield-in', destination: '/services/versa', permanent: true },
      { source: '/service/relaxation-facial', destination: '/services/facials', permanent: true },
      { source: '/service/haloir-salt-therapy', destination: '/saltsauna', permanent: true },
      { source: '/service/zo-skin-health-professional-skin-care', destination: '/services/skin-iq', permanent: true },
      { source: '/service/botox-in-westfield-in', destination: '/services/botox', permanent: true },
      { source: '/service/hydrafacial', destination: '/services/hydrafacial', permanent: true },
      { source: '/service/glo2facial', destination: '/services/glo2facial', permanent: true },
      { source: '/service/morpheus8-rf-microneedling-in-westfield-in', destination: '/services/morpheus8', permanent: true },
      { source: '/service/massage-therapy', destination: '/services/massage', permanent: true },
      { source: '/service/clearlift', destination: '/services/clearlift', permanent: true },
      { source: '/service/jeuveau-say-goodbye-to-fine-lines-and-wrinkles', destination: '/services/jeuveau', permanent: true },
      { source: '/service/botox-dysport-xeomin-jeuveau-daxxify-injectable-neurotoxin', destination: '/services/tox', permanent: true },
      { source: '/service/fillers-radiesse-juvederm-restylane-perlane-evolence', destination: '/services/filler', permanent: true },
      { source: '/service/skinbetter-science-professional-skin-care', destination: '/skincare', permanent: true },
      { source: '/service/dysport-wrinkle-relaxer-treatments-westfield-in', destination: '/services/dysport', permanent: true },
      { source: '/service/colorscience-professional-skin-care-spf', destination: '/skincare/colorscience', permanent: true },
      { source: '/service/laser-hair-removal', destination: '/services/laser-hair-removal', permanent: true },
      { source: '/service/:path*', destination: '/services', permanent: true },

      //
      // --- Catch-alls (generic fallbacks) ---
      //
      { source: '/memberships-packages/:path*', destination: '/memberships', permanent: true },
      { source: '/our-services/:path*', destination: '/services', permanent: true },
      { source: '/book-:path*', destination: '/book', permanent: true },
    ];
  },

  // Note: if you use output:'export', Next.js redirects won't run at the edge/CDN.
  // In that case, handle redirects at your hosting layer (e.g., Vercel project redirects, Nginx/Apache).
};

module.exports = nextConfig;
