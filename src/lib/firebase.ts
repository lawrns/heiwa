// Re-export client Supabase SDK for backward compatibility
// This should only be used in client components
export { supabase } from './firebase/client';

// Export db and storage for backward compatibility
export const db = supabase;
export const storage = supabase.storage;
export const auth = supabase.auth;
