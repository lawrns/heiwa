import EditSurfCampClient from './EditSurfCampClient'

export default async function EditSurfCampPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EditSurfCampClient id={id} />
}
