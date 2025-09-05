// Backward compatibility layer for Firebase Admin SDK
// Re-exports Supabase operations with Firebase-compatible interface
export {
  clientsAPI,
  surfCampsAPI,
  roomsAPI,
  addOnsAPI,
  bookingsAPI,
  TABLES as COLLECTIONS
} from './supabase-admin';

// Helper function to convert Firestore document to typed object (for compatibility)
export function docToData<T>(doc: any): T & { id: string } {
  return { id: doc.id, ...doc } as T & { id: string };
}
