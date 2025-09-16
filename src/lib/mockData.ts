// DEPRECATED: Mock data file - DO NOT USE
// All components should use real database data instead
import type { Client, Booking, BookingItem } from './schemas';

// TODO: Remove this file entirely once all components use real data
// Mock Clients Data - DEPRECATED: Use real database data instead
export const mockClients: (Client & { id: string })[] = []

// Mock Booking Items - DEPRECATED: Use real database data instead
export const mockBookingItems: BookingItem[] = []

// Mock Bookings Data - DEPRECATED: Use real database data instead
export const mockBookings: (Booking & { id: string })[] = []

// Mock API functions - DEPRECATED: Use real Supabase operations instead
export const mockClientsAPI = {
  async getAll(): Promise<(Client & { id: string })[]> {
    return []
  },

  async getById(id: string): Promise<(Client & { id: string }) | null> {
    return null
  },
}

export const mockBookingsAPI = {
  async getAll(): Promise<(Booking & { id: string })[]> {
    return []
  },

  async getByStatus(status: 'pending' | 'confirmed' | 'cancelled'): Promise<(Booking & { id: string })[]> {
    return []
  },

  async getById(id: string): Promise<(Booking & { id: string }) | null> {
    return null
  },
}