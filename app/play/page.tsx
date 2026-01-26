import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/page-metadata'
import PlayPageClient from './PlayPageClient'

// Revalidate every 10 seconds to pick up CMS/SEO changes quickly
export const revalidate = 10

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('play')
}

export default function PlayPage() {
  return <PlayPageClient />
}
