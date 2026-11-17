import tailwindcssAnimate from 'tailwindcss-animate';

/** Aurelia design tokens: ivory & cream days, navy nights, gold accents, royal blue. */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1320px' },
    },
    extend: {
      colors: {
        ivory: '#FFFDF7',
        cream: '#F5EFE0',
        sand: '#E9DFC9',
        gold: { DEFAULT: '#C9A24B', light: '#E6D3A3', dark: '#A8833A', ink: '#866526' },
        champagne: '#E6D3A3',
        royal: { DEFAULT: '#1E3A8A', light: '#2547B8' },
        sapphire: '#2547B8',
        navy: { DEFAULT: '#0B1630', 950: '#060C1C', 900: '#0B1630', 800: '#101F42', 700: '#16295A' },
        charcoal: '#1C1C1E',
        taupe: { DEFAULT: '#8A8070', ink: '#6B6253' },
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        card: { DEFAULT: 'hsl(var(--card) / <alpha-value>)', foreground: 'hsl(var(--card-foreground) / <alpha-value>)' },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: { DEFAULT: 'hsl(var(--muted) / <alpha-value>)', foreground: 'hsl(var(--muted-foreground) / <alpha-value>)' },
        accent: { DEFAULT: 'hsl(var(--accent) / <alpha-value>)', foreground: 'hsl(var(--accent-foreground) / <alpha-value>)' },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        eyebrow: 'hsl(var(--eyebrow) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Manrope Variable"', 'Manrope', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['clamp(3.25rem, 8vw, 8.25rem)', { lineHeight: '0.92', letterSpacing: '-0.025em' }],
        'display-xl': ['clamp(2.75rem, 6vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 4.25rem)', { lineHeight: '1.02', letterSpacing: '-0.018em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.012em' }],
        'display-sm': ['clamp(1.375rem, 2vw, 1.875rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        micro: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.3em', fontWeight: '600' }],
      },
      letterSpacing: { luxe: '0.3em', wider2: '0.18em' },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        luxe: '0 1px 2px rgba(11,22,48,.06), 0 8px 24px -6px rgba(11,22,48,.12), 0 24px 64px -12px rgba(11,22,48,.18)',
        glass: '0 8px 32px -8px rgba(11,22,48,.18), inset 0 1px 0 0 rgba(255,255,255,.55)',
        'glass-dark': '0 8px 32px -8px rgba(0,0,0,.55), inset 0 1px 0 0 rgba(255,255,255,.08)',
        'gold-glow': '0 0 0 1px rgba(201,162,75,.35), 0 10px 34px -8px rgba(201,162,75,.5)',
        'inner-gold': 'inset 0 0 0 1px rgba(201,162,75,.25)',
      },
      backgroundImage: {
        'gold-foil': 'linear-gradient(135deg, #B8892F 0%, #F3DFA2 50%, #B8892F 100%)',
        'gold-sheen':
          'linear-gradient(110deg, #B8892F 0%, #E9CF8A 35%, #FFF6DA 50%, #E9CF8A 65%, #B8892F 100%)',
        'royal-night': 'linear-gradient(160deg, #0B1630 0%, #1E3A8A 100%)',
        'navy-depth': 'radial-gradient(120% 80% at 50% 0%, #16295A 0%, #0B1630 55%, #060C1C 100%)',
        'cream-glow': 'radial-gradient(ellipse at top, #FFFDF7 0%, #F5EFE0 70%)',
        'hairline-gold': 'linear-gradient(90deg, transparent, rgba(201,162,75,.65), transparent)',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
        silk: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(calc(-100% - var(--gap)))' } },
        'marquee-vertical': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-100% - var(--gap)))' },
        },
        'border-beam': { '100%': { offsetDistance: '100%' } },
        'pulse-ring': {
          '0%': { transform: 'scale(.6)', opacity: '.9' },
          '80%, 100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'spotlight-in': {
          '0%': { opacity: '0', transform: 'translate(-72%, -62%) scale(.5)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -40%) scale(1)' },
        },
        'kenburns': {
          '0%': { transform: 'scale(1.04) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.16) translate3d(-2%, -2%, 0)' },
        },
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'scroll-cue': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 6s linear infinite',
        marquee: 'marquee var(--duration, 40s) linear infinite',
        'marquee-vertical': 'marquee-vertical var(--duration, 40s) linear infinite',
        'border-beam': 'border-beam calc(var(--duration, 8) * 1s) infinite linear',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'spotlight-in': 'spotlight-in 2s ease .6s 1 forwards',
        kenburns: 'kenburns 14s ease-out infinite alternate',
        'accordion-down': 'accordion-down .3s ease-out',
        'accordion-up': 'accordion-up .3s ease-out',
        'spin-slow': 'spin 14s linear infinite',
        'scroll-cue': 'scroll-cue 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
