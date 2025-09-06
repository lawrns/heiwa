'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  EditIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  WavesIcon,
  DollarSignIcon
} from 'lucide-react';

interface BookingItem {
  id: string;
  type: 'room' | 'surfCamp' | 'addOn';
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startDate?: string;
  endDate?: string;
  nights?: number;
}

interface Booking {
  id: string;
  clientIds: string[];
  items: BookingItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'confirmed' | 'cancelled';
  paymentMethod?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const EditBookingSchema = z.object({
  notes: z.string().optional(),
  paymentMethod: z.enum(['stripe', 'cash', 'transfer', 'other']).optional(),
});

type EditBookingForm = z.infer<typeof EditBookingSchema>;

export default function BookingsList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EditBookingForm>({
    resolver: zodResolver(EditBookingSchema)
  });

  // Fetch client bookings
  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // For now, use mock data since we need to implement client-specific API
      const mockBookings: Booking[] = [
        {
          id: 'booking_001',
          clientIds: [user.uid],
          items: [
            {
              id: 'item_001',
              type: 'surfCamp',
              itemId: 'camp_001',
              name: 'Beginner\'s Paradise',
              quantity: 1,
              unitPrice: 450,
              totalPrice: 450,
              startDate: '2024-03-01',
              endDate: '2024-03-07'
            }
          ],
          totalAmount: 450,
          paymentStatus: 'confirmed',
          paymentMethod: 'stripe',
          notes: 'First surf camp experience',
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date('2024-02-15')
        },
        {
          id: 'booking_002',
          clientIds: [user.uid],
          items: [
            {
              id: 'item_002',
              type: 'room',
              itemId: 'room_001',
              name: 'Ocean View Suite',
              quantity: 1,
              unitPrice: 250,
              totalPrice: 1000,
              nights: 4,
              startDate: '2024-04-01',
              endDate: '2024-04-05'
            }
          ],
          totalAmount: 1000,
          paymentStatus: 'pending',
          paymentMethod: 'stripe',
          notes: 'Anniversary celebration',
          createdAt: new Date('2024-03-20'),
          updatedAt: new Date('2024-03-20')
        }
      ];

      setBookings(mockBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchBookings();

    // Set up Supabase real-time subscription
    const subscription = supabase
      .channel('bookings_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `client_ids.cs.{${user?.uid}}`
        }, 
        (payload) => {
          console.log('Booking change received:', payload);
          fetchBookings(); // Refresh bookings on change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    reset({
      notes: booking.notes,
      paymentMethod: booking.paymentMethod as any
    });
    setIsEditDialogOpen(true);
  };

  const onSubmitEdit = async (data: EditBookingForm) => {
    if (!editingBooking) return;

    try {
      // Mock API call - in real implementation, call /api/bookings/client
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === editingBooking.id 
          ? { ...booking, ...data, updatedAt: new Date() }
          : booking
      ));

      toast.success('Booking updated successfully');
      setIsEditDialogOpen(false);
      setEditingBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <WavesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-4">Ready to catch some waves? Book your first surf camp!</p>
            <Button>
              Browse Surf Camps
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="space-y-4">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AccordionItem value={booking.id} className="border rounded-lg">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <WavesIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">
                          {booking.items[0]?.name || 'Booking'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              {booking.items[0]?.startDate && 
                                new Date(booking.items[0].startDate).toLocaleDateString()
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSignIcon className="w-4 h-4" />
                            <span>${booking.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(booking.paymentStatus)}>
                        {getStatusIcon(booking.paymentStatus)}
                        <span className="ml-1 capitalize">{booking.paymentStatus}</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBooking(booking);
                        }}
                        data-testid={`edit-booking-${booking.id}`}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Booking ID:</span>
                            <span className="font-mono">{booking.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Created:</span>
                            <span>{booking.createdAt.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Payment Method:</span>
                            <span className="capitalize">{booking.paymentMethod || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                        <div className="space-y-2">
                          {booking.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.name} × {item.quantity}</span>
                              <span>${item.totalPrice}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update your booking details and preferences.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any special requests or notes..."
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-sm text-red-600 mt-1" data-testid="error-message">
                  {errors.notes.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select {...register('paymentMethod')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Credit Card (Stripe)</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
