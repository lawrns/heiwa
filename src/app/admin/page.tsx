import { Metadata } from 'next'
import AdminDashboard from '@/components/admin/AdminDashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Heiwa House CMS',
  description: 'Administrative dashboard for managing bookings, rooms, and surf camps',
}

export default function AdminPage() {
  return <AdminDashboard />
}
