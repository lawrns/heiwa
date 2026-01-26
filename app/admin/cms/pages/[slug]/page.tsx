import { redirect } from 'next/navigation'

// Redirect to inline editor on live page
export default async function CmsPageRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Redirect to the live page where AdminToolbar provides inline editing
  redirect(slug === 'homepage' ? '/' : `/${slug}`)
}
