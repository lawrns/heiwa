'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react';

// Disable prerendering for this page since it uses Supabase
export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CreateRoomSchema, Room } from '@/lib/schemas';

type RoomFormData = z.infer<typeof CreateRoomSchema>;
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, Bed, Users, Wifi, Eye, Coffee } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';

// Demo data for rooms
const DEMO_ROOMS: (Room & { id: string })[] = [
  {
    id: 'demo-room-1',
    name: 'Ocean View Suite',
    capacity: 4,
    bookingType: 'whole',
    pricing: {
      standard: 299,
      offSeason: 249,
      camp: { 1: 199, 2: 179, 3: 169, 4: 159 },
    },
    description: 'Beautiful ocean view suite with private balcony',
    images: [],
    amenities: ['private-bathroom', 'sea-view', 'balcony'],
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-room-2',
    name: 'Garden Bungalow',
    capacity: 2,
    bookingType: 'whole',
    pricing: {
      standard: 199,
      offSeason: 159,
      camp: { 1: 149, 2: 139 },
    },
    description: 'Cozy bungalow surrounded by tropical gardens',
    images: [],
    amenities: ['private-bathroom', 'kitchen'],
    isActive: true,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-room-3',
    name: 'Beachfront Dorm',
    capacity: 8,
    bookingType: 'perBed',
    pricing: {
      standard: 45,
      offSeason: 35,
      camp: { perBed: 32.5 },
    },
    description: 'Shared beachfront accommodation with bunk beds',
    images: [],
    amenities: ['wifi', 'air-conditioning'],
    isActive: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-room-4',
    name: 'Premium Villa',
    capacity: 6,
    bookingType: 'whole',
    pricing: {
      standard: 499,
      offSeason: 399,
      camp: { 1: 349, 2: 329, 3: 309, 4: 289, 5: 269, 6: 249 },
    },
    description: 'Luxury villa with ocean views and private pool',
    images: [],
    amenities: ['private-bathroom', 'sea-view', 'balcony', 'wifi', 'kitchen', 'air-conditioning'],
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-room-5',
    name: 'Standard Room',
    capacity: 2,
    bookingType: 'whole',
    pricing: {
      standard: 149,
      offSeason: 119,
      camp: { 1: 99, 2: 89 },
    },
    description: 'Comfortable standard room with garden views',
    images: [],
    amenities: ['private-bathroom', 'wifi'],
    isActive: true,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-room-6',
    name: 'Deluxe Suite',
    capacity: 4,
    bookingType: 'whole',
    pricing: {
      standard: 399,
      offSeason: 319,
      camp: { 1: 279, 2: 269, 3: 259, 4: 249 },
    },
    description: 'Spacious deluxe suite with premium amenities',
    images: [],
    amenities: ['private-bathroom', 'sea-view', 'balcony', 'wifi', 'kitchen', 'air-conditioning'],
    isActive: false, // Demo inactive room
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
];

// Slider settings for image previews
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  adaptiveHeight: true,
  arrows: true,
};

// Form schema for room creation/editing
// RoomFormData is now defined above from CreateRoomSchema

// Available amenities
const AVAILABLE_AMENITIES = [
  { id: 'private-bathroom', label: 'Private Bathroom', icon: Bed },
  { id: 'sea-view', label: 'Sea View', icon: Eye },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'kitchen', label: 'Kitchen', icon: Coffee },
  { id: 'balcony', label: 'Balcony', icon: Eye },
  { id: 'air-conditioning', label: 'Air Conditioning', icon: Coffee },
];

export default function RoomsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [errorRooms, setErrorRooms] = useState<string | null>(null);

  // Fetch rooms from Supabase
  const fetchRooms = useCallback(async () => {
    try {
      setLoadingRooms(true);
      setErrorRooms(null);

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rooms:', error);
        setErrorRooms(error.message);
        // Fall back to demo data if there's a permissions error
        if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          toast.error('Access denied: Using demo data. Please check your admin permissions.');
          setRooms(DEMO_ROOMS);
        } else {
          toast.error(`Failed to load rooms: ${error.message}`);
        }
        return;
      }

      if (data && data.length > 0) {
        // Convert snake_case to camelCase for compatibility
        const formattedRooms = data.map(room => {
          // Normalize pricing structure to handle different formats
          let normalizedPricing = { standard: 0, offSeason: 0, camp: {} };

          if (room.pricing) {
            // Handle different pricing formats that might exist in the database
            if (typeof room.pricing === 'object') {
              normalizedPricing = {
                standard: room.pricing.standard || room.pricing.basePrice || room.pricing.base_price || 0,
                offSeason: room.pricing.offSeason || room.pricing.off_season || room.pricing.lowSeason || 0,
                camp: room.pricing.camp || {}
              };
            }
          }

          return {
            id: room.id,
            name: room.name || 'Unnamed Room',
            capacity: room.capacity || 1,
            bookingType: room.booking_type || 'whole',
            pricing: normalizedPricing,
            description: room.description || '',
            images: room.images || [],
            amenities: room.amenities || [],
            isActive: room.is_active !== false, // Default to true if undefined
            createdAt: new Date(room.created_at || Date.now()),
            updatedAt: new Date(room.updated_at || Date.now())
          };
        });
        setRooms(formattedRooms);
      } else {
        // No data, use demo data
        setRooms(DEMO_ROOMS);
      }
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      setErrorRooms(error.message || 'Failed to load rooms');
      toast.error(`Failed to load rooms: ${error.message}`);
      // Fall back to demo data
      setRooms(DEMO_ROOMS);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();

    // Set up real-time subscription for rooms
    const roomsSubscription = supabase
      .channel('rooms_changes_admin')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        (payload) => {
          console.log('Rooms change detected in admin:', payload);
          fetchRooms(); // Refresh data when changes occur
        }
      )
      .subscribe();

    return () => {
      roomsSubscription.unsubscribe();
    };
  }, [fetchRooms]);

  // Form for creating/editing rooms
  const form = useForm<RoomFormData>({
    resolver: zodResolver(CreateRoomSchema),
    defaultValues: {
      name: '',
      capacity: 1,
      bookingType: 'whole',
      pricing: {
        standard: 0,
        offSeason: 0,
        camp: {},
      },
      description: '',
      images: [],
      amenities: [],
      isActive: true,
    },
  });


  const handleCreateRoom = async (data: RoomFormData) => {
    try {
      // Check for duplicate room names
      const existingRoom = rooms.find(room =>
        room.name.toLowerCase() === data.name.toLowerCase()
      );

      if (existingRoom) {
        toast.error(`A room with the name "${data.name}" already exists`);
        return;
      }

      // Convert camelCase to snake_case for Supabase
      const roomData = {
        name: data.name,
        capacity: data.capacity,
        booking_type: data.bookingType,
        pricing: data.pricing,
        description: data.description,
        images: data.images || [],
        amenities: data.amenities || [],
        is_active: data.isActive
      };

      const { error } = await supabase
        .from('rooms')
        .insert([roomData]);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Room created successfully');
      setShowCreateModal(false);
      form.reset();
      // Refresh the rooms list
      fetchRooms();
    } catch (error: any) {
      toast.error(`Failed to create room: ${error.message}`);
    }
  };

  const handleUpdateRoom = async (roomId: string, data: Partial<RoomFormData>) => {
    try {
      // Convert camelCase to snake_case for Supabase
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.capacity !== undefined) updateData.capacity = data.capacity;
      if (data.bookingType !== undefined) updateData.booking_type = data.bookingType;
      if (data.pricing !== undefined) updateData.pricing = data.pricing;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.images !== undefined) updateData.images = data.images;
      if (data.amenities !== undefined) updateData.amenities = data.amenities;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const { error } = await supabase
        .from('rooms')
        .update(updateData)
        .eq('id', roomId);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Room updated successfully');
      fetchRooms(); // Refresh the list
    } catch (error: any) {
      toast.error(`Failed to update room: ${error.message}`);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Room deleted successfully');
      fetchRooms(); // Refresh the list
    } catch (error: any) {
      toast.error(`Failed to delete room: ${error.message}`);
    }
  };

  const openEditModal = (room: Room & { id: string }) => {
    setSelectedRoom(room);
    form.reset({
      name: room.name,
      capacity: room.capacity,
      bookingType: room.bookingType,
      pricing: room.pricing,
      description: room.description || '',
      images: room.images || [],
      amenities: room.amenities || [],
      isActive: room.isActive,
    });
    setShowEditModal(true);
  };

  const getAmenityIcon = (amenityId: string) => {
    const amenity = AVAILABLE_AMENITIES.find(a => a.id === amenityId);
    return amenity?.icon || Users;
  };

  if (loadingRooms) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading rooms...</div>
      </div>
    );
  }

  if (errorRooms) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Failed to load rooms: {errorRooms}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600">Manage room inventory, pricing, and availability</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
              <DialogDescription>
                Add a new room to your inventory with pricing and amenities.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateRoom)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Ocean View Suite" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            min={1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bookingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select booking type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="whole">Whole Room</SelectItem>
                            <SelectItem value="perBed">Per Bed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Pricing Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pricing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pricing.standard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Standard Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              min={0}
                              step={0.01}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricing.offSeason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Off-Season Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              min={0}
                              step={0.01}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the room features..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload Section */}
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Images</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || []}
                          onChange={(urls) => field.onChange(urls)}
                          storagePath={`rooms/${Date.now()}`}
                          maxFiles={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenities</FormLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {AVAILABLE_AMENITIES.map((amenity) => (
                          <div key={amenity.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={amenity.id}
                              checked={field.value?.includes(amenity.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...(field.value || []), amenity.id]);
                                } else {
                                  field.onChange(field.value?.filter(id => id !== amenity.id));
                                }
                              }}
                            />
                            <label htmlFor={amenity.id} className="text-sm flex items-center space-x-2">
                              <amenity.icon className="w-4 h-4" />
                              <span>{amenity.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Room</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {rooms.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No rooms found. Create your first room to get started.
            </div>
          ) : (
            rooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={room.isActive ? 'default' : 'secondary'}>
                        {room.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(room);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
        </CardHeader>
        <CardContent>
                    <div className="space-y-4">
                      {/* Image Preview */}
                      {room.images && room.images.length > 0 ? (
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <Slider {...sliderSettings}>
                            {room.images.map((imageUrl, index) => (
                              <div key={index} className="aspect-video">
                                <img
                                  src={imageUrl}
                                  alt={`${room.name} - Image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </Slider>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {room.capacity || 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Type:</span>
                          <Badge variant="outline">
                            {(room.bookingType || 'whole') === 'whole' ? 'Whole Room' : 'Per Bed'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Standard Price:</span>
                          <span className="font-medium text-green-600">
                            ${room.pricing?.standard ? room.pricing.standard.toFixed(2) : '0.00'}
                          </span>
                        </div>

                        {room.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {room.description}
                          </p>
                        )}

                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.slice(0, 3).map((amenityId) => {
                              const IconComponent = getAmenityIcon(amenityId);
                              return (
                                <Badge key={amenityId} variant="secondary" className="text-xs">
                                  <IconComponent className="w-3 h-3 mr-1" />
                                  {AVAILABLE_AMENITIES.find(a => a.id === amenityId)?.label}
                                </Badge>
                              );
                            })}
                            {room.amenities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{room.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
          </div>
        </CardContent>
      </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update room information, pricing, and amenities.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => {
              if (selectedRoom) {
                handleUpdateRoom(selectedRoom.id, data);
                setShowEditModal(false);
              }
            })} className="space-y-6">
              {/* Same form fields as create modal */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Ocean View Suite" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          min={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bookingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select booking type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="whole">Whole Room</SelectItem>
                          <SelectItem value="perBed">Per Bed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pricing.standard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Standard Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            min={0}
                            step={0.01}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricing.offSeason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Off-Season Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            min={0}
                            step={0.01}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the room features..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload Section */}
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Images</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || []}
                        onChange={(urls) => field.onChange(urls)}
                        storagePath={`rooms/${selectedRoom?.id || Date.now()}`}
                        maxFiles={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {AVAILABLE_AMENITIES.map((amenity) => (
                        <div key={amenity.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity.id}
                            checked={field.value?.includes(amenity.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), amenity.id]);
                              } else {
                                field.onChange(field.value?.filter(id => id !== amenity.id));
                              }
                            }}
                          />
                          <label htmlFor={amenity.id} className="text-sm flex items-center space-x-2">
                            <amenity.icon className="w-4 h-4" />
                            <span>{amenity.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Room</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
