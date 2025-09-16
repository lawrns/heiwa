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
import { CreateRoomSchema, UpdateRoomSchema, Room } from '@/lib/schemas';

type RoomFormData = Omit<z.infer<typeof CreateRoomSchema>, 'bedTypes'> & { bedTypes?: ('single' | 'double' | 'bunk')[] };
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, Bed, Users, Wifi, Eye, Coffee, Bath, TreePine, Grid3x3, Maximize, Wind, Home, ChefHat } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';


// Fallback demo rooms (empty by default to avoid type errors)
const DEMO_ROOMS: any[] = [];

const BED_TYPE_OPTIONS = ['single', 'double', 'bunk'] as const;

// Amenity icon mapping for better UX
const AMENITY_ICONS = {
  'private-bathroom': { icon: 'Bath', label: 'Private Bathroom' },
  'shared-bathroom': { icon: 'Users', label: 'Shared Bathroom' },
  'wooden-furniture': { icon: 'TreePine', label: 'Wooden Furniture' },
  'traditional-tiles': { icon: 'Grid3x3', label: 'Traditional Tiles' },
  'queen-bed': { icon: 'Bed', label: 'Queen Bed' },
  'twin-beds': { icon: 'Bed', label: 'Twin Beds' },
  'bunk-beds': { icon: 'Bed', label: 'Bunk Beds' },
  'spacious': { icon: 'Maximize', label: 'Spacious' },
  'community': { icon: 'Users', label: 'Community Space' },
  'wifi': { icon: 'Wifi', label: 'WiFi' },
  'air-conditioning': { icon: 'Wind', label: 'Air Conditioning' },
  'sea-view': { icon: 'Eye', label: 'Sea View' },
  'balcony': { icon: 'Home', label: 'Balcony' },
  'kitchen': { icon: 'ChefHat', label: 'Kitchen' }
};

// Helper function to render amenity icons
const renderAmenityIcon = (amenity: string) => {
  const amenityConfig = AMENITY_ICONS[amenity as keyof typeof AMENITY_ICONS];
  if (!amenityConfig) return null;

  const iconMap = {
    Bath, TreePine, Grid3x3, Bed, Users, Maximize, Wind, Wifi, Eye, Home, ChefHat
  };

  const IconComponent = iconMap[amenityConfig.icon as keyof typeof iconMap];

  if (!IconComponent) return null;

  return (
    <div key={amenity} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
      <IconComponent className="w-3 h-3" />
      <span>{amenityConfig.label}</span>
    </div>
  );
};

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

// Available amenities for Heiwa House rooms
const AVAILABLE_AMENITIES = [
  { id: 'private-bathroom', label: 'Private Bathroom', icon: Bath },
  { id: 'shared-bathroom', label: 'Shared Bathroom', icon: Users },
  { id: 'wooden-furniture', label: 'Wooden Furniture', icon: TreePine },
  { id: 'traditional-tiles', label: 'Traditional Tiles', icon: Grid3x3 },
  { id: 'queen-bed', label: 'Queen Bed', icon: Bed },
  { id: 'twin-beds', label: 'Twin Beds', icon: Bed },
  { id: 'bunk-beds', label: 'Bunk Beds', icon: Bed },
  { id: 'spacious', label: 'Spacious', icon: Maximize },
  { id: 'community', label: 'Community Space', icon: Users },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'air-conditioning', label: 'Air Conditioning', icon: Wind },
  { id: 'sea-view', label: 'Sea View', icon: Eye },
  { id: 'balcony', label: 'Balcony', icon: Home },
  { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
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
            bedTypes: room.bed_types || [],
            isActive: room.is_active !== false, // Default to true if undefined
            createdAt: new Date(room.created_at || Date.now()),
            updatedAt: new Date(room.updated_at || Date.now())
          };
        });
        setRooms(formattedRooms);
      } else {
        // No data from Supabase
        setRooms([]);
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

  // Form for creating rooms
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
      bedTypes: [],
      isActive: true,
    },
  });

  // Form for editing rooms (without validation resolver)
  const editForm = useForm<Partial<RoomFormData>>({
    defaultValues: {},
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
        bed_types: data.bedTypes || [],
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
      console.log('Updating room:', roomId, data);

      // Convert camelCase to snake_case for Supabase
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.capacity !== undefined) updateData.capacity = data.capacity;
      if (data.bookingType !== undefined) updateData.booking_type = data.bookingType;
      if (data.pricing !== undefined) updateData.pricing = data.pricing;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.images !== undefined) updateData.images = data.images;
      if (data.amenities !== undefined) updateData.amenities = data.amenities;
      if (data.bedTypes !== undefined) updateData.bed_types = data.bedTypes;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      console.log('Update data:', updateData);

      const { error } = await supabase
        .from('rooms')
        .update(updateData)
        .eq('id', roomId);

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(error.message);
      }

      console.log('Room updated successfully');
      toast.success('Room updated successfully');
      await fetchRooms(); // Refresh the list
    } catch (error: any) {
      console.error('Update room error:', error);
      toast.error(`Failed to update room: ${error.message}`);
      throw error; // Re-throw to prevent modal from closing on error
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
    editForm.reset({
      name: room.name,
      capacity: room.capacity,
      bookingType: room.bookingType,
      pricing: room.pricing,
      description: room.description || '',
      images: room.images || [],
      amenities: room.amenities || [],
      bedTypes: room.bedTypes || [],
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
                          storagePath={`${Date.now()}`}
                          bucketName="rooms"
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

                {/* Bed Types */}
                <FormField
                  control={form.control}
                  name="bedTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bed Types</FormLabel>
                      <div className="flex flex-wrap gap-3">
                        {BED_TYPE_OPTIONS.map((bt) => (
                          <div key={bt} className="flex items-center space-x-2">
                            <Checkbox
                              id={`bt-${bt}`}
                              checked={field.value?.includes(bt)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...(field.value || []), bt]);
                                } else {
                                  field.onChange((field.value || []).filter((v: string) => v !== bt));
                                }
                              }}
                            />
                            <label htmlFor={`bt-${bt}`} className="text-sm capitalize">{bt}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            {room.images.map((imageUrl: string, index: number) => (
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


                        {room.bedTypes && room.bedTypes.length > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Bed Types:</span>
                            <span className="font-medium">
                              {room.bedTypes.map((bt: string) => bt.charAt(0).toUpperCase() + bt.slice(1)).join(', ')}
                            </span>
                          </div>
                        )}

                        {room.description && (


                          <p className="text-sm text-gray-600 line-clamp-2">


                            {room.description}
                          </p>
                        )}

                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.slice(0, 3).map((amenityId: string) => {
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
          <Form {...editForm}>
            <form onSubmit={async (e) => {
              e.preventDefault();

              // Get form data manually
              const formData = editForm.getValues();
              console.log('Form submission handler called with raw data:', formData);

              // Transform the form data to match the schema structure
              const transformedData: any = {
                ...formData,
                // Transform pricing from nested fields to object structure
                pricing: {
                  standard: formData['pricing.standard'] || formData.pricing?.standard || 0,
                  offSeason: formData['pricing.offSeason'] || formData.pricing?.offSeason || 0,
                  camp: formData.pricing?.camp || {}
                }
              };

              // Remove the nested pricing fields
              delete transformedData['pricing.standard'];
              delete transformedData['pricing.offSeason'];

              console.log('Transformed data for update:', transformedData);

              if (selectedRoom) {
                console.log('Selected room:', selectedRoom);
                try {
                  await handleUpdateRoom(selectedRoom.id, transformedData);
                  setShowEditModal(false);
                } catch (error) {
                  // Error is already handled in handleUpdateRoom, just prevent modal from closing
                  console.error('Form submission error:', error);
                }
              } else {
                console.log('No selected room');
              }
            }} className="space-y-6">
              {/* Same form fields as create modal */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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
                    control={editForm.control}
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
                    control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Images</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || []}
                        onChange={(urls) => field.onChange(urls)}
                        storagePath={`${selectedRoom?.id || Date.now()}`}
                        bucketName="rooms"
                        maxFiles={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bed Types */}
              <FormField
                control={editForm.control}
                name="bedTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bed Types</FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {BED_TYPE_OPTIONS.map((bt) => (
                        <div key={bt} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-bt-${bt}`}
                            checked={field.value?.includes(bt)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), bt]);
                              } else {
                                field.onChange((field.value || []).filter((v: string) => v !== bt));
                              }
                            }}
                          />
                          <label htmlFor={`edit-bt-${bt}`} className="text-sm capitalize">{bt}</label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={editForm.control}
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
