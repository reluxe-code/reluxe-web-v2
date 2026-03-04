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
        justifyContent: 'space-between',
        padding: '12px 16px',
      }}>
        <Link
          href="https://reluxemedspa.com"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 500,
            color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          Return Home
        </Link>
        <Link href="https://reluxemedspa.com" style={{ display: 'inline-flex' }}>
          <Image src="/images/logo/logo.png" alt="RELUXE Med Spa" width={140} height={47} priority />
        </Link>
        <div style={{ width: '95px' }} />
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
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '10px 16px',
      }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}>
            Prefer to book another way or have questions?
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href="tel:+13177631142"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '0.68rem', fontWeight: 600,
                color: '#fff', backgroundColor: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.4)',
                borderRadius: '999px', padding: '5px 14px', textDecoration: 'none',
                transition: 'background-color 0.15s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              Call Us
            </a>
            <a
              href="sms:+13177631142"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '0.68rem', fontWeight: 600,
                color: '#fff', backgroundColor: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.4)',
                borderRadius: '999px', padding: '5px 14px', textDecoration: 'none',
                transition: 'background-color 0.15s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Text Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
