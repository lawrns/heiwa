'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, Users, Package, MapPin, Clock, CreditCard, FileText } from 'lucide-react';

interface BookingItem {
  type: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dates?: {
    checkIn: string | Date;
    checkOut: string | Date;
  };
}

interface BookingWithClients {
  id: string;
  clientIds: string[];
  items: BookingItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'confirmed' | 'cancelled';
  paymentMethod?: string;
  notes?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
  clientNames?: string[];
}

interface ViewBookingModalProps {
  booking: BookingWithClients | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewBookingModal({ booking, isOpen, onClose }: ViewBookingModalProps) {
  if (!booking) return null;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'room':
        return 'Room Booking';
      case 'surfCamp':
        return 'Surf Camp';
      case 'addOn':
        return 'Add-on';
      default:
        return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Booking Details
          </DialogTitle>
          <DialogDescription>
            Booking ID: {booking.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge className={getStatusColor(booking.paymentStatus)}>
                {booking.paymentStatus}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Total Amount</span>
              </div>
              <p className="text-lg font-semibold">{formatCurrency(booking.totalAmount)}</p>
            </div>
          </div>

          <Separator />

          {/* Booking Items */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Booking Items</span>
            </div>
            <div className="space-y-3">
              {booking.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{getItemTypeLabel(item.type)}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.dates && item.dates.checkIn && item.dates.checkOut && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.dates.checkIn)} - {formatDate(item.dates.checkOut)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.totalPrice || 0)}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.unitPrice || 0)} each</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Payment Information</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium">{booking.paymentMethod || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Source</p>
                <p className="font-medium">{booking.source || 'dashboard'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Booking Dates</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{formatDate(booking.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">{formatDate(booking.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Notes</span>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
              </div>
            </>
          )}

          {/* Client Information */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Clients</span>
            </div>
            <div className="space-y-2">
              {booking.clientNames && booking.clientNames.length > 0 ? (
                booking.clientNames.map((name, index) => (
                  <p key={index} className="text-sm">{name}</p>
                ))
              ) : (
                <p className="text-sm text-gray-600">{booking.clientIds.length} client(s)</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
