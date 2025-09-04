'use client'

import React, { useState, useMemo, useEffect } from 'react';

// Disable prerendering for this page since it uses Firebase
export const dynamic = 'force-dynamic';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { COLLECTIONS, CreateSurfCampSchema, SurfCamp, Room, Client } from '@/lib/schemas';
import { Plus, Edit, Trash2, Users, Calendar, MapPin, BarChart3 } from 'lucide-react';

// Form schema for surf camp creation/editing
const SurfCampFormSchema = z.object({
  category: z.enum(['FR', 'HH']),
  startDate: z.date(),
  endDate: z.date(),
  availableRooms: z.array(z.string()).min(1, 'At least one room is required'),
  occupancy: z.number().min(1, 'Occupancy must be at least 1'),
});

type SurfCampFormData = z.infer<typeof SurfCampFormSchema>;

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
        isAssigned ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
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
      className={`${className} ${isOver ? 'bg-blue-50 border-blue-300' : ''}`}
    >
      {children}
    </div>
  );
};

export default function SurfCampsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<(SurfCamp & { id: string }) | null>(null);
  const [assignedClients, setAssignedClients] = useState<string[]>([]);
  const [assignedRooms, setAssignedRooms] = useState<string[]>([]);
  const db = getDb();

  // Fetch surf camps
  const [surfCampsSnapshot, loadingCamps, errorCamps] = useCollection(
    db ? collection(db, COLLECTIONS.SURF_CAMPS) : null
  );

  // Fetch rooms for assignment
  const [roomsSnapshot, loadingRooms] = useCollection(
    db ? collection(db, COLLECTIONS.ROOMS) : null
  );

  // Fetch clients for assignment
  const [clientsSnapshot, loadingClients] = useCollection(
    db ? collection(db, COLLECTIONS.CLIENTS) : null
  );

  // Handle Firestore errors and permissions
  useEffect(() => {
    if (errorCamps) {
      const errorMessage = errorCamps.message || 'Failed to load surf camps';
      if (errorMessage.includes('Missing or insufficient permissions')) {
        toast.error('Access denied: Insufficient permissions to view surf camps');
        console.warn('Permissions error:', errorCamps);
      } else {
        toast.error(`Failed to load surf camps: ${errorMessage}`);
      }
    }
  }, [errorCamps]);

  // Fetch bookings to calculate occupancy
  const [bookingsSnapshot] = useCollection(
    db ? collection(db, COLLECTIONS.BOOKINGS) : null
  );

  const surfCamps = useMemo(() => {
    if (!surfCampsSnapshot) return [];
    return surfCampsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (SurfCamp & { id: string })[];
  }, [surfCampsSnapshot]);

  const rooms = useMemo(() => {
    if (!roomsSnapshot) return [];
    return roomsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (Room & { id: string })[];
  }, [roomsSnapshot]);

  const clients = useMemo(() => {
    if (!clientsSnapshot) return [];
    return clientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (Client & { id: string })[];
  }, [clientsSnapshot]);

  const bookings = useMemo(() => {
    if (!bookingsSnapshot) return [];
    return bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
  }, [bookingsSnapshot]);

  // Calculate occupancy for a surf camp
  const getCampOccupancy = (campId: string) => {
    const campBookings = bookings.filter(booking =>
      booking.items.some((item: any) =>
        item.type === 'surfCamp' && item.itemId === campId
      )
    );
    return campBookings.reduce((total, booking) => total + booking.clientIds.length, 0);
  };

  // Form for creating/editing surf camps
  const form = useForm<SurfCampFormData>({
    resolver: zodResolver(SurfCampFormSchema),
    defaultValues: {
      category: 'FR',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      availableRooms: [],
      occupancy: 1,
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
          (camp.startDate.toDate() <= data.endDate && camp.endDate.toDate() >= data.startDate)
        )
      );

      if (overlappingCamp) {
        toast.error(`Cannot create camp: There is already a ${data.category} camp scheduled during overlapping dates`);
        return;
      }

      if (!db) {
        toast.error('Database not available');
        return;
      }

      await addDoc(collection(db, COLLECTIONS.SURF_CAMPS), {
        ...data,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: Timestamp.fromDate(data.endDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      toast.success('Surf camp created successfully');
      setShowCreateModal(false);
      form.reset();
    } catch (error: any) {
      toast.error(`Failed to create surf camp: ${error.message}`);
    }
  };

  const handleUpdateCamp = async (campId: string, data: Partial<SurfCampFormData>) => {
    try {
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      if (data.startDate) updateData.startDate = Timestamp.fromDate(data.startDate);
      if (data.endDate) updateData.endDate = Timestamp.fromDate(data.endDate);

      await updateDoc(doc(db, COLLECTIONS.SURF_CAMPS, campId), updateData);
      toast.success('Surf camp updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update surf camp: ${error.message}`);
    }
  };

  const handleDeleteCamp = async (campId: string) => {
    if (!confirm('Are you sure you want to delete this surf camp?')) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.SURF_CAMPS, campId));
      toast.success('Surf camp deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete surf camp: ${error.message}`);
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
        camp.availableRooms.some(roomId => assignedRooms.includes(roomId)) &&
        camp.startDate && camp.endDate && selectedCamp?.startDate && selectedCamp?.endDate &&
        (
          (camp.startDate.toDate() <= selectedCamp.endDate.toDate() && camp.endDate.toDate() >= selectedCamp.startDate.toDate())
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
        camp.availableRooms.includes(item.id) &&
        camp.startDate && camp.endDate && selectedCamp?.startDate && selectedCamp?.endDate &&
        (
          (camp.startDate.toDate() <= selectedCamp.endDate.toDate() && camp.endDate.toDate() >= selectedCamp.startDate.toDate())
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

  const openDetailsModal = (camp: SurfCamp & { id: string }) => {
    setSelectedCamp(camp);
    setAssignedClients([]);
    setAssignedRooms(camp.availableRooms);
    setShowDetailsModal(true);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loadingCamps) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading surf camps...</div>
      </div>
    );
  }

  if (errorCamps) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Failed to load surf camps: {errorCamps.message}
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
                              <SelectItem value="FR">Frenchman's</SelectItem>
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
                          {rooms.map((room) => (
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
                const occupancyPercentage = (occupancy / camp.occupancy) * 100;

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
                                openDetailsModal(camp);
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
                            <span className="font-medium">{occupancy}/{camp.occupancy}</span>
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
                                  camp.category === 'FR' ? 'bg-orange-500' : 'bg-blue-500'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Rooms:</span>
                            <span className="font-medium">{camp.availableRooms.length}</span>
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
                        {clients.map((client) => (
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
                        {rooms.map((room) => (
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
                                className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded"
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
                        handleUpdateCamp(selectedCamp.id, { availableRooms: assignedRooms });
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
      </div>
    </DndProvider>
  );
}
