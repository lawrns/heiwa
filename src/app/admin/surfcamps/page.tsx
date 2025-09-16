'use client'

import React, { useState, useEffect, useCallback } from 'react';

// Disable prerendering for this page since it uses Firebase
export const dynamic = 'force-dynamic';
// Firebase imports removed - using Supabase
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Room, Client, Booking } from '@/lib/schemas';
import { Plus, Edit, Trash2, Users, MapPin, BarChart3 } from 'lucide-react';

// Database surf camp type (matches the actual database structure)
interface DatabaseSurfCamp {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  includes: string[];
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // New/optional fields
  category?: string;
  food_preferences?: string[];
  allergies_info?: string[];
}

// Admin surf camp type (for the UI)
interface AdminSurfCamp {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  includes: string[];
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields for compatibility
  category?: 'FR' | 'HH';
  availableRooms?: string[];
  occupancy?: number;
  // New/optional fields surfaced in UI (not yet deeply integrated)
  foodPreferences?: string[];
  allergiesInfo?: string[];
}

// Form schema for surf camp creation/editing
const SurfCampFormSchema = z.object({
  category: z.enum(['FR', 'HH']),
  startDate: z.date(),
  endDate: z.date(),
  availableRooms: z.array(z.string()).min(1, 'At least one room is required'),
  occupancy: z.number().min(1, 'Occupancy must be at least 1'),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  maxParticipants: z.number().min(1, 'Max participants must be at least 1').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional(),
  includes: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  // New dietary fields
  foodPreferences: z.array(z.string()).default([]),
  allergiesInfo: z.array(z.string()).default([]),
});

type SurfCampFormData = Omit<z.infer<typeof SurfCampFormSchema>, 'foodPreferences' | 'allergiesInfo'> & { foodPreferences?: string[]; allergiesInfo?: string[] };

// Drag and Drop item types
const ItemTypes = {
  CLIENT: 'client',
  ROOM: 'room',
};

// Drag item component
interface DragItem {
  type: string;
  id: string;
  name: string;
}

interface DraggableClientProps {
  client: Client & { id: string };
  isAssigned: boolean;
}

const DraggableClient: React.FC<DraggableClientProps> = ({ client, isAssigned }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CLIENT,
    item: { type: ItemTypes.CLIENT, id: client.id, name: client.name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className={`p-2 mb-2 border rounded cursor-move transition-colors ${
        isAssigned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">{client.name}</span>
        <span className="text-xs text-gray-500">{client.email}</span>
      </div>
    </div>
  );
};

interface DraggableRoomProps {
  room: Room & { id: string };
  isAssigned: boolean;
}

// Components for drag and drop functionality
const DraggableRoom: React.FC<DraggableRoomProps> = ({ room, isAssigned }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ROOM,
    item: { type: ItemTypes.ROOM, id: room.id, name: room.name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className={`p-2 mb-2 border rounded cursor-move transition-colors ${
        isAssigned ? 'bg-heiwaOrange-50 border-heiwaOrange-200' : 'bg-gray-50 border-gray-200'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex items-center space-x-2">
        <MapPin className="w-4 h-4" />
        <span className="text-sm font-medium">{room.name}</span>
        <span className="text-xs text-gray-500">Capacity: {room.capacity}</span>
      </div>
    </div>
  );
};

// Drop zone component
interface DropZoneProps {
  onDrop: (item: DragItem) => void;
  children: React.ReactNode;
  className?: string;
}

const DropZone: React.FC<DropZoneProps> = ({ onDrop, children, className = '' }) => {
  const [{ isOver }, drop] = useDrop({
    accept: [ItemTypes.CLIENT, ItemTypes.ROOM],
    drop: (item: DragItem) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop as any}
      className={`${className} ${isOver ? 'bg-heiwaOrange-50 border-heiwaOrange-300' : ''}`}
    >
      {children}
    </div>
  );
};

export default function SurfCampsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<AdminSurfCamp | null>(null);
  const [assignedClients, setAssignedClients] = useState<string[]>([]);
  const [assignedRooms, setAssignedRooms] = useState<string[]>([]);
  // Supabase data fetching
  const [surfCamps, setSurfCamps] = useState<AdminSurfCamp[]>([]);
  const [rooms, setRooms] = useState<(Room & { id: string })[]>([]);
  const [clients, setClients] = useState<(Client & { id: string })[]>([]);
  const [bookings] = useState<(Booking & { id: string })[]>([]);
  const [loadingCamps, setLoadingCamps] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [errorCamps, setErrorCamps] = useState<string | null>(null);
  const [errorRooms, setErrorRooms] = useState<string | null>(null);
  const [errorClients, setErrorClients] = useState<string | null>(null);

  // Handle Supabase errors
  useEffect(() => {
    if (errorCamps) {
      toast.error(`Failed to load surf camps: ${errorCamps}`);
      console.warn('Surf camps error:', errorCamps);
    }
  }, [errorCamps]);

  // Supabase data fetching
  const fetchSurfCamps = useCallback(async () => {
      try {
        setLoadingCamps(true);
        const { data, error } = await supabase
          .from('surf_camps')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedCamps = data?.map((item: DatabaseSurfCamp) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          startDate: new Date(item.start_date),
          endDate: new Date(item.end_date),
          maxParticipants: item.max_participants,
          price: item.price,
          level: item.level,
          includes: item.includes || [],
          images: item.images || [],
          isActive: item.is_active,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          // Persisted category (full name) mapped back to code; fallback to legacy name-derived behavior
          category: (
            item.category
              ? (item.category.toLowerCase().startsWith('freedom') ? 'FR' : 'HH')
              : (item.name.toLowerCase().includes('frenchman') ? 'FR' : 'HH')
          ) as 'FR' | 'HH',
          availableRooms: [], // Would need to be fetched separately or stored
          occupancy: item.max_participants, // Use max_participants as occupancy
          // Surface dietary fields if present
          foodPreferences: (item.food_preferences as string[] | undefined) || [],
          allergiesInfo: (item.allergies_info as string[] | undefined) || [],
        })) as AdminSurfCamp[];

        setSurfCamps(formattedCamps || []);
      } catch (error) {
        console.error('Error fetching surf camps:', error);
        setErrorCamps('Failed to load surf camps');
      } finally {
        setLoadingCamps(false);
      }
    }, []);

    const fetchRooms = useCallback(async () => {
      try {
        setLoadingRooms(true);
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedRooms = data?.map(item => ({
          id: item.id,
          name: item.name,
          capacity: item.capacity,
          bookingType: item.booking_type as Room['bookingType'],
          pricing: item.pricing as Room['pricing'],
          amenities: item.amenities || [],
          description: item.description || '',
          images: item.images || [],
          isActive: item.is_active,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at)
        })) as (Room & { id: string })[];

        setRooms(formattedRooms || []);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setErrorRooms('Failed to load rooms');
      } finally {
        setLoadingRooms(false);
      }
    }, []);

    const fetchClients = useCallback(async () => {
      try {
        setLoadingClients(true);
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedClients = data?.map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          lastBookingDate: item.last_booking_date ? new Date(item.last_booking_date) : undefined,
          notes: item.notes || '',
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at)
        })) as (Client & { id: string })[];

        setClients(formattedClients || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setErrorClients('Failed to load clients');
      } finally {
        setLoadingClients(false);
      }
    }, []);

    useEffect(() => {
      fetchSurfCamps();
    fetchRooms();
    fetchClients();

    // Set up real-time subscription for surf camps
    const surfCampsSubscription = supabase
      .channel('surf_camps_changes_admin')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'surf_camps' },
        (payload) => {
          console.log('Surf camps change detected in admin:', payload);
          fetchSurfCamps(); // Refresh data when changes occur
        }
      )
      .subscribe();

    return () => {
      surfCampsSubscription.unsubscribe();
    };
  }, [fetchSurfCamps, fetchRooms, fetchClients]);

  // Use Supabase state directly

  // Use Supabase state directly

  // Use Supabase state directly

  // Use Supabase state directly

  // Calculate occupancy for a surf camp
  const getCampOccupancy = (campId: string) => {
    const campBookings = bookings.filter(booking =>
      booking.items.some((item: { type: string; itemId: string }) =>
        item.type === 'surfCamp' && item.itemId === campId
      )
    );
    return campBookings.reduce((total, booking) => total + booking.clientIds.length, 0);
  };

  // Form for creating surf camps
  const form = useForm<SurfCampFormData>({
    resolver: zodResolver(SurfCampFormSchema),
    defaultValues: {
      category: 'FR',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      availableRooms: [],
      occupancy: 1,
      name: '',
      description: '',
      maxParticipants: 12,
      price: 599,
      level: 'all',
      includes: [],
      images: [],
      isActive: true,
      foodPreferences: [],
      allergiesInfo: [],
    },
  });

  // Form for editing surf camps
  const editForm = useForm<SurfCampFormData>({
    resolver: zodResolver(SurfCampFormSchema),
    defaultValues: {
      category: 'FR',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      availableRooms: [],
      occupancy: 1,
      name: '',
      description: '',
      maxParticipants: 12,
      price: 599,
      level: 'all',
      includes: [],
      images: [],
      isActive: true,
      foodPreferences: [],
      allergiesInfo: [],
    },
  });

  // Auto-set end date when start date changes
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      const endDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
      form.setValue('startDate', date);
      form.setValue('endDate', endDate);
    }
  };

  const handleCreateCamp = async (data: SurfCampFormData) => {
    try {
      // Check for overlapping surf camps of the same category
      const overlappingCamp = surfCamps.find(camp =>
        camp.category === data.category &&
        camp.startDate && camp.endDate &&
        (
          (camp.startDate <= data.endDate && camp.endDate >= data.startDate)
        )
      );

      if (overlappingCamp) {
        toast.error(`Cannot create camp: There is already a ${data.category} camp scheduled during overlapping dates`);
        return;
      }

      // Generate default name if not provided
      const categoryName = data.category === 'FR' ? 'Frenchman\'s' : 'Honolua Bay';
      const defaultName = data.name || `${categoryName} Surf Camp - ${data.startDate.toLocaleDateString()}`;

      const { error } = await supabase
        .from('surf_camps')
        .insert({
          name: defaultName,
          description: data.description || `${categoryName} surf camp session`,
          start_date: data.startDate.toISOString(),
          end_date: data.endDate.toISOString(),
          max_participants: data.maxParticipants || data.occupancy,
          price: data.price || (data.category === 'FR' ? 799.0 : 599.0),
          level: data.level || 'all',
          includes: data.includes || ['Daily surf lessons', 'Equipment rental', 'Breakfast'],
          images: data.images || [],
          is_active: data.isActive !== undefined ? data.isActive : true,
          // New fields
          category: data.category === 'FR' ? 'Freedom Routes' : 'Heiwa House',
          food_preferences: data.foodPreferences || [],
          allergies_info: data.allergiesInfo || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Surf camp created successfully');
      setShowCreateModal(false);
      form.reset();
    } catch (error: unknown) {
      toast.error(`Failed to create surf camp: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateCamp = async (campId: string, data: Partial<SurfCampFormData>) => {
    try {
      const updateData: Record<string, string | number | boolean | string[] | undefined> = {
        updated_at: new Date().toISOString()
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.startDate !== undefined) updateData.start_date = data.startDate.toISOString();
      if (data.endDate !== undefined) updateData.end_date = data.endDate.toISOString();
      if (data.maxParticipants !== undefined) updateData.max_participants = data.maxParticipants;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.level !== undefined) updateData.level = data.level;
      if (data.includes !== undefined) updateData.includes = data.includes;
      if (data.images !== undefined) updateData.images = data.images;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      // New fields
      if (data.category !== undefined) updateData.category = data.category === 'FR' ? 'Freedom Routes' : 'Heiwa House';
      if (data.foodPreferences !== undefined) updateData.food_preferences = data.foodPreferences;
      if (data.allergiesInfo !== undefined) updateData.allergies_info = data.allergiesInfo;

      const { error } = await supabase
        .from('surf_camps')
        .update(updateData)
        .eq('id', campId);

      if (error) throw error;
      toast.success('Surf camp updated successfully');
    } catch (error: unknown) {
      toast.error(`Failed to update surf camp: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteCamp = async (campId: string) => {
    if (!confirm('Are you sure you want to delete this surf camp?')) return;

    try {
      const { error } = await supabase
        .from('surf_camps')
        .delete()
        .eq('id', campId);

      if (error) throw error;
      toast.success('Surf camp deleted successfully');
    } catch (error: unknown) {
      toast.error(`Failed to delete surf camp: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDrop = async (item: DragItem, target: 'clients' | 'rooms') => {
    if (target === 'clients') {
      if (assignedClients.includes(item.id)) {
        toast.warning('Client is already assigned to this camp');
        return;
      }

      // Check for conflicts with other surf camps during the same period
      const conflictingCamp = surfCamps.find(camp =>
        camp.id !== selectedCamp?.id &&
        camp.availableRooms?.some(roomId => assignedRooms.includes(roomId)) &&
        camp.startDate && camp.endDate && selectedCamp?.startDate && selectedCamp?.endDate &&
        (
          (camp.startDate <= selectedCamp.endDate && camp.endDate >= selectedCamp.startDate)
        )
      );

      if (conflictingCamp) {
        toast.error(`Client conflict: This client is already assigned to camp "${conflictingCamp.category}" during overlapping dates`);
        return;
      }

      setAssignedClients([...assignedClients, item.id]);
    } else {
      if (assignedRooms.includes(item.id)) {
        toast.warning('Room is already assigned to this camp');
        return;
      }

      // Check for room conflicts with other surf camps
      const conflictingCamp = surfCamps.find(camp =>
        camp.id !== selectedCamp?.id &&
        camp.availableRooms?.includes(item.id) &&
        camp.startDate && camp.endDate && selectedCamp?.startDate && selectedCamp?.endDate &&
        (
          (camp.startDate <= selectedCamp.endDate && camp.endDate >= selectedCamp.startDate)
        )
      );

      if (conflictingCamp) {
        toast.error(`Room conflict: This room is already assigned to camp "${conflictingCamp.category}" during overlapping dates`);
        return;
      }

      setAssignedRooms([...assignedRooms, item.id]);
    }
  };

  const removeAssignment = (id: string, type: 'client' | 'room') => {
    if (type === 'client') {
      setAssignedClients(assignedClients.filter(clientId => clientId !== id));
    } else {
      setAssignedRooms(assignedRooms.filter(roomId => roomId !== id));
    }
  };

  const openDetailsModal = (camp: AdminSurfCamp) => {
    setSelectedCamp(camp);
    setAssignedClients([]);
    setAssignedRooms(camp.availableRooms || []);
    setShowDetailsModal(true);
  };

  const openEditModal = (camp: AdminSurfCamp) => {
    setSelectedCamp(camp);
    // Populate edit form with current camp data
    editForm.reset({
      category: camp.category || 'HH',
      startDate: camp.startDate,
      endDate: camp.endDate,
      availableRooms: camp.availableRooms || [],
      occupancy: camp.occupancy || camp.maxParticipants,
      name: camp.name,
      description: camp.description,
      maxParticipants: camp.maxParticipants,
      price: camp.price,
      level: camp.level,
      includes: camp.includes || [],
      images: camp.images || [],
      isActive: camp.isActive,
      foodPreferences: camp.foodPreferences || [],
      allergiesInfo: camp.allergiesInfo || [],
    });
    setShowEditModal(true);
  };

  const handleEditCamp = async (data: SurfCampFormData) => {
    if (!selectedCamp) return;

    try {
      await handleUpdateCamp(selectedCamp.id, data);
      setShowEditModal(false);
      // Refresh the camps list
      fetchSurfCamps();
      editForm.reset();
    } catch (error) {
      console.error('Error updating surf camp:', error);
    }
  };

  const formatDate = (timestamp: Date | string | null | undefined) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loadingCamps || loadingRooms || loadingClients) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (errorCamps || errorRooms || errorClients) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Failed to load data: {errorCamps || errorRooms || errorClients}
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Surf Camps</h1>
            <p className="text-gray-600">Create and manage surf camp sessions</p>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Camp
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Surf Camp</DialogTitle>
                <DialogDescription>
                  Set up a new surf camp session with dates and room assignments.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateCamp)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FR">Frenchman&apos;s</SelectItem>
                              <SelectItem value="HH">Honolua Bay</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occupancy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Occupancy</FormLabel>
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
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              selected={field.value}
                              onChange={handleStartDateChange}
                              className="w-full p-2 border border-gray-300 rounded-md"
                              dateFormat="yyyy-MM-dd"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              selected={field.value}
                              onChange={(date) => field.onChange(date)}
                              className="w-full p-2 border border-gray-300 rounded-md"
                              dateFormat="yyyy-MM-dd"
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
                        <FormLabel>Available Rooms</FormLabel>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {rooms?.map((room) => (
                            <div key={room.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={room.id}
                                checked={field.value?.includes(room.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), room.id]);
                                  } else {
                                    field.onChange(field.value?.filter(id => id !== room.id));
                                  }
                                }}
                              />
                              <label htmlFor={room.id} className="text-sm">
                                {room.name} (Capacity: {room.capacity})
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dietary Preferences */}
                  <FormField
                    control={form.control}
                    name="foodPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dietary Preferences (comma-separated)</FormLabel>
                        <FormControl>
                          <Input
                            value={(field.value || []).join(', ')}
                            onChange={(e) => {
                              const parts = e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean);
                              field.onChange(parts);
                            }}
                            placeholder="vegetarian, vegan, gluten-free"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Allergies */}
                  <FormField
                    control={form.control}
                    name="allergiesInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies (comma-separated)</FormLabel>
                        <FormControl>
                          <Input
                            value={(field.value || []).join(', ')}
                            onChange={(e) => {
                              const parts = e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean);
                              field.onChange(parts);
                            }}
                            placeholder="peanuts, shellfish"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Camp</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Surf Camps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {surfCamps.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No surf camps found. Create your first camp to get started.
              </div>
            ) : (
              surfCamps.map((camp) => {
                const occupancy = getCampOccupancy(camp.id);
                const occupancyPercentage = (occupancy / (camp.occupancy || camp.maxParticipants)) * 100;

                return (
                  <motion.div
                    key={camp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant={camp.category === 'FR' ? 'default' : 'secondary'}>
                            {camp.category === 'FR' ? 'Frenchman\'s' : 'Honolua Bay'}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(camp);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCamp(camp.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-lg">
                          {formatDate(camp.startDate)} - {formatDate(camp.endDate)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Signed up:</span>
                            <span className="font-medium">{occupancy}/{camp.occupancy || camp.maxParticipants}</span>
                          </div>

                          {/* Occupancy Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Occupancy</span>
                              <span>{Math.round(occupancyPercentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className={`h-2 rounded-full ${
                                  camp.category === 'FR' ? 'bg-orange-500' : 'bg-heiwaOrange-500'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Rooms:</span>
                            <span className="font-medium">{camp.availableRooms?.length || 0}</span>
                          </div>

                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => openDetailsModal(camp)}
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Details Modal with Drag & Drop */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Surf Camp Details & Assignments</DialogTitle>
              <DialogDescription>
                Manage room and client assignments for this surf camp session.
              </DialogDescription>
            </DialogHeader>

            {selectedCamp && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Available Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Items</h3>

                  {/* Available Clients */}
                  <div>
                    <h4 className="font-medium mb-2">Clients</h4>
                    <DropZone
                      onDrop={(item) => handleDrop(item, 'clients')}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px]"
                    >
                      <div className="space-y-2">
                        {clients?.map((client) => (
                          <DraggableClient
                            key={client.id}
                            client={client}
                            isAssigned={assignedClients.includes(client.id)}
                          />
                        ))}
                      </div>
                    </DropZone>
                  </div>

                  {/* Available Rooms */}
                  <div>
                    <h4 className="font-medium mb-2">Rooms</h4>
                    <DropZone
                      onDrop={(item) => handleDrop(item, 'rooms')}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px]"
                    >
                      <div className="space-y-2">
                        {rooms?.map((room) => (
                          <DraggableRoom
                            key={room.id}
                            room={room}
                            isAssigned={assignedRooms.includes(room.id)}
                          />
                        ))}
                      </div>
                    </DropZone>
                  </div>
                </div>

                {/* Right Column - Assigned Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Assigned to Camp</h3>

                  {/* Assigned Clients */}
                  <div>
                    <h4 className="font-medium mb-2">Assigned Clients</h4>
                    <div className="border border-gray-300 rounded-lg p-4 min-h-[200px]">
                      {assignedClients.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          Drag clients here to assign them to this camp
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {assignedClients.map((clientId) => {
                            const client = clients.find(c => c.id === clientId);
                            return client ? (
                              <div
                                key={clientId}
                                className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                              >
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4" />
                                  <span className="text-sm font-medium">{client.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAssignment(clientId, 'client')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assigned Rooms */}
                  <div>
                    <h4 className="font-medium mb-2">Assigned Rooms</h4>
                    <div className="border border-gray-300 rounded-lg p-4 min-h-[200px]">
                      {assignedRooms.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          Drag rooms here to assign them to this camp
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {assignedRooms.map((roomId) => {
                            const room = rooms.find(r => r.id === roomId);
                            return room ? (
                              <div
                                key={roomId}
                                className="flex items-center justify-between p-2 bg-heiwaOrange-50 border border-heiwaOrange-200 rounded"
                              >
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4" />
                                  <span className="text-sm font-medium">{room.name}</span>
                                  <span className="text-xs text-gray-500">Cap: {room.capacity}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAssignment(roomId, 'room')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => {
                        // TODO: Implement room assignments storage
                        // For now, just close the modal
                        toast.info('Room assignments feature coming soon');
                        setShowDetailsModal(false);
                      }}
                    >
                      Save Assignments
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Surf Camp Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Surf Camp</DialogTitle>
              <DialogDescription>
                Update the surf camp details, dates, and settings.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditCamp)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Camp Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter camp name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="all">All Levels</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the surf camp experience..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const date = e.target.value ? new Date(e.target.value) : null;
                              if (date) {
                                field.onChange(date);
                                // Auto-set end date to 7 days later
                                const endDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
                                editForm.setValue('endDate', endDate);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const date = e.target.value ? new Date(e.target.value) : null;
                              if (date) field.onChange(date);
                            }}
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
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Participants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                        <p className="text-sm text-muted-foreground">
                          Make this surf camp available for booking
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Surf Camp
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}
