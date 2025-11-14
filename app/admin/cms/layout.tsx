import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CMS | Heiwa House Admin',
  description: 'Content Management System',
}

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

