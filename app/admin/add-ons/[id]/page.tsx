import EditAddOnClient from './EditAddOnClient'

export default async function EditAddOnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EditAddOnClient id={id} />
}

