import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payments Management | Heiwa House Admin',
  description: 'Manage payments and transactions',
}

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

