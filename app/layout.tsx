import type { Metadata } from 'next'
import { Archivo, Archivo_Narrow } from 'next/font/google'
import NavigationWrapper from '@/components/navigation-wrapper'
import { Footer } from '@/components/footer'
import { BookingProvider } from '@/lib/booking-context'
import { SupabaseProvider } from '@/lib/supabase-context'
import { FloatingBookingWidget } from '@/components/floating-booking-widget'
import { SkipToContent } from '@/components/ui/skip-to-content'
import { PageTransition } from '@/components/ui/page-transition'
import { WhatsAppButton } from '@/components/ui/whatsapp-button'
import { AdminToolbar } from '@/components/admin/inline-editor/AdminToolbar'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  variable: '--font-archivo-narrow',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
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
    <html lang="en" className={`${archivo.variable} ${archivoNarrow.variable}`} data-scroll-behavior="smooth">
      <head>
        <link rel="dns-prefetch" href="//pguipwhrxdzzrndbluxb.supabase.co" />
        <meta name="theme-color" content="#ec681c" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans antialiased bg-surface text-text">
        <SkipToContent />
        <SupabaseProvider>
          <BookingProvider>
              <NavigationWrapper />
              <main id="main-content" className="min-h-screen">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
              <Footer />
              <FloatingBookingWidget />
              <WhatsAppButton />
              <AdminToolbar />
          </BookingProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}