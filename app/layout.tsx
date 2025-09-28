import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navigation } from '@/components/navigation'
import { FloatingBookingWidget } from '@/components/floating-booking-widget'
import { navigationItems } from '@/lib/content'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})



export const metadata: Metadata = {
  title: {
    default: 'Heiwa House - A Wave Away | Surf & Adventure Retreat',
    template: '%s | Heiwa House'
  },
  description: 'Nestled on Portugal\'s coast, Heiwa House is your sanctuary for rest and adventure. Experience world-class surfing, yoga, and coastal living.',
  keywords: ['surf camp', 'yoga retreat', 'Portugal', 'surfing', 'adventure', 'coastal living'],
  authors: [{ name: 'Heiwa House' }],
  creator: 'Heiwa House',
  publisher: 'Heiwa House',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://heiwahouse.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://heiwahouse.com',
    title: 'Heiwa House - A Wave Away | Surf & Adventure Retreat',
    description: 'Nestled on Portugal\'s coast, Heiwa House is your sanctuary for rest and adventure.',
    siteName: 'Heiwa House',
    images: [
      {
        url: '/images/og/heiwa-house-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Heiwa House coastal retreat',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heiwa House - A Wave Away',
    description: 'Nestled on Portugal\'s coast, Heiwa House is your sanctuary for rest and adventure.',
    images: ['/images/og/heiwa-house-twitter.jpg'],
    creator: '@heiwahouse',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Archivo+Narrow:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-surface text-text">
        <Navigation items={navigationItems} />
        <main className="min-h-screen">
          {children}
        </main>
        <FloatingBookingWidget />
        <footer className="bg-surface-alt border-t border-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-heading font-semibold text-text mb-4">
                  Heiwa House
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-4">
                  Nestled on Portugal&apos;s coast, Heiwa House is your sanctuary for rest and adventure.
                  Experience world-class surfing, yoga, and coastal living.
                </p>
                <p className="text-muted text-xs">
                  © 2024 Heiwa House. All rights reserved.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text mb-4">Navigation</h4>
                <ul className="space-y-2">
                  {navigationItems.map((item) => (
                    <li key={item.path}>
                      <a
                        href={item.path}
                        className="text-muted text-sm hover:text-primary transition-colors"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text mb-4">Contact</h4>
                <div className="space-y-2 text-muted text-sm">
                  <p>Portugal</p>
                  <a
                    href="mailto:info@heiwahouse.com"
                    className="hover:text-primary transition-colors"
                  >
                    info@heiwahouse.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}