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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accentUI: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Primary ocean blues
        primary: {
          DEFAULT: '#2B5F75',
          light: '#4A9DB5',
          dark: '#1A4252',
          foreground: '#FFFFFF',
        },
        // Secondary warm tones
        secondary: {
          DEFAULT: '#D4C5A9',
          light: '#E8DCC4',
          dark: '#B8A88C',
          foreground: '#1A1A1A',
        },
        // Accent sunset tones
        accent: {
          DEFAULT: '#ec681c',
          light: '#f77b2f',
          dark: '#d65d16',
          hover: '#d65d16',
          foreground: '#FFFFFF',
        },
        // Admin theme - Heiwa Orange
        heiwaOrange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Neutrals
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F9F7F4',
          light: '#FAFAFA',
        },
        // Status Colors
        success: {
          DEFAULT: '#16a34a', // green-600
          light: '#dcfce7',   // green-50
          dark: '#15803d',    // green-700
        },
        warning: {
          DEFAULT: '#d97706', // amber-600
          light: '#fef3c7',   // amber-50
          dark: '#b45309',    // amber-700
        },
        error: {
          DEFAULT: '#dc2626', // red-600
          light: '#fee2e2',   // red-50
          dark: '#b91c1c',    // red-700
        },
        info: {
          DEFAULT: '#2563eb', // blue-600
          light: '#eff6ff',   // blue-50
          dark: '#1d4ed8',    // blue-700
        },
        text: {
          DEFAULT: '#1A1A1A',
          muted: '#5A5A5A',
          light: '#757575',
        },
        // Legacy support
        'on-primary': '#FFFFFF',
        // NOTE: do not re-define `muted` here; it is used for shadcn token colors above
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
        // Airbnb-quality shadow tokens
        subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        // Glow effects for premium feel
        'glow-accent': '0 0 20px rgba(236, 104, 28, 0.3)',
        'glow-success': '0 0 20px rgba(22, 163, 74, 0.3)',
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
        // Airbnb-quality animations
        'shimmer': 'shimmer 1.5s infinite',
        'scale-in': 'scale-in 0.3s ease-out',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
        'confetti': 'confetti 3s ease-out forwards',
        'check-mark': 'check-mark 0.3s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
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
        // Airbnb-quality keyframes
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-ring': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'check-mark': {
          '0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(-45deg)' },
          '100%': { transform: 'scale(1) rotate(-45deg)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionDuration: {
        '400': '400ms',
        // Airbnb-quality transition durations
        'micro': '150ms',
        'standard': '300ms',
        'slow': '500ms',
      },
      transitionTimingFunction: {
        // Airbnb-quality easing functions
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

