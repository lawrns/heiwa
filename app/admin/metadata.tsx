import { Metadata } from 'next'

export const adminMetadata: Record<string, Metadata> = {
  '/admin': {
    title: 'Admin Dashboard | Heiwa House',
    description: 'Heiwa House Admin Dashboard',
  },
  '/admin/bookings': {
    title: 'Bookings Management | Heiwa House Admin',
    description: 'Manage all bookings and reservations',
  },
  '/admin/rooms': {
    title: 'Rooms Management | Heiwa House Admin',
    description: 'Manage room inventory, pricing, and availability',
  },
  '/admin/surf-camps': {
    title: 'Surf Camps Management | Heiwa House Admin',
    description: 'Create and manage surf camp sessions and schedules',
  },
  '/admin/clients': {
    title: 'Clients Management | Heiwa House Admin',
    description: 'View and manage client information and history',
  },
  '/admin/invoices': {
    title: 'Invoices Management | Heiwa House Admin',
    description: 'Manage invoices and billing',
  },
  '/admin/payments': {
    title: 'Payments Management | Heiwa House Admin',
    description: 'Manage payments and transactions',
  },
  '/admin/calendar': {
    title: 'Calendar | Heiwa House Admin',
    description: 'View booking calendar and manage schedules',
  },
  '/admin/cms': {
    title: 'CMS | Heiwa House Admin',
    description: 'Content Management System',
  },
  '/admin/analytics': {
    title: 'Analytics | Heiwa House Admin',
    description: 'View booking statistics and revenue reports',
  },
}

