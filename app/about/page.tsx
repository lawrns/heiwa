import { redirect } from 'next/navigation'
import { generatePageMetadata } from '@/lib/page-metadata'

// Generate SEO metadata from database
export async function generateMetadata() {
  return generatePageMetadata('about')
}

export default function AboutPage() {
  // Redirect to the-spot page which contains our about content
  redirect('/the-spot')
}
