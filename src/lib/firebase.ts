import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth as getFirebaseAuth } from 'firebase/auth';
import { getStorage as getFirebaseStorage } from 'firebase/storage';

// Initialize Firebase services - only on client side
let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;
let isInitialized = false;

// Function to initialize Firebase
function initializeFirebase() {
  if (isInitialized || typeof window === 'undefined') return;

  try {
    // Get Firebase config from environment variables (only available on client)
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    // Only initialize if we have valid config
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
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

// Initialize Firebase only on client side with a delay to ensure env vars are loaded
if (typeof window !== 'undefined') {
  setTimeout(initializeFirebase, 100);
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
