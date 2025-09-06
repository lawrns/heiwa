'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateBookingSchema, type Client, type Room, type SurfCamp, type AddOn } from '@/lib/schemas';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Loader2, Plus, Minus, Search, Calendar, DollarSign, Users } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import {
  calculateRoomPrice,
  calculateSurfCampPrice,
  calculateAddOnPrice,
  calculateTotalAmount,
  calculatePriceBreakdown,
  formatCurrency,
  type BookingItem as CalculationBookingItem
} from '@/lib/booking-calculations';

const CreateBookingFormSchema = CreateBookingSchema;
type CreateBookingForm = z.infer<typeof CreateBookingFormSchema>;

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

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateBookingModal({ isOpen, onClose, onSuccess }: CreateBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<(Client & { id: string })[]>([]);
  const [rooms, setRooms] = useState<(Room & { id: string })[]>([]);
  const [surfCamps, setSurfCamps] = useState<(SurfCamp & { id: string })[]>([]);
  const [addOns, setAddOns] = useState<(AddOn & { id: string })[]>([]);
  const [selectedItems, setSelectedItems] = useState<BookingItem[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<CreateBookingForm>({
    resolver: zodResolver(CreateBookingFormSchema),
    defaultValues: {
      clientIds: [],
      items: [],
      totalAmount: 0,
      paymentStatus: 'pending',
      paymentMethod: undefined,
      notes: '',
    },
  });

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);

      // Load clients, rooms, surf camps, and add-ons from Supabase in parallel
      const [clientsResult, roomsResult, surfCampsResult, addOnsResult] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('rooms').select('*').order('created_at', { ascending: false }),
        supabase.from('surf_camps').select('*').order('created_at', { ascending: false }),
        supabase.from('add_ons').select('*').order('created_at', { ascending: false })
      ]);

      // Process clients
      if (clientsResult.error) {
        console.error('Failed to load clients:', clientsResult.error);
        toast.error('Failed to load clients');
      } else {
        // Convert database format to Client format
        const formattedClients = clientsResult.data?.map((client: any) => ({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          brand: 'Heiwa House', // Default brand
          status: 'Active', // Default status
          lastBookingDate: client.last_booking_date
            ? { seconds: new Date(client.last_booking_date).getTime() / 1000, nanoseconds: 0 }
            : null,
          registrationDate: { seconds: new Date(client.created_at).getTime() / 1000, nanoseconds: 0 },
          notes: client.notes || '',
          createdAt: { seconds: new Date(client.created_at).getTime() / 1000, nanoseconds: 0 },
          updatedAt: { seconds: new Date(client.updated_at).getTime() / 1000, nanoseconds: 0 }
        })) as Client[];
        setClients(formattedClients || []);
      }

      // Process rooms
      if (roomsResult.error) {
        console.error('Failed to load rooms:', roomsResult.error);
        toast.error('Failed to load rooms');
      } else {
        // Convert database format to Room format
        const formattedRooms = roomsResult.data?.map((room: any) => ({
          id: room.id,
          name: room.name || 'Unnamed Room',
          capacity: room.capacity || 1,
          bookingType: room.booking_type || 'whole',
          pricing: room.pricing || { standard: 0, offSeason: 0, camp: {} },
          description: room.description || '',
          images: room.images || [],
          amenities: room.amenities || [],
          isActive: room.is_active !== false,
          createdAt: new Date(room.created_at || Date.now()),
          updatedAt: new Date(room.updated_at || Date.now())
        })) as Room[];
        setRooms(formattedRooms || []);
      }

      // Process surf camps
      if (surfCampsResult.error) {
        console.error('Failed to load surf camps:', surfCampsResult.error);
        toast.error('Failed to load surf camps');
      } else {
        // Convert database format to SurfCamp format
        const formattedSurfCamps = surfCampsResult.data?.map((camp: any) => ({
          id: camp.id,
          category: camp.category || 'HH',
          startDate: new Date(camp.start_date),
          endDate: new Date(camp.end_date),
          availableRooms: camp.available_rooms || [],
          occupancy: camp.occupancy || 1,
          createdAt: new Date(camp.created_at || Date.now()),
          updatedAt: new Date(camp.updated_at || Date.now())
        })) as SurfCamp[];
        setSurfCamps(formattedSurfCamps || []);
      }

      // Process add-ons
      if (addOnsResult.error) {
        console.error('Failed to load add-ons:', addOnsResult.error);
        toast.error('Failed to load add-ons');
      } else {
        // Convert database format to AddOn format
        const formattedAddOns = addOnsResult.data?.map((addon: any) => ({
          id: addon.id,
          name: addon.name || 'Unnamed Add-on',
          description: addon.description || '',
          price: addon.price || 0,
          category: addon.category || 'other',
          images: addon.images || [],
          isActive: addon.is_active !== false,
          maxQuantity: addon.max_quantity,
          createdAt: new Date(addon.created_at || Date.now()),
          updatedAt: new Date(addon.updated_at || Date.now())
        })) as AddOn[];
        setAddOns(formattedAddOns || []);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load booking data');
    } finally {
      setLoadingData(false);
    }
  };

  // Calculate total amount with enhanced pricing
  const calculateTotal = (items: BookingItem[]) => {
    return calculateTotalAmount(items);
  };

  // Calculate price breakdown for display
  const getPriceBreakdown = () => {
    return calculatePriceBreakdown(selectedItems, 0.1, 0.05, 0); // 10% tax, 5% service fee
  };

  // Add item to booking
  const addItem = (type: 'room' | 'surfCamp' | 'addOn', itemId: string) => {
    let item: BookingItem | null = null;

    if (type === 'room') {
      const room = rooms.find(r => r.id === itemId);
      if (room) {
        const pricing = calculateRoomPrice(room, undefined, undefined, 1);
        item = {
          id: `${type}_${itemId}_${Date.now()}`,
          type,
          itemId,
          name: room.name,
          quantity: 1,
          unitPrice: pricing.unitPrice,
          totalPrice: pricing.totalPrice,
          nights: pricing.nights,
        };
      }
    } else if (type === 'surfCamp') {
      const camp = surfCamps.find(c => c.id === itemId);
      if (camp) {
        const pricing = calculateSurfCampPrice(camp, 1);
        item = {
          id: `${type}_${itemId}_${Date.now()}`,
          type,
          itemId,
          name: camp.name,
          quantity: 1,
          unitPrice: pricing.unitPrice,
          totalPrice: pricing.totalPrice,
          participants: 1,
        };
      }
    } else if (type === 'addOn') {
      const addOn = addOns.find(a => a.id === itemId);
      if (addOn) {
        const pricing = calculateAddOnPrice(addOn, 1);
        item = {
          id: `${type}_${itemId}_${Date.now()}`,
          type,
          itemId,
          name: addOn.name,
          quantity: 1,
          unitPrice: pricing.unitPrice,
          totalPrice: pricing.totalPrice,
        };
      }
    }

    if (item) {
      const newItems = [...selectedItems, item];
      setSelectedItems(newItems);
      form.setValue('items', newItems);
      form.setValue('totalAmount', calculateTotal(newItems));
    }
  };

  // Remove item from booking
  const removeItem = (itemId: string) => {
    const newItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(newItems);
    form.setValue('items', newItems);
    form.setValue('totalAmount', calculateTotal(newItems));
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    const newItems = selectedItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          totalPrice: item.unitPrice * quantity,
        };
      }
      return item;
    });
    
    setSelectedItems(newItems);
    form.setValue('items', newItems);
    form.setValue('totalAmount', calculateTotal(newItems));
  };

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const onSubmit = async (data: CreateBookingForm) => {
    try {
      setLoading(true);

      // Client-side validation
      if (data.clientIds.length === 0) {
        toast.error('Please select at least one client');
        return;
      }

      if (selectedItems.length === 0) {
        toast.error('Please add at least one item to the booking');
        return;
      }

      const priceBreakdown = getPriceBreakdown();
      if (priceBreakdown.total <= 0) {
        toast.error('Booking total must be greater than zero');
        return;
      }

      // Update the form data with the calculated total
      data.totalAmount = priceBreakdown.total;

      // Convert form data to database format
      const bookingData = {
        client_ids: data.clientIds,
        items: data.items.map(item => ({
          type: item.type,
          item_id: item.itemId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          dates: item.dates ? {
            check_in: item.dates.checkIn,
            check_out: item.dates.checkOut
          } : null
        })),
        total_amount: data.totalAmount,
        payment_status: data.paymentStatus || 'pending',
        payment_method: data.paymentMethod || null,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert booking into Supabase
      const { data: result, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);

        // Handle specific error types
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          toast.error('You do not have permission to create bookings.');
        } else if (error.message.includes('violates check constraint')) {
          toast.error('Invalid booking data. Please check your inputs.');
        } else {
          toast.error(`Failed to create booking: ${error.message}`);
        }

        throw error;
      }

      toast.success('Booking created successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });

      onSuccess();
      onClose();

      // Reset form
      form.reset();
      setSelectedItems([]);
      setClientSearch('');
    } catch (error: any) {
      console.error('Error creating booking:', error);

      // Only show generic error if we haven't already shown a specific one
      if (!error.message?.includes('permission') &&
          !error.message?.includes('Invalid') &&
          !error.message?.includes('Failed to create booking')) {
        toast.error('Failed to create booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedItems([]);
    setClientSearch('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Create a new booking for clients with rooms, surf camps, and add-ons.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading booking data...</span>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="clients">Select Clients *</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search clients..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        const currentIds = form.getValues('clientIds');
                        if (!currentIds.includes(client.id)) {
                          form.setValue('clientIds', [...currentIds, client.id]);
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.watch('clientIds').includes(client.id)}
                        onChange={(e) => {
                          const currentIds = form.getValues('clientIds');
                          if (e.target.checked) {
                            form.setValue('clientIds', [...currentIds, client.id]);
                          } else {
                            form.setValue('clientIds', currentIds.filter(id => id !== client.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {form.formState.errors.clientIds && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {form.formState.errors.clientIds.message}
                  </p>
                )}
                {form.watch('clientIds').length > 0 && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    {form.watch('clientIds').length} client{form.watch('clientIds').length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>

            {/* Selected Items */}
            <div className="space-y-4">
              <Label>Selected Items</Label>
              {selectedItems.length > 0 ? (
                <div className="space-y-2">
                  {selectedItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500 capitalize">{item.type}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <div className="w-20 text-right font-medium">
                              ${item.totalPrice.toFixed(2)}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(getPriceBreakdown().subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Taxes (10%):</span>
                          <span>{formatCurrency(getPriceBreakdown().taxes)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Service Fee (5%):</span>
                          <span>{formatCurrency(getPriceBreakdown().fees)}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(getPriceBreakdown().total)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-gray-500 mb-2">No items selected</div>
                  <div className="text-sm text-gray-400">Add rooms, surf camps, or add-ons below to create a booking</div>
                  {form.formState.isSubmitted && selectedItems.length === 0 && (
                    <p className="text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
                      <span className="text-red-500">⚠</span>
                      At least one item is required
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Add Items Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rooms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Rooms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rooms.filter(room => room.isActive).map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{room.name}</div>
                        <div className="text-xs text-gray-500">
                          ${room.pricing.basePrice}/night • {room.capacity} guests
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addItem('room', room.id)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Surf Camps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Surf Camps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {surfCamps.filter(camp => camp.isActive).map((camp) => (
                    <div key={camp.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{camp.name}</div>
                        <div className="text-xs text-gray-500">
                          ${camp.price} • {camp.level}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addItem('surfCamp', camp.id)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Add-ons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Add-ons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {addOns.filter(addOn => addOn.isActive).map((addOn) => (
                    <div key={addOn.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{addOn.name}</div>
                        <div className="text-xs text-gray-500">
                          ${addOn.price} • {addOn.category}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addItem('addOn', addOn.id)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status *</Label>
                <Select
                  value={form.watch('paymentStatus')}
                  onValueChange={(value: 'pending' | 'confirmed' | 'cancelled') =>
                    form.setValue('paymentStatus', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentStatus && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {form.formState.errors.paymentStatus.message}
                  </p>
                )}
                {form.watch('paymentStatus') && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    Payment status set to {form.watch('paymentStatus')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={form.watch('paymentMethod') || ''}
                  onValueChange={(value: 'stripe' | 'cash' | 'transfer' | 'other') =>
                    form.setValue('paymentMethod', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                {...form.register('notes')}
                placeholder="Add any additional notes for this booking..."
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || selectedItems.length === 0 || form.watch('clientIds').length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Booking'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
