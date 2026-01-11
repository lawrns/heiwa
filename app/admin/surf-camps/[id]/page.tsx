import SurfCampClient from './SurfCampClient'

export default async function SurfCampPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SurfCampClient id={id} />
}
