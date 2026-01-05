import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/page-metadata'
import SurfPageClient from './SurfPageClient'

// Revalidate every 10 seconds to pick up CMS/SEO changes quickly
export const revalidate = 10

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('surf')
}

export default function SurfPage() {
  return <SurfPageClient />
}
