import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bookings Management | Heiwa House Admin',
  description: 'Manage all bookings and reservations',
}

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

