'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Mail, Phone, Building2, Calendar, Euro, CalendarDays, Star } from 'lucide-react'
import { formatDateCompact } from '@/lib/utils'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  vip: boolean
  totalBookings: number
  totalSpent: number
  joinDate: string
  lastBooking?: string
  notes?: string
}

interface ViewClientModalProps {
  open: boolean
  client: Client | null
  onClose: () => void
}

export function ViewClientModal({ open, onClose, client }: ViewClientModalProps) {
  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
          <DialogDescription>
            View client information and booking history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-white">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Client Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900">{client.name}</p>
                  {client.vip && (
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  )}
                </div>
              </div>
              {client.vip && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <Star className="h-3 w-3 fill-amber-500" />
                    VIP Client
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="text-sm text-gray-900">{client.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </p>
                <p className="text-sm text-gray-900">{client.phone || '-'}</p>
              </div>
            </div>

            {client.company && (
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company
                </p>
                <p className="text-sm text-gray-900">{client.company}</p>
              </div>
            )}
          </div>

          {/* Booking Statistics */}
          <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-white">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Booking Statistics</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900">{client.totalBookings}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-gray-900">€{client.totalSpent.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined
                </p>
                <p className="text-sm text-gray-900">{formatDateCompact(client.joinDate)}</p>
              </div>
              {client.lastBooking && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Booking</p>
                  <p className="text-sm text-gray-900">{formatDateCompact(client.lastBooking)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
