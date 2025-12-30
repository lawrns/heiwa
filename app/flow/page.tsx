import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/page-metadata'
import FlowPageClient from './FlowPageClient'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('flow')
}

export default function FlowPage() {
  return <FlowPageClient />
}
