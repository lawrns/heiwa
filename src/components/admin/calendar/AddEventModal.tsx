'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Plus, Users, MapPin, Star } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import { type Client, type Room, type SurfCamp, type AddOn } from '@/lib/schemas';

// Event type enum
export type EventType = 'surfCamp' | 'booking' | 'custom';

// Base event form schema
const BaseEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
});

// Surf camp event schema
const SurfCampEventSchema = BaseEventSchema.extend({
  category: z.enum(['FR', 'HH']),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  location: z.string().optional(),
  availableRooms: z.array(z.string()).min(1, 'At least one room is required'),
});

// Room booking event schema
const RoomBookingEventSchema = BaseEventSchema.extend({
  roomIds: z.array(z.string()).min(1, 'At least one room is required'),
  clientIds: z.array(z.string()).min(1, 'At least one client is required'),
  guestCount: z.number().min(1, 'Guest count must be at least 1'),
});

// Custom event schema
const CustomEventSchema = BaseEventSchema.extend({
  color: z.string().default('#6b7280'),
  isAllDay: z.boolean().default(false),
});

// Combined form schema
const EventFormSchema = z.discriminatedUnion('eventType', [
  z.object({ eventType: z.literal('surfCamp') }).merge(SurfCampEventSchema),
  z.object({ eventType: z.literal('booking') }).merge(RoomBookingEventSchema),
  z.object({ eventType: z.literal('custom') }).merge(CustomEventSchema),
]);

type EventFormData = z.infer<typeof EventFormSchema>;

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: Date;
}

export function AddEventModal({ isOpen, onClose, onSuccess, selectedDate }: AddEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState<EventType>('custom');
  const [clients, setClients] = useState<(Client & { id: string })[]>([]);
  const [rooms, setRooms] = useState<(Room & { id: string })[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      eventType: 'custom',
      title: '',
      description: '',
      startDate: selectedDate || new Date(),
      endDate: selectedDate || new Date(),
      color: '#6b7280',
      isAllDay: false,
    },
  });

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      // Reset form with selected date if provided
      if (selectedDate) {
        form.setValue('startDate', selectedDate);
        form.setValue('endDate', selectedDate);
      }
    }
  }, [isOpen, selectedDate, form]);

  // Update form schema when event type changes
  useEffect(() => {
    form.setValue('eventType', eventType);
    // Reset type-specific fields when changing event type
    if (eventType === 'surfCamp') {
      form.setValue('category', 'HH');
      form.setValue('capacity', 10);
      form.setValue('availableRooms', []);
    } else if (eventType === 'booking') {
      form.setValue('roomIds', []);
      form.setValue('clientIds', []);
      form.setValue('guestCount', 1);
    } else if (eventType === 'custom') {
      form.setValue('color', '#6b7280');
      form.setValue('isAllDay', false);
    }
  }, [eventType, form]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);

      // Load clients and rooms from Supabase in parallel
      const [clientsResult, roomsResult] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('rooms').select('*').order('created_at', { ascending: false })
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
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true);

      // Validate date range
      if (data.endDate < data.startDate) {
        toast.error('End date must be after start date');
        return;
      }

      let response;
      let endpoint;

      // Route to appropriate API based on event type
      if (data.eventType === 'surfCamp') {
        endpoint = '/api/firebase-surfcamps';
        const surfCampData = {
          category: data.category,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          availableRooms: data.availableRooms,
          occupancy: data.capacity,
        };
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(surfCampData),
        });
      } else if (data.eventType === 'booking') {
        endpoint = '/api/firebase-bookings';
        // This would need to be implemented with proper booking structure
        toast.error('Booking creation from calendar not yet implemented');
        return;
      } else {
        endpoint = '/api/calendar-events';
        const customEventData = {
          title: data.title,
          description: data.description,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          color: data.color,
          isAllDay: data.isAllDay,
        };
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customEventData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();

        // Handle conflict responses specially
        if (response.status === 409) {
          setConflicts(errorData.conflicts || []);
          setWarnings(errorData.warnings || []);
          toast.error(errorData.error || 'Scheduling conflict detected');
          return;
        }

        throw new Error(errorData.error || `Failed to create ${data.eventType} event`);
      }

      const result = await response.json();
      toast.success(`${data.eventType === 'surfCamp' ? 'Surf camp' : data.eventType === 'booking' ? 'Booking' : 'Event'} created successfully!`, {
        position: 'top-right',
        autoClose: 3000,
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setEventType('custom');
    setConflicts([]);
    setWarnings([]);
    onClose();
  };

  // Clear conflicts when form data changes
  useEffect(() => {
    setConflicts([]);
    setWarnings([]);
  }, [eventType, form.watch('startDate'), form.watch('endDate')]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new event on your calendar. Choose the event type and fill in the details.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading form data...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Event Type Selection */}
              <div className="space-y-3">
                <Label>Event Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      eventType === 'custom' ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    )}
                    onClick={() => setEventType('custom')}
                  >
                    <CardContent className="p-4 text-center">
                      <Star className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <div className="font-medium">Custom Event</div>
                      <div className="text-xs text-gray-500">General purpose event</div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      eventType === 'surfCamp' ? "ring-2 ring-orange-500 bg-orange-50" : ""
                    )}
                    onClick={() => setEventType('surfCamp')}
                  >
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                      <div className="font-medium">Surf Camp</div>
                      <div className="text-xs text-gray-500">Multi-day surf program</div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      eventType === 'booking' ? "ring-2 ring-green-500 bg-green-50" : ""
                    )}
                    onClick={() => setEventType('booking')}
                  >
                    <CardContent className="p-4 text-center">
                      <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="font-medium">Room Booking</div>
                      <div className="text-xs text-gray-500">Accommodation booking</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter event description"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < form.getValues('startDate') ||
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Event Type Specific Fields */}
              {eventType === 'surfCamp' && (
                <div className="space-y-4 p-4 bg-orange-50 rounded-lg border">
                  <h3 className="font-medium text-orange-800">Surf Camp Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="HH">Heiwa House</SelectItem>
                              <SelectItem value="FR">Freedom Routes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Enter capacity"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="availableRooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Rooms *</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                          {rooms.map((room) => (
                            <div key={room.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`room-${room.id}`}
                                checked={field.value?.includes(room.id) || false}
                                onChange={(e) => {
                                  const currentRooms = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentRooms, room.id]);
                                  } else {
                                    field.onChange(currentRooms.filter(id => id !== room.id));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <label
                                htmlFor={`room-${room.id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {room.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {eventType === 'booking' && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border">
                  <h3 className="font-medium text-green-800">Booking Details</h3>
                  <div className="text-sm text-green-700 bg-green-100 p-3 rounded">
                    <strong>Note:</strong> Room booking creation from calendar is not yet fully implemented.
                    Please use the Bookings page to create detailed bookings.
                  </div>
                </div>
              )}

              {eventType === 'custom' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                  <h3 className="font-medium text-blue-800">Custom Event Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="color"
                                {...field}
                                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                              />
                            </FormControl>
                            <span className="text-sm text-gray-600">{field.value}</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isAllDay"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>All Day Event</FormLabel>
                            <FormDescription>
                              Event spans the entire day
                            </FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-gray-300"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Conflict and Warning Display */}
              {(conflicts.length > 0 || warnings.length > 0) && (
                <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-800">Scheduling Issues Detected</h3>

                  {conflicts.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Conflicts:</h4>
                      <ul className="space-y-2">
                        {conflicts.map((conflict, index) => (
                          <li key={index} className="text-sm text-red-600 bg-red-100 p-2 rounded">
                            <strong>{conflict.title}</strong> ({conflict.type})
                            <br />
                            {conflict.description}
                            <br />
                            <span className="text-xs">
                              {new Date(conflict.startDate).toLocaleDateString()} - {new Date(conflict.endDate).toLocaleDateString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2">Warnings:</h4>
                      <ul className="space-y-1">
                        {warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-yellow-600 bg-yellow-100 p-2 rounded">
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-sm text-red-600">
                    Please resolve these conflicts before creating the event, or choose different dates/resources.
                  </div>
                </div>
              )}

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
                  disabled={loading || (eventType === 'booking')}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
