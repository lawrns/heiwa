import EditActivityClient from './EditActivityClient'

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EditActivityClient id={id} />
}
