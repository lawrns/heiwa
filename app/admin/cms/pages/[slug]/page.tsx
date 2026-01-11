import CmsPageClient from './CmsPageClient'

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <CmsPageClient slug={slug} />
}
