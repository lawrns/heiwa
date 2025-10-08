import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NavigationWrapper from '@/components/navigation-wrapper'
import { Footer } from '@/components/footer'
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
        <NavigationWrapper />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}