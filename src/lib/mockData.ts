// Mock data for development and demo purposes
import { Timestamp } from 'firebase/firestore';
import type { Client, Booking, BookingItem } from './schemas';

// Mock Clients Data
export const mockClients: (Client & { id: string })[] = [
  {
    id: 'client_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0123',
    lastBookingDate: Timestamp.fromDate(new Date('2024-01-15')),
    notes: 'Regular customer, prefers ocean view rooms',
    createdAt: Timestamp.fromDate(new Date('2023-06-10')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-15')),
  },
  {
    id: 'client_002',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1-555-0124',
    lastBookingDate: Timestamp.fromDate(new Date('2024-01-20')),
    notes: 'First-time visitor, interested in surf camps',
    createdAt: Timestamp.fromDate(new Date('2023-08-22')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-20')),
  },
  {
    id: 'client_003',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@email.com',
    phone: '+1-555-0125',
    lastBookingDate: Timestamp.fromDate(new Date('2023-12-10')),
    notes: 'Booked family room for 4 people',
    createdAt: Timestamp.fromDate(new Date('2023-09-15')),
    updatedAt: Timestamp.fromDate(new Date('2023-12-10')),
  },
  {
    id: 'client_004',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    phone: '+1-555-0126',
    lastBookingDate: Timestamp.fromDate(new Date('2024-01-25')),
    notes: 'Corporate booking, needs invoice',
    createdAt: Timestamp.fromDate(new Date('2023-11-05')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-25')),
  },
  {
    id: 'client_005',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@email.com',
    phone: '+1-555-0127',
    lastBookingDate: Timestamp.fromDate(new Date('2023-11-30')),
    notes: 'Vegetarian, requires special dietary arrangements',
    createdAt: Timestamp.fromDate(new Date('2023-07-18')),
    updatedAt: Timestamp.fromDate(new Date('2023-11-30')),
  },
  {
    id: 'client_006',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1-555-0128',
    lastBookingDate: Timestamp.fromDate(new Date('2024-01-08')),
    notes: 'Experienced surfer, interested in advanced lessons',
    createdAt: Timestamp.fromDate(new Date('2023-10-12')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-08')),
  },
  {
    id: 'client_007',
    name: 'Anna Martinez',
    email: 'anna.martinez@email.com',
    phone: '+1-555-0129',
    lastBookingDate: Timestamp.fromDate(new Date('2023-12-22')),
    notes: 'Celebrating anniversary, wants romantic setup',
    createdAt: Timestamp.fromDate(new Date('2023-05-20')),
    updatedAt: Timestamp.fromDate(new Date('2023-12-22')),
  },
  {
    id: 'client_008',
    name: 'Robert Taylor',
    email: 'robert.taylor@email.com',
    phone: '+1-555-0130',
    notes: 'New client, no booking history yet',
    createdAt: Timestamp.fromDate(new Date('2024-01-28')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-28')),
  },
];

// Mock Booking Items
const mockBookingItems: BookingItem[] = [
  {
    type: 'room',
    itemId: 'room_001',
    quantity: 1,
    unitPrice: 150,
    totalPrice: 150,
    dates: {
      checkIn: Timestamp.fromDate(new Date('2024-02-01')),
      checkOut: Timestamp.fromDate(new Date('2024-02-05')),
    },
  },
  {
    type: 'addOn',
    itemId: 'addon_001',
    quantity: 2,
    unitPrice: 25,
    totalPrice: 50,
  },
  {
    type: 'surfCamp',
    itemId: 'camp_001',
    quantity: 1,
    unitPrice: 300,
    totalPrice: 300,
    dates: {
      checkIn: Timestamp.fromDate(new Date('2024-02-10')),
      checkOut: Timestamp.fromDate(new Date('2024-02-14')),
    },
  },
];

// Mock Bookings Data
export const mockBookings: (Booking & { id: string })[] = [
  {
    id: 'booking_001',
    clientIds: ['client_001'],
    items: [
      {
        type: 'room',
        itemId: 'room_001',
        quantity: 1,
        unitPrice: 180,
        totalPrice: 180,
        dates: {
          checkIn: Timestamp.fromDate(new Date('2024-01-15')),
          checkOut: Timestamp.fromDate(new Date('2024-01-20')),
        },
      },
      {
        type: 'addOn',
        itemId: 'addon_001',
        quantity: 1,
        unitPrice: 30,
        totalPrice: 30,
      },
    ],
    totalAmount: 210,
    paymentStatus: 'confirmed',
    paymentMethod: 'stripe',
    notes: 'Ocean view room requested',
    createdAt: Timestamp.fromDate(new Date('2024-01-10')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-15')),
  },
  {
    id: 'booking_002',
    clientIds: ['client_002'],
    items: [
      {
        type: 'surfCamp',
        itemId: 'camp_001',
        quantity: 1,
        unitPrice: 350,
        totalPrice: 350,
        dates: {
          checkIn: Timestamp.fromDate(new Date('2024-01-20')),
          checkOut: Timestamp.fromDate(new Date('2024-01-25')),
        },
      },
    ],
    totalAmount: 350,
    paymentStatus: 'confirmed',
    paymentMethod: 'cash',
    notes: 'Beginner surf camp',
    createdAt: Timestamp.fromDate(new Date('2024-01-18')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-20')),
  },
  {
    id: 'booking_003',
    clientIds: ['client_003', 'client_003_family'],
    items: [
      {
        type: 'room',
        itemId: 'room_002',
        quantity: 1,
        unitPrice: 250,
        totalPrice: 250,
        dates: {
          checkIn: Timestamp.fromDate(new Date('2023-12-10')),
          checkOut: Timestamp.fromDate(new Date('2023-12-15')),
        },
      },
      {
        type: 'addOn',
        itemId: 'addon_002',
        quantity: 4,
        unitPrice: 15,
        totalPrice: 60,
      },
    ],
    totalAmount: 310,
    paymentStatus: 'confirmed',
    paymentMethod: 'transfer',
    notes: 'Family booking for 4 people',
    createdAt: Timestamp.fromDate(new Date('2023-12-05')),
    updatedAt: Timestamp.fromDate(new Date('2023-12-10')),
  },
  {
    id: 'booking_004',
    clientIds: ['client_004'],
    items: [
      {
        type: 'room',
        itemId: 'room_003',
        quantity: 1,
        unitPrice: 200,
        totalPrice: 200,
        dates: {
          checkIn: Timestamp.fromDate(new Date('2024-01-25')),
          checkOut: Timestamp.fromDate(new Date('2024-01-28')),
        },
      },
    ],
    totalAmount: 200,
    paymentStatus: 'pending',
    notes: 'Corporate booking - awaiting payment',
    createdAt: Timestamp.fromDate(new Date('2024-01-22')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-25')),
  },
  {
    id: 'booking_005',
    clientIds: ['client_005'],
    items: [
      {
        type: 'room',
        itemId: 'room_001',
        quantity: 1,
        unitPrice: 160,
        totalPrice: 160,
        dates: {
          checkIn: Timestamp.fromDate(new Date('2023-11-30')),
          checkOut: Timestamp.fromDate(new Date('2023-12-03')),
        },
      },
      {
        type: 'addOn',
        itemId: 'addon_003',
        quantity: 1,
        unitPrice: 20,
        totalPrice: 20,
      },
    ],
    totalAmount: 180,
    paymentStatus: 'confirmed',
    paymentMethod: 'stripe',
    notes: 'Vegetarian meal plan requested',
    createdAt: Timestamp.fromDate(new Date('2023-11-25')),
    updatedAt: Timestamp.fromDate(new Date('2023-11-30')),
  },
  {
    id: 'booking_006',
    clientIds: ['client_006'],
    items: [
      {
        type: 'surfCamp',
        itemId: 'camp_002',
        quantity: 1,
        unitPrice: 400,
        totalPrice: 400,
        dates: {
          checkIn: Timestamp.fromDate(new Date('2024-01-08')),
          checkOut: Timestamp.fromDate(new Date('2024-01-13')),
        },
      },
    ],
    totalAmount: 400,
    paymentStatus: 'confirmed',
    paymentMethod: 'stripe',
    notes: 'Advanced surf camp for experienced surfer',
    createdAt: Timestamp.fromDate(new Date('2024-01-05')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-08')),
  },
  {
    id: 'booking_007',
    clientIds: ['client_007'],
    items: [
      {
        type: 'room',
        itemId: 'room_004',
        quantity: 1,
        unitPrice: 220,
        totalPrice: 220,
        dates: {
          checkIn: Timestamp.fromDate(new Date('2023-12-22')),
          checkOut: Timestamp.fromDate(new Date('2023-12-25')),
        },
      },
      {
        type: 'addOn',
        itemId: 'addon_004',
        quantity: 1,
        unitPrice: 50,
        totalPrice: 50,
      },
    ],
    totalAmount: 270,
    paymentStatus: 'confirmed',
    paymentMethod: 'cash',
    notes: 'Anniversary celebration - special setup requested',
    createdAt: Timestamp.fromDate(new Date('2023-12-18')),
    updatedAt: Timestamp.fromDate(new Date('2023-12-22')),
  },
  {
    id: 'booking_008',
    clientIds: ['client_001'],
    items: [
      {
        type: 'room',
        itemId: 'room_001',
        quantity: 1,
        unitPrice: 170,
        totalPrice: 170,
        dates: {
          checkIn: Timestamp.fromDate(new Date('2024-02-05')),
          checkOut: Timestamp.fromDate(new Date('2024-02-08')),
        },
      },
    ],
    totalAmount: 170,
    paymentStatus: 'pending',
    notes: 'Return visit - preferred customer',
    createdAt: Timestamp.fromDate(new Date('2024-01-30')),
    updatedAt: Timestamp.fromDate(new Date('2024-02-01')),
  },
];

// Mock API functions that simulate Firebase operations
export const mockClientsAPI = {
  async getAll(): Promise<(Client & { id: string })[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockClients];
  },

  async getById(id: string): Promise<(Client & { id: string }) | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockClients.find(client => client.id === id) || null;
  },
};

export const mockBookingsAPI = {
  async getAll(): Promise<(Booking & { id: string })[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockBookings];
  },

  async getByStatus(status: 'pending' | 'confirmed' | 'cancelled'): Promise<(Booking & { id: string })[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockBookings.filter(booking => booking.paymentStatus === status);
  },

  async getById(id: string): Promise<(Booking & { id: string }) | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBookings.find(booking => booking.id === id) || null;
  },
};
