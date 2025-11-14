import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clients Management | Heiwa House Admin',
  description: 'View and manage client information and history',
}

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

