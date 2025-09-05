import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Initialize Supabase client (only for client-side)
let clientSupabase: ReturnType<typeof createClient> | null = null;

function initializeClientSupabase() {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client SDK can only be used on the client side');
  }

  if (!clientSupabase) {
    clientSupabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  return {
    app: clientSupabase,
    auth: clientSupabase.auth,
    db: clientSupabase,
    storage: clientSupabase.storage
  };
}

export const getClientSupabase = () => {
  return initializeClientSupabase();
};

// Backward compatibility exports
export const getClientFirebase = getClientSupabase;

// Lazy initialization to avoid SSR issues
export function getAuth() {
  if (typeof window === 'undefined') return null;
  try {
    return initializeClientSupabase().auth;
  } catch {
    return null;
  }
}

export function getDb() {
  if (typeof window === 'undefined') return null;
  try {
    return initializeClientSupabase().db;
  } catch {
    return null;
  }
}

export function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return initializeClientSupabase().storage;
  } catch {
    return null;
  }
}

// Only export the supabase client directly
