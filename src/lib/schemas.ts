import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Helper schema for Firebase Timestamp
const TimestampSchema = z.custom<Timestamp>((val) => val instanceof Timestamp);

// Client schema
export const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required'),
  lastBookingDate: TimestampSchema.optional(),
  notes: z.string().optional().default(''),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Client = z.infer<typeof ClientSchema>;

// Surf Camp schema
export const SurfCampSchema = z.object({
  id: z.string(),
  category: z.enum(['FR', 'HH']),
  startDate: TimestampSchema,
  endDate: TimestampSchema,
  availableRooms: z.array(z.string()),
  occupancy: z.number().min(1, 'Occupancy must be at least 1'),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type SurfCamp = z.infer<typeof SurfCampSchema>;

// Room pricing schema
const RoomPricingSchema = z.object({
  standard: z.number().min(0, 'Standard price must be non-negative'),
  offSeason: z.number().min(0, 'Off-season price must be non-negative'),
  camp: z.union([
    z.record(z.number(), z.number().min(0)), // For occupancy-based pricing
    z.object({ perBed: z.number().min(0) })   // For per-bed pricing
  ]),
});

// Room schema
export const RoomSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Room name is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  bookingType: z.enum(['whole', 'perBed']),
  pricing: RoomPricingSchema,
  amenities: z.array(z.string()).default([]),
  description: z.string().optional().default(''),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Room = z.infer<typeof RoomSchema>;

// Add-on schema
export const AddOnSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Add-on name is required'),
  description: z.string().optional().default(''),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.enum(['equipment', 'service', 'food', 'transport', 'other']),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  maxQuantity: z.number().min(1).optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type AddOn = z.infer<typeof AddOnSchema>;

// Booking item schema
const BookingItemSchema = z.object({
  type: z.enum(['room', 'surfCamp', 'addOn']),
  itemId: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  dates: z.object({
    checkIn: TimestampSchema,
    checkOut: TimestampSchema,
  }).optional(),
});

// Booking schema
export const BookingSchema = z.object({
  id: z.string(),
  clientIds: z.array(z.string()).min(1, 'At least one client is required'),
  items: z.array(BookingItemSchema).min(1, 'At least one booking item is required'),
  totalAmount: z.number().min(0, 'Total amount must be non-negative'),
  paymentStatus: z.enum(['pending', 'confirmed', 'cancelled']),
  paymentMethod: z.enum(['stripe', 'cash', 'transfer', 'other']).optional(),
  notes: z.string().optional().default(''),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Booking = z.infer<typeof BookingSchema>;
export type BookingItem = z.infer<typeof BookingItemSchema>;

// Collection names
export const COLLECTIONS = {
  CLIENTS: 'clients',
  SURF_CAMPS: 'surfCamps',
  ROOMS: 'rooms',
  ADD_ONS: 'addOns',
  BOOKINGS: 'bookings',
} as const;

// Form schemas for creating/updating entities
export const CreateClientSchema = ClientSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateClientSchema = CreateClientSchema.partial();

export const CreateSurfCampSchema = SurfCampSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateSurfCampSchema = CreateSurfCampSchema.partial();

export const CreateRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  bookingType: z.enum(['whole', 'perBed']),
  pricing: RoomPricingSchema,
  amenities: z.array(z.string()),
  description: z.string(),
  images: z.array(z.string()),
  isActive: z.boolean(),
});
export const UpdateRoomSchema = CreateRoomSchema.partial();

export const CreateAddOnSchema = z.object({
  name: z.string().min(1, 'Add-on name is required'),
  description: z.string(),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.enum(['equipment', 'service', 'food', 'transport', 'other']),
  images: z.array(z.string()),
  isActive: z.boolean(),
  maxQuantity: z.number().min(1).optional(),
});
export const UpdateAddOnSchema = CreateAddOnSchema.partial();

export const CreateBookingSchema = BookingSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateBookingSchema = CreateBookingSchema.partial();
