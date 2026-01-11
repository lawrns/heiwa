import EditMediaClient from './EditMediaClient'

export default async function EditMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EditMediaClient id={id} />
}
