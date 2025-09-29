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
          DEFAULT: '#E57A5F',
          light: '#F29680',
          dark: '#D76A47',
          hover: '#D76A47',
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
    },
  },
  plugins: [],
}

