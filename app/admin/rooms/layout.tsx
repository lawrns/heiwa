import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rooms Management | Heiwa House Admin',
  description: 'Manage room inventory, pricing, and availability',
}

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

