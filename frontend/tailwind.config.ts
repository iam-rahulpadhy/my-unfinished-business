/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // ── Brand Palette (Mapped to CSS variables) ──
        bg: {
          base:    'rgb(var(--color-bg-base) / <alpha-value>)',
          surface: 'rgb(var(--color-bg-surface) / <alpha-value>)',
          card:    'rgb(var(--color-bg-card) / <alpha-value>)',
          hover:   'rgb(var(--color-bg-hover) / <alpha-value>)',
          border:  'rgb(var(--color-bg-border) / <alpha-value>)',
        },
        text: {
          primary:   'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted:     'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        accent: {
          bull:     'rgb(var(--color-accent-bull) / <alpha-value>)',
          bear:     'rgb(var(--color-accent-bear) / <alpha-value>)',
          neutral:  '#71717A', // Hardcoded neutral since it doesn't change
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1', fontWeight: '800', letterSpacing: '-0.04em' }],
        'ticker':  ['2.5rem', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.03em' }],
      },
      backdropBlur: {
        glass: '20px',
      },
      borderRadius: {
        glass: '16px',
      },
      boxShadow: {
        // Use generic none here, our custom glass shadow is in index.css as a utility
        'bull-glow':  'none',
        'bear-glow':  'none',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
