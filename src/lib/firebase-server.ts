// Supabase server-side operations for backward compatibility
import { supabase } from './firebase';

// Export Supabase client for server-side operations
export const getAdminDb = () => supabase;
export const getAdminAuth = () => supabase.auth;
export const adminApp = supabase;

