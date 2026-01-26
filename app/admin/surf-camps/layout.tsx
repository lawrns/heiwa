import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Surf Weeks Management | Heiwa House Admin',
  description: 'Create and manage surf week sessions and schedules',
}

export default function SurfCampsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

