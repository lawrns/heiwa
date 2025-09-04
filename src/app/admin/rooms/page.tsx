'use client'

import React, { useState, useMemo, useEffect } from 'react';

// Disable prerendering for this page since it uses Firebase
export const dynamic = 'force-dynamic';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getDb, getAuth, getStorage } from '@/lib/firebase';
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
import { COLLECTIONS, CreateRoomSchema, Room } from '@/lib/schemas';

type RoomFormData = z.infer<typeof CreateRoomSchema>;
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, Bed, Users, Wifi, Eye, Coffee } from 'lucide-react';

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
  const [selectedRoom, setSelectedRoom] = useState<(Room & { id: string }) | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [roomImages, setRoomImages] = useState<{ [key: string]: string[] }>({});
  const db = getDb();
  const auth = getAuth();
  const storage = getStorage();

  // Fetch rooms
  const [roomsSnapshot, loadingRooms, errorRooms] = useCollection(
    db ? collection(db, COLLECTIONS.ROOMS) : null
  );

  const rooms = useMemo(() => {
    if (!roomsSnapshot) return [];
    return roomsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (Room & { id: string })[];
  }, [roomsSnapshot]);

  // Handle Firestore errors and permissions
  useEffect(() => {
    if (errorRooms) {
      const errorMessage = errorRooms.message || 'Failed to load rooms';
      if (errorMessage.includes('Missing or insufficient permissions')) {
        toast.error('Access denied: Insufficient permissions to view rooms');
        console.warn('Permissions error:', errorRooms);
      } else {
        toast.error(`Failed to load rooms: ${errorMessage}`);
      }
    }
  }, [errorRooms]);

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

  // Image upload handler
  const uploadImage = async (file: File): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      throw new Error('File must be JPG or PNG format');
    }

    if (!storage) {
      throw new Error('Storage not available');
    }

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `rooms/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      const currentImages = form.getValues('images') || [];
      form.setValue('images', [...currentImages, imageUrl]);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    }
  };

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

      if (!db) {
        toast.error('Database not available');
        return;
      }

      await addDoc(collection(db, COLLECTIONS.ROOMS), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      toast.success('Room created successfully');
      setShowCreateModal(false);
      form.reset();
    } catch (error: any) {
      toast.error(`Failed to create room: ${error.message}`);
    }
  };

  const handleUpdateRoom = async (roomId: string, data: Partial<RoomFormData>) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.ROOMS, roomId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      toast.success('Room updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update room: ${error.message}`);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.ROOMS, roomId));
      toast.success('Room deleted successfully');
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
        Failed to load rooms: {errorRooms.message}
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
                <div className="space-y-4">
                  <div>
                    <FormLabel>Room Images</FormLabel>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            {uploadingImage ? 'Uploading...' : 'Click to upload images (JPG/PNG, max 5MB)'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {form.watch('images') && form.watch('images').length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {form.watch('images').map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Room image ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentImages = form.getValues('images');
                              form.setValue('images', currentImages.filter((_, i) => i !== index));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                            {room.capacity}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Type:</span>
                          <Badge variant="outline">
                            {room.bookingType === 'whole' ? 'Whole Room' : 'Per Bed'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Standard Price:</span>
                          <span className="font-medium text-green-600">
                            ${room.pricing.standard.toFixed(2)}
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
              <div className="space-y-4">
                <div>
                  <FormLabel>Room Images</FormLabel>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload-edit"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="image-upload-edit"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {uploadingImage ? 'Uploading...' : 'Click to upload images (JPG/PNG, max 5MB)'}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Image Preview */}
                {form.watch('images') && form.watch('images').length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {form.watch('images').map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Room image ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const currentImages = form.getValues('images');
                            form.setValue('images', currentImages.filter((_, i) => i !== index));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
