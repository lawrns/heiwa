import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Surf Camps Management | Heiwa House Admin',
  description: 'Create and manage surf camp sessions and schedules',
}

export default function SurfCampsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

