import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invoices Management | Heiwa House Admin',
  description: 'Manage invoices and billing',
}

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

