import { redirect } from 'next/navigation'

// Redirect to inline editor on homepage
export default function HomepageRedirect() {
  // Redirect to homepage where AdminToolbar provides inline editing
  redirect('/')
}
