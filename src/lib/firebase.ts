import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth as getFirebaseAuth } from 'firebase/auth';
import { getStorage as getFirebaseStorage } from 'firebase/storage';

// Initialize Firebase services
let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;
let isInitialized = false;

// Function to initialize Firebase with runtime config
async function initializeFirebase() {
  if (isInitialized) return;

  try {
    // Fetch Firebase config from API route
    const response = await fetch('/api/firebase-config');
    if (!response.ok) {
      throw new Error('Failed to fetch Firebase config');
    }

    const firebaseConfig = await response.json();

    // Initialize Firebase only if we have valid config
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      db = getFirestore(app);
      auth = getFirebaseAuth(app);
      storage = getFirebaseStorage(app);
      isInitialized = true;

      console.log('Firebase initialized successfully');
    } else {
      console.warn('Firebase config is missing or invalid');
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase:', error);
  }
}

// Initialize Firebase immediately if we're in the browser
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Function to get Firebase services (ensures initialization)
export async function getFirebaseServices() {
  if (!isInitialized && typeof window !== 'undefined') {
    await initializeFirebase();
  }
  return { db, auth, storage, app };
}

// Export Firebase services (may be null during SSR)
export { db, auth, storage };

// SSR-safe getters
export function getAuth() {
  if (typeof window === 'undefined') {
    return null;
  }
  return auth;
}

export function getDb() {
  if (typeof window === 'undefined') {
    return null;
  }
  return db;
}

export function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }
  return storage;
}

export default app;
