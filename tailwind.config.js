/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary ocean blues
        primary: {
          DEFAULT: '#2B5F75',
          light: '#4A9DB5',
          dark: '#1A4252',
        },
        // Secondary warm tones
        secondary: {
          DEFAULT: '#D4C5A9',
          light: '#E8DCC4',
          dark: '#B8A88C',
        },
        // Accent sunset tones
        accent: {
          DEFAULT: '#ec681c',
          light: '#f77b2f',
          dark: '#d65d16',
          hover: '#d65d16',
        },
        // Neutrals
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F9F7F4',
          light: '#FAFAFA',
        },
        text: {
          DEFAULT: '#1A1A1A',
          muted: '#5A5A5A',
          light: '#757575',
        },
        // Legacy support
        'on-primary': '#FFFFFF',
        muted: '#5A5A5A',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        'section-y': '80px',
        'section-y-lg': '120px',
        'grid-gap': '24px',
        'card-padding': '40px',
      },
      borderRadius: {
        card: '8px',
        button: '6px',
        image: '4px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.12)',
        subtle: '0 1px 3px rgba(0, 0, 0, 0.06)',
      },
      maxWidth: {
        container: '1400px',
        content: '1200px',
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}

