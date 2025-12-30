import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/page-metadata'
import SurfPageClient from './SurfPageClient'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('surf')
}

export default function SurfPage() {
  return <SurfPageClient />
}
