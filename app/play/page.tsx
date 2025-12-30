import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/page-metadata'
import PlayPageClient from './PlayPageClient'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('play')
}

export default function PlayPage() {
  return <PlayPageClient />
}
