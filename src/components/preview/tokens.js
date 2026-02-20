// RELUXE 2026 Design Tokens
// Warm Neutral + Violet design system

export const colors = {
  // Background tiers
  cream: '#FAF8F5',
  stone: '#F0ECE6',
  taupe: '#E0D9CF',
  charcoal: '#2A2A2A',
  ink: '#1A1A1A',

  // Accent
  violet: '#7C3AED',
  fuchsia: '#C026D3',
  rose: '#E11D73',

  // Text
  heading: '#1A1A1A',
  body: '#4A4A4A',
  muted: '#8A8580',
  white: '#FAF8F5',
};

export const gradients = {
  primary: 'linear-gradient(135deg, #7C3AED, #C026D3, #E11D73)',
  subtle: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(192,38,211,0.04))',
  dark: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)',
};

export const fontPairings = {
  bold: {
    name: 'Bold Luxe',
    display: "'Playfair Display', Georgia, serif",
    body: "'Outfit', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=Outfit:wght@300;400;500;600;700&display=swap',
  },
  dramatic: {
    name: 'Dramatic',
    display: "'Bodoni Moda', Georgia, serif",
    body: "'Manrope', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=Manrope:wght@300;400;500;600;700&display=swap',
  },
  modern: {
    name: 'Modern Edge',
    display: "'Space Grotesk', system-ui, sans-serif",
    body: "'Plus Jakarta Sans', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap',
  },
};

export const typeScale = {
  hero: { size: 'clamp(3rem, 8vw, 7rem)', weight: 700, lineHeight: 1.0 },
  sectionHeading: { size: 'clamp(1.75rem, 3.5vw, 3rem)', weight: 600, lineHeight: 1.15 },
  subhead: { size: 'clamp(1.25rem, 2vw, 1.5rem)', weight: 500, lineHeight: 1.4 },
  body: { size: '1rem', weight: 400, lineHeight: 1.625 },
  caption: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
  label: { size: '0.75rem', weight: 600, lineHeight: 1.5, letterSpacing: '0.12em', textTransform: 'uppercase' },
};

export const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  '2xl': '4rem',
  '3xl': '6rem',
  '4xl': '8rem',
};

export const sectionPadding = {
  desktop: spacing['3xl'],
  mobile: spacing['2xl'],
};
