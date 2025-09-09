// Supabase Admin SDK for server-side operations
import { createClient } from '@supabase/supabase-js';
import type { Client, SurfCamp, Room, AddOn, Booking } from './schemas';

// Use fallback values to prevent deployment failures when environment variables are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zejrhceuuujzgyukdwnb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDgwOSwiZXhwIjoyMDcyNjgwODA5fQ.RbzOLzCaOAsgaMixdACMLdPvLZjU9MPfXn8Y90gsxcc'

console.log('✅ Admin Supabase connection initialized:', {
  url: supabaseUrl,
  hasKey: !!supabaseServiceKey,
  project: 'heiwa'
})

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Table names (converted from Firestore collections)
export const TABLES = {
  CLIENTS: 'clients',
  SURF_CAMPS: 'surf_camps',
  ROOMS: 'rooms',
  ADD_ONS: 'add_ons',
  BOOKINGS: 'bookings',
  CAMP_WEEKS: 'camp_weeks',
  ROOM_ASSIGNMENTS: 'room_assignments',
  PAYMENTS: 'payments',
  INVOICES: 'invoices',
  AUTOMATIONS: 'automations',
  EXTERNAL_CALENDAR_EVENTS: 'external_calendar_events',
  FEATURE_FLAGS: 'feature_flags',
} as const;

// Helper function to check if Supabase is available
function isSupabaseAvailable(): boolean {
  return !!supabaseAdmin;
}

// Helper function to handle Supabase unavailability
function handleSupabaseUnavailable(operation: string, returnValue: any = null) {
  console.warn(`Supabase not available for ${operation}, returning ${returnValue}`);
  return returnValue;
}

// Helper function to convert snake_case to camelCase for compatibility
function convertToCamelCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(convertToCamelCase);
  }
  
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = convertToCamelCase(value);
  }
  return converted;
}

// Helper function to convert camelCase to snake_case for database
function convertToSnakeCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(convertToSnakeCase);
  }
  
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = convertToSnakeCase(value);
  }
  return converted;
}

// Client operations
export const clientsAPI = {
  async getAll(): Promise<(Client & { id: string })[]> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('clients.getAll', []);
    }
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.CLIENTS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
    
    return data?.map(convertToCamelCase) || [];
  },

  async getById(id: string): Promise<(Client & { id: string }) | null> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('clients.getById', null);
    }
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.CLIENTS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching client:', error);
      return null;
    }
    
    return data ? convertToCamelCase(data) : null;
  },

  async create(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('clients.create', 'dummy-id');
    }
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.CLIENTS)
      .insert([convertToSnakeCase(clientData)])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      throw new Error(`Failed to create client: ${error.message}`);
    }
    
    return data.id;
  },

  async update(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<void> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('clients.update');
    }
    
    const { error } = await supabaseAdmin
      .from(TABLES.CLIENTS)
      .update(convertToSnakeCase(updates))
      .eq('id', id);
    
    if (error) {
      console.error('Error updating client:', error);
      throw new Error(`Failed to update client: ${error.message}`);
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('clients.delete');
    }
    
    const { error } = await supabaseAdmin
      .from(TABLES.CLIENTS)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting client:', error);
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  },

  async findByEmail(email: string): Promise<(Client & { id: string }) | null> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('clients.findByEmail', null);
    }
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.CLIENTS)
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error finding client by email:', error);
      return null;
    }
    
    return data ? convertToCamelCase(data) : null;
  },

  async search(searchTerm: string): Promise<(Client & { id: string })[]> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('clients.search', []);
    }
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.CLIENTS)
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching clients:', error);
      return [];
    }
    
    return data?.map(convertToCamelCase) || [];
  },
};

// Surf Camps operations
export const surfCampsAPI = {
  async getAll(): Promise<(SurfCamp & { id: string })[]> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('surfCamps.getAll', []);
    }
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.SURF_CAMPS)
      .select('*')
      .order('start_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching surf camps:', error);
      return [];
    }
    
    return data?.map(convertToCamelCase) || [];
  },

  async getById(id: string): Promise<(SurfCamp & { id: string }) | null> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('surfCamps.getById', null);
    }
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.SURF_CAMPS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching surf camp:', error);
      return null;
    }
    
    return data ? convertToCamelCase(data) : null;
  },

  async create(campData: Omit<SurfCamp, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('surfCamps.create', 'dummy-id');
    }
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.SURF_CAMPS)
      .insert([convertToSnakeCase(campData)])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating surf camp:', error);
      throw new Error(`Failed to create surf camp: ${error.message}`);
    }
    
    return data.id;
  },

  async update(id: string, updates: Partial<Omit<SurfCamp, 'id' | 'createdAt'>>): Promise<void> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('surfCamps.update');
    }
    
    const { error } = await supabaseAdmin
      .from(TABLES.SURF_CAMPS)
      .update(convertToSnakeCase(updates))
      .eq('id', id);
    
    if (error) {
      console.error('Error updating surf camp:', error);
      throw new Error(`Failed to update surf camp: ${error.message}`);
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('surfCamps.delete');
    }
    
    const { error } = await supabaseAdmin
      .from(TABLES.SURF_CAMPS)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting surf camp:', error);
      throw new Error(`Failed to delete surf camp: ${error.message}`);
    }
  },
};

// Rooms operations
export const roomsAPI = {
  async getAll(): Promise<(Room & { id: string })[]> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('rooms.getAll', []);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.ROOMS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }

    return data?.map(convertToCamelCase) || [];
  },

  async getById(id: string): Promise<(Room & { id: string }) | null> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('rooms.getById', null);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.ROOMS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return null;
    }

    return data ? convertToCamelCase(data) : null;
  },

  async create(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('rooms.create', 'dummy-id');
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.ROOMS)
      .insert([convertToSnakeCase(roomData)])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating room:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }

    return data.id;
  },

  async update(id: string, updates: Partial<Omit<Room, 'id' | 'createdAt'>>): Promise<void> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('rooms.update');
    }

    const { error } = await supabaseAdmin
      .from(TABLES.ROOMS)
      .update(convertToSnakeCase(updates))
      .eq('id', id);

    if (error) {
      console.error('Error updating room:', error);
      throw new Error(`Failed to update room: ${error.message}`);
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('rooms.delete');
    }

    const { error } = await supabaseAdmin
      .from(TABLES.ROOMS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting room:', error);
      throw new Error(`Failed to delete room: ${error.message}`);
    }
  },
};

// Add-ons operations
export const addOnsAPI = {
  async getAll(): Promise<(AddOn & { id: string })[]> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('addOns.getAll', []);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.ADD_ONS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching add-ons:', error);
      return [];
    }

    return data?.map(convertToCamelCase) || [];
  },

  async getById(id: string): Promise<(AddOn & { id: string }) | null> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('addOns.getById', null);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.ADD_ONS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching add-on:', error);
      return null;
    }

    return data ? convertToCamelCase(data) : null;
  },

  async create(addOnData: Omit<AddOn, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('addOns.create', 'dummy-id');
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.ADD_ONS)
      .insert([convertToSnakeCase(addOnData)])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating add-on:', error);
      throw new Error(`Failed to create add-on: ${error.message}`);
    }

    return data.id;
  },

  async update(id: string, updates: Partial<Omit<AddOn, 'id' | 'createdAt'>>): Promise<void> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('addOns.update');
    }

    const { error } = await supabaseAdmin
      .from(TABLES.ADD_ONS)
      .update(convertToSnakeCase(updates))
      .eq('id', id);

    if (error) {
      console.error('Error updating add-on:', error);
      throw new Error(`Failed to update add-on: ${error.message}`);
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('addOns.delete');
    }

    const { error } = await supabaseAdmin
      .from(TABLES.ADD_ONS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting add-on:', error);
      throw new Error(`Failed to delete add-on: ${error.message}`);
    }
  },
};

// Bookings operations
export const bookingsAPI = {
  async getAll(): Promise<(Booking & { id: string })[]> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('bookings.getAll', []);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.BOOKINGS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    return data?.map(convertToCamelCase) || [];
  },

  async getById(id: string): Promise<(Booking & { id: string }) | null> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('bookings.getById', null);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.BOOKINGS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return null;
    }

    return data ? convertToCamelCase(data) : null;
  },

  async create(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('bookings.create', 'dummy-id');
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.BOOKINGS)
      .insert([convertToSnakeCase(bookingData)])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw new Error(`Failed to create booking: ${error.message}`);
    }

    return data.id;
  },

  async update(id: string, updates: Partial<Omit<Booking, 'id' | 'createdAt'>>): Promise<void> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('bookings.update');
    }

    const { error } = await supabaseAdmin
      .from(TABLES.BOOKINGS)
      .update(convertToSnakeCase(updates))
      .eq('id', id);

    if (error) {
      console.error('Error updating booking:', error);
      throw new Error(`Failed to update booking: ${error.message}`);
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('bookings.delete');
    }

    const { error } = await supabaseAdmin
      .from(TABLES.BOOKINGS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting booking:', error);
      throw new Error(`Failed to delete booking: ${error.message}`);
    }
  },

  async getByStatus(status: 'pending' | 'confirmed' | 'cancelled'): Promise<(Booking & { id: string })[]> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('bookings.getByStatus', []);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.BOOKINGS)
      .select('*')
      .eq('payment_status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings by status:', error);
      return [];
    }

    return data?.map(convertToCamelCase) || [];
  },

  async getByClientId(clientId: string): Promise<(Booking & { id: string })[]> {
    if (!isSupabaseAvailable()) {
      return handleSupabaseUnavailable('bookings.getByClientId', []);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.BOOKINGS)
      .select('*')
      .contains('client_ids', [clientId])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings by client ID:', error);
      return [];
    }

    return data?.map(convertToCamelCase) || [];
  },
};
