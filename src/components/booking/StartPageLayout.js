import Link from 'next/link';
import Image from 'next/image';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export default function StartPageLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Sticky header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 0',
      }}>
        <Link href="https://reluxemedspa.com" style={{ display: 'inline-flex' }}>
          <Image src="/images/logo/logo.png" alt="RELUXE Med Spa" width={160} height={53} priority />
        </Link>
      </header>

      {/* Main content */}
      <section style={{ backgroundColor: '#121317', flex: 1, position: 'relative', paddingTop: 24, paddingBottom: 80 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.45, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '72%', height: '55%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.16), transparent 72%)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">{children}</div>
      </section>

      {/* Sticky footer */}
      <footer style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 50,
        backgroundColor: '#000',
        padding: '10px 0',
        textAlign: 'center',
      }}>
        <span style={{ fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '0.625rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
          RELUXE Med Spa &nbsp;·&nbsp; <a href="tel:+13177631142" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>(317) 763-1142</a>
        </span>
      </footer>
    </div>
  );
}
