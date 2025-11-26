import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'About Us - Heiwa House',
  description: 'Learn about Heiwa House - your surf and lifestyle destination in Santa Cruz, Portugal. Discover our story, facilities, and what makes us special.',
}

export default function AboutPage() {
  // Redirect to the-spot page which contains our about content
  redirect('/the-spot')
}
