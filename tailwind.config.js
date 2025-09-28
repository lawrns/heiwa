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
        primary: '#ec681c',
        'on-primary': '#FFFFFF',
        surface: '#FFFFFF',
        'surface-alt': '#F8F9FA',
        text: '#1a1a1a',
        muted: '#5a5a5a',
        accent: '#ec681c',
        'accent-hover': '#ed5600',
      },
      fontFamily: {
        sans: ['Archivo', 'sans-serif'],
        heading: ['Archivo Narrow', 'sans-serif'],
      },
      spacing: {
        'section-y': '96px',
        'grid-gap': '24px',
      },
      borderRadius: {
        card: '12px',
        button: '8px',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
