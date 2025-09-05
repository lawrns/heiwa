import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Lazy initialization - only create when needed
let app: any = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: any = null;
let isInitialized = false;

function initializeFirebase() {
  if (isInitialized || typeof window === 'undefined') return;

  try {
    if (!app) {
      app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    }
    if (!auth) {
      auth = getAuth(app);
    }
    if (!db) {
      db = getFirestore(app);
    }
    if (!storage) {
      storage = getStorage(app);
    }
    isInitialized = true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// SSR-safe getters - only initialize on client side
export function getAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  if (!isInitialized) initializeFirebase();
  return auth;
}

export function getDb(): Firestore | null {
  if (typeof window === 'undefined') return null;
  if (!isInitialized) initializeFirebase();
  return db;
}

export function getStorage() {
  if (typeof window === 'undefined') return null;
  if (!isInitialized) initializeFirebase();
  return storage;
}

// Direct exports for client-side use (will be null during SSR)
export { auth, db, storage };
export default app;
