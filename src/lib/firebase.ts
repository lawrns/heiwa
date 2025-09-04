import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth as getFirebaseAuth } from 'firebase/auth';
import { getStorage as getFirebaseStorage } from 'firebase/storage';

// Firebase configuration using real environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase services
let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;
let isInitialized = false;

// Function to initialize Firebase
function initializeFirebase() {
  if (isInitialized || typeof window === 'undefined') return;

  try {
    // Check if we have valid Firebase configuration
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

      console.log('Firebase initialized successfully with real credentials');
    } else {
      console.warn('Firebase config is missing - using demo mode');
      // Set dummy values for development/demo
      app = {};
      db = {};
      auth = {};
      storage = {};
      isInitialized = true;
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase:', error);
    // Set dummy values on error
    app = {};
    db = {};
    auth = {};
    storage = {};
    isInitialized = true;
  }
}

// Initialize Firebase immediately if we're in the browser
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Export Firebase services (may be null during SSR)
export { db, auth, storage };

// SSR-safe getters
export function getAuth() {
  // Always try to initialize if not already done
  if (typeof window !== 'undefined' && !auth) {
    initializeFirebase();
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
