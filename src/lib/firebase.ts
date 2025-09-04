import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth as getFirebaseAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage as getFirebaseStorage, connectStorageEmulator } from 'firebase/storage';

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
          app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    auth = getFirebaseAuth(app);
    storage = getFirebaseStorage(app);
      isInitialized = true;

      console.log('Firebase initialized successfully');
    } else {
      console.warn('Firebase config is missing or invalid');
      // Create dummy objects
      app = {};
      db = {};
      auth = {};
      storage = {};
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase:', error);
    // Create dummy objects for build time
    app = {};
    db = {};
    auth = {};
    storage = {};
  }
}

// Initialize Firebase immediately if we're in the browser
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Export Firebase services
export { db, auth, storage };

// Connect to emulators in development (optional)
// Uncomment this section if you want to use Firebase emulators
/*
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Check if we're running in development and in the browser
  const isEmulatorConnected = {
    firestore: false,
    auth: false,
    storage: false,
  };

  // Connect to Firestore emulator
  if (!isEmulatorConnected.firestore) {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      isEmulatorConnected.firestore = true;
      console.log('Connected to Firestore emulator');
    } catch (error) {
      console.log('Firestore emulator connection failed:', error);
    }
  }

  // Connect to Auth emulator
  if (!isEmulatorConnected.auth) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      isEmulatorConnected.auth = true;
      console.log('Connected to Auth emulator');
    } catch (error) {
      console.log('Auth emulator connection failed:', error);
    }
  }

  // Connect to Storage emulator
  if (!isEmulatorConnected.storage) {
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
      isEmulatorConnected.storage = true;
      console.log('Connected to Storage emulator');
    } catch (error) {
      console.log('Storage emulator connection failed:', error);
    }
  }
}
*/

// Function to get Firebase services (ensures initialization)
export async function getFirebaseServices() {
  if (!isInitialized && typeof window !== 'undefined') {
    await initializeFirebase();
  }
  return { db, auth, storage, app };
}

// SSR-safe auth getter
export function getAuth() {
  if (typeof window === 'undefined') {
    return null; // Return null during SSR
  }
  return auth;
}

// SSR-safe db getter
export function getDb() {
  if (typeof window === 'undefined') {
    return null; // Return null during SSR
  }
  return db;
}

// SSR-safe storage getter
export function getStorage() {
  if (typeof window === 'undefined') {
    return null; // Return null during SSR
  }
  return storage;
}

export default app;
