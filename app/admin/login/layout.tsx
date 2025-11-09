import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login | Heiwa House',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
