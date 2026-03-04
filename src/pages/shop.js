// pages/shop.js
import Image from 'next/image';
import Link from 'next/link';
import BetaLayout from '@/components/beta/BetaLayout';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';

const FONT_KEY = 'bold';
const fonts = fontPairings[FONT_KEY];
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export default function ShopPage() {
  return (
    <BetaLayout
      title="Shop Skincare & Payments"
      description="Shop professional skincare from RELUXE Med Spa. Browse medical-grade products, make payments, and manage your account. Serving Westfield & Carmel, IN."
      canonical="https://reluxemedspa.com/shop"
    >
      {/* Hero banner image */}
      <section style={{ width: '100%' }}>
        <img
          src="/images/page-banner/skincare-header.png"
          alt="Shop Professional Skincare"
          style={{ width: '100%', height: 400, objectFit: 'cover', display: 'block' }}
        />
      </section>

      {/* Colorescience Anniversary Sale Banner */}
      <section
        style={{
          paddingTop: '2.5rem',
          paddingBottom: '2.5rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          background: 'linear-gradient(135deg, #FDF6F0 0%, #FFF5EE 50%, #FDF6F0 100%)',
        }}
      >
        <div
          className="max-w-4xl mx-auto flex flex-col md:flex-row items-center"
          style={{ gap: '1.5rem' }}
        >
          <div className="flex-1 text-center md:text-left">
            <p
              style={{
                fontFamily: fonts.body,
                ...typeScale.label,
                color: '#CF7155',
                marginBottom: '0.25rem',
              }}
            >
              Limited Time
            </p>
            <h2
              style={{
                fontFamily: fonts.display,
                fontSize: typeScale.sectionHeading.size,
                fontWeight: typeScale.sectionHeading.weight,
                lineHeight: typeScale.sectionHeading.lineHeight,
                color: '#CF7155',
                fontStyle: 'italic',
              }}
            >
              Colorescience Anniversary Sale
            </h2>
            <p
              style={{
                marginTop: '0.5rem',
                fontFamily: fonts.body,
                fontSize: typeScale.body.size,
                lineHeight: typeScale.body.lineHeight,
                color: colors.body,
              }}
            >
              20% off sitewide &mdash; no exclusions. Free shipping on all orders. March 5&ndash;22.
            </p>
          </div>
          <Link
            href="https://colorescience.com/reluxe-med-spa"
            target="_blank"
            style={{
              display: 'inline-block',
              color: '#fff',
              padding: '0.75rem 2rem',
              borderRadius: '9999px',
              fontFamily: fonts.body,
              fontWeight: 600,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #CF7155, #B85A40)',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            Shop the Sale &rarr;
          </Link>
        </div>
      </section>

      {/* Skincare Shopping Section */}
      <section
        style={{
          paddingTop: '4rem',
          paddingBottom: '4rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          backgroundColor: '#fff',
        }}
      >
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: typeScale.sectionHeading.size,
            fontWeight: typeScale.sectionHeading.weight,
            lineHeight: typeScale.sectionHeading.lineHeight,
            color: colors.heading,
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          Buy Professional Skincare
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* SkinBetter */}
          <div
            style={{
              backgroundColor: colors.cream,
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              textAlign: 'center',
            }}
          >
            <Image
              src="/images/shop/skinbetter.jpeg"
              alt="SkinBetter Science"
              width={600}
              height={600}
              style={{ borderRadius: '0.5rem', margin: '0 auto' }}
            />
            <h3
              style={{
                fontFamily: fonts.display,
                fontSize: typeScale.subhead.size,
                fontWeight: 600,
                color: colors.heading,
                marginTop: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              SkinBetter Science
            </h3>
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: typeScale.body.size,
                color: colors.body,
                marginBottom: '1rem',
              }}
            >
              Shop SkinBetter directly with RELUXE — results-driven skincare backed by science.
            </p>
            <Link
              href="https://skinbetter.pro/reluxemedspa"
              target="_blank"
              style={{
                display: 'inline-block',
                backgroundColor: colors.ink,
                color: '#fff',
                padding: '0.5rem 1.5rem',
                borderRadius: '9999px',
                fontFamily: fonts.body,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
            >
              Buy Now
            </Link>
          </div>

          {/* Colorescience */}
          <div
            style={{
              backgroundColor: colors.cream,
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                borderRadius: '9999px',
                padding: '0.25rem 0.75rem',
                fontFamily: fonts.body,
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(135deg, #CF7155, #B85A40)',
              }}
            >
              20% OFF
            </div>
            <Image
              src="/images/shop/cs.png"
              alt="Colorescience"
              width={600}
              height={600}
              style={{ borderRadius: '0.5rem', margin: '0 auto' }}
            />
            <h3
              style={{
                fontFamily: fonts.display,
                fontSize: typeScale.subhead.size,
                fontWeight: 600,
                color: colors.heading,
                marginTop: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              Colorescience
            </h3>
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: typeScale.body.size,
                color: colors.body,
                marginBottom: '1rem',
              }}
            >
              Anniversary Sale: 20% off sitewide + free shipping. No exclusions. March 5&ndash;22.
            </p>
            <Link
              href="https://colorescience.com/reluxe-med-spa"
              target="_blank"
              style={{
                display: 'inline-block',
                color: '#fff',
                padding: '0.5rem 1.5rem',
                borderRadius: '9999px',
                fontFamily: fonts.body,
                fontWeight: 600,
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #CF7155, #B85A40)',
                transition: 'opacity 0.2s',
              }}
            >
              Shop the Sale
            </Link>
          </div>
        </div>
      </section>

      {/* Ways to Pay */}
      <section
        style={{
          paddingTop: '5rem',
          paddingBottom: '5rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          backgroundColor: colors.cream,
        }}
      >
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: typeScale.sectionHeading.size,
            fontWeight: typeScale.sectionHeading.weight,
            lineHeight: typeScale.sectionHeading.lineHeight,
            color: colors.heading,
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          Ways to Pay at RELUXE
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Cherry */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: `1px solid ${colors.taupe}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: fonts.display,
                fontSize: typeScale.subhead.size,
                fontWeight: 600,
                color: colors.heading,
                marginTop: '1rem',
              }}
            >
              Cherry Payment Plans
            </h3>
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: typeScale.body.size,
                color: colors.body,
                marginTop: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              Split your treatments into monthly payments with 0% interest options.
            </p>
            <Link
              href="https://pay.withcherry.com/reluxe-med-spa?utm_source=practice&utm_medium=website&m=20441"
              style={{
                display: 'inline-block',
                backgroundColor: colors.ink,
                color: '#fff',
                padding: '0.5rem 1.5rem',
                borderRadius: '9999px',
                fontFamily: fonts.body,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
            >
              Apply Now
            </Link>
          </div>

          {/* Spafinder */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: `1px solid ${colors.taupe}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: fonts.display,
                fontSize: typeScale.subhead.size,
                fontWeight: 600,
                color: colors.heading,
                marginTop: '1rem',
              }}
            >
              Spafinder Gift Cards
            </h3>
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: typeScale.body.size,
                color: colors.body,
                marginTop: '0.5rem',
              }}
            >
              Yes! We gladly accept Spafinder gift certificates.
            </p>
          </div>

          {/* RELUXE Gift Cards */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: `1px solid ${colors.taupe}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: fonts.display,
                fontSize: typeScale.subhead.size,
                fontWeight: 600,
                color: colors.heading,
                marginTop: '1rem',
              }}
            >
              RELUXE Gift Cards
            </h3>
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: typeScale.body.size,
                color: colors.body,
                marginTop: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              Give the gift of beauty. Purchase a digital RELUXE gift card instantly.
            </p>
            <Link
              href="https://blvd.me/reluxemedspa/gift-cards"
              style={{
                display: 'inline-block',
                backgroundColor: colors.ink,
                color: '#fff',
                padding: '0.5rem 1.5rem',
                borderRadius: '9999px',
                fontFamily: fonts.body,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
            >
              Buy Gift Card
            </Link>
          </div>
        </div>
      </section>
    </BetaLayout>
  );
}

ShopPage.getLayout = (page) => page;
