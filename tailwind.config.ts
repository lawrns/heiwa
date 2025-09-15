import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: '#3b82f6',
  			secondary: '#f97316',
  			success: '#22c55e',
  			accent: '#a855f7',
  			textNeutral: '#4b5563',
  			neutral: {
  				DEFAULT: '#4b5563',
  				foreground: '#ffffff'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			// Enhanced Heiwa House Brand Colors
  			oceanBlue: {
  				'50': 'var(--ocean-blue-50)',
  				'100': 'var(--ocean-blue-100)',
  				'200': 'var(--ocean-blue-200)',
  				'300': 'var(--ocean-blue-300)',
  				'400': 'var(--ocean-blue-400)',
  				'500': 'var(--ocean-blue-500)',
  				'600': 'var(--ocean-blue-600)',
  				'700': 'var(--ocean-blue-700)',
  				'800': 'var(--ocean-blue-800)',
  				'900': 'var(--ocean-blue-900)'
  			},
  			surfTeal: {
  				'50': 'var(--surf-teal-50)',
  				'100': 'var(--surf-teal-100)',
  				'200': 'var(--surf-teal-200)',
  				'300': 'var(--surf-teal-300)',
  				'400': 'var(--surf-teal-400)',
  				'500': 'var(--surf-teal-500)',
  				'600': 'var(--surf-teal-600)',
  				'700': 'var(--surf-teal-700)',
  				'800': 'var(--surf-teal-800)',
  				'900': 'var(--surf-teal-900)'
  			},
  			sandBeige: {
  				'50': 'var(--sand-beige-50)',
  				'100': 'var(--sand-beige-100)',
  				'200': 'var(--sand-beige-200)',
  				'300': 'var(--sand-beige-300)',
  				'400': 'var(--sand-beige-400)',
  				'500': 'var(--sand-beige-500)',
  				'600': 'var(--sand-beige-600)',
  				'700': 'var(--sand-beige-700)',
  				'800': 'var(--sand-beige-800)',
  				'900': 'var(--sand-beige-900)'
  			},
  			// Heiwa Orange mapped to CSS variables for admin theming
  			heiwaOrange: {
  				'50': 'var(--heiwa-orange-50)',
  				'100': 'var(--heiwa-orange-100)',
  				'200': 'var(--heiwa-orange-200)',
  				'300': 'var(--heiwa-orange-300)',
  				'400': 'var(--heiwa-orange-400)',
  				'500': 'var(--heiwa-orange-500)',
  				'600': 'var(--heiwa-orange-600)',
  				'700': 'var(--heiwa-orange-700)',
  				'800': 'var(--heiwa-orange-800)',
  				'900': 'var(--heiwa-orange-900)'
  			},
  			// Legacy brand colors (keeping for backward compatibility)
  			frOrange: {
  				'50': '#fff7ed',
  				'100': '#ffedd5',
  				'200': '#fed7aa',
  				'300': '#fdba74',
  				'400': '#fb923c',
  				'500': '#f97316',
  				'600': '#ea580c',
  				'700': '#c2410c',
  				'800': '#9a3412',
  				'900': '#7c2d12'
  			},
  			hhBlue: {
  				'50': '#eff6ff',
  				'100': '#dbeafe',
  				'200': '#bfdbfe',
  				'300': '#93c5fd',
  				'400': '#60a5fa',
  				'500': '#3b82f6',
  				'600': '#2563eb',
  				'700': '#1d4ed8',
  				'800': '#1e40af',
  				'900': '#1e3a8a'
  			},
  			gray: {
  				'50': '#f9fafb',
  				'100': '#f3f4f6',
  				'200': '#e5e7eb',
  				'300': '#d1d5db',
  				'400': '#9ca3af',
  				'500': '#6b7280',
  				'600': '#4b5563',
  				'700': '#374151',
  				'800': '#1f2937',
  				'900': '#111827'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			'xs': 'var(--font-size-xs)',
  			'sm': 'var(--font-size-sm)',
  			'base': 'var(--font-size-base)',
  			'lg': 'var(--font-size-lg)',
  			'xl': 'var(--font-size-xl)',
  			'2xl': 'var(--font-size-2xl)',
  			'3xl': 'var(--font-size-3xl)',
  			'4xl': 'var(--font-size-4xl)',
  			'5xl': 'var(--font-size-5xl)'
  		},
  		fontWeight: {
  			light: 'var(--font-weight-light)',
  			normal: 'var(--font-weight-normal)',
  			medium: 'var(--font-weight-medium)',
  			semibold: 'var(--font-weight-semibold)',
  			bold: 'var(--font-weight-bold)'
  		},
  		lineHeight: {
  			tight: 'var(--line-height-tight)',
  			normal: 'var(--line-height-normal)',
  			relaxed: 'var(--line-height-relaxed)'
  		},
  		spacing: {
  			'1': 'var(--space-1)',
  			'2': 'var(--space-2)',
  			'3': 'var(--space-3)',
  			'4': 'var(--space-4)',
  			'5': 'var(--space-5)',
  			'6': 'var(--space-6)',
  			'8': 'var(--space-8)',
  			'10': 'var(--space-10)',
  			'12': 'var(--space-12)',
  			'16': 'var(--space-16)',
  			'20': 'var(--space-20)',
  			'24': 'var(--space-24)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'fade-in-0': 'fadeIn 0s ease 0s 1 normal both',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'slide-in-from-top-2': 'slideInFromTop 0s ease 0s 1 normal both',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(10px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			slideInFromTop: {
  				'0%': {
  					transform: 'translateY(-8px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		borderRadius: {
  			'none': 'var(--radius-none)',
  			'sm': 'var(--radius-sm)',
  			'base': 'var(--radius-base)',
  			'md': 'var(--radius-md)',
  			'lg': 'var(--radius-lg)',
  			'xl': 'var(--radius-xl)',
  			'2xl': 'var(--radius-2xl)',
  			'3xl': 'var(--radius-3xl)',
  			'full': 'var(--radius-full)',
  			radiusCard: '8px',
  			radiusButton: '6px'
  		},
  		boxShadow: {
  			'sm': 'var(--shadow-sm)',
  			'base': 'var(--shadow-base)',
  			'md': 'var(--shadow-md)',
  			'lg': 'var(--shadow-lg)',
  			'xl': 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)',
  			shadowCard: '0 4px 6px rgba(0,0,0,0.1)'
  		},
  		transitionDuration: {
  			'fast': 'var(--transition-fast)',
  			'normal': 'var(--transition-normal)',
  			'slow': 'var(--transition-slow)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
