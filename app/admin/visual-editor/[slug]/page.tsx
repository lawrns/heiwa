import VisualEditorClient from './VisualEditorClient'

export default async function VisualEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <VisualEditorClient slug={slug} />
}
