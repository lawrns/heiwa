import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Firebase Admin SDK configuration for server-side operations
let adminApp: App | null = null;

function initializeAdminFirebase() {
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK can only be used on the server side');
  }

  if (!adminApp) {
    // Check if we have service account credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
        };

    adminApp = getApps().length ? getApps()[0] : initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

  }

  const auth = getAdminAuth(adminApp);
  const db = getFirestore(adminApp);
  const storage = getStorage(adminApp);

  return { app: adminApp, auth, db, storage };
}

export const getAdminFirebase = () => {
  return initializeAdminFirebase();
};

export const adminAuth = (() => {
  try {
    return initializeAdminFirebase().auth;
  } catch {
    return null;
  }
})();

export const adminDb = (() => {
  try {
    return initializeAdminFirebase().db;
  } catch {
    return null;
  }
})();

export const adminStorage = (() => {
  try {
    return initializeAdminFirebase().storage;
  } catch {
    return null;
  }
})();

// Helper function to verify Firebase ID token on server
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth!.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid authentication token');
  }
}

// Helper function to check if user has admin claim
export async function checkAdminClaim(uid: string): Promise<boolean> {
  try {
    const user = await adminAuth!.getUser(uid);
    return user.customClaims?.admin === true;
  } catch (error) {
    console.error('Admin claim check failed:', error);
    return false;
  }
}

export default (() => {
  try {
    return initializeAdminFirebase().app;
  } catch {
    return null;
  }
})();
