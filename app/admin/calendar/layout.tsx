import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendar | Heiwa House Admin',
  description: 'View booking calendar and manage schedules',
}

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

