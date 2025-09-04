import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if we have valid Firebase config
const hasValidConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
                      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Initialize Firebase only if we have valid config
let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Failed to initialize Firebase:', error);
    // Create dummy objects for build time
    app = {};
    db = {};
    auth = {};
    storage = {};
  }
} else {
  console.warn('Firebase config is missing or invalid - using dummy objects for build');
  // Create dummy objects for build time when config is missing
  app = {};
  db = {};
  auth = {};
  storage = {};
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

// Debug Firebase configuration
console.log('Firebase Config Status:', {
  hasValidConfig,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Missing',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Missing',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'Missing',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Missing',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? 'Set' : 'Missing',
});

export default app;
