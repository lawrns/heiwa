import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Firebase Admin configuration for server-side operations
const firebaseAdminConfig = {
  projectId: 'heiwahousedashboard',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

// Initialize Firebase Admin (server-side only)
let adminApp: any = null
let adminDb: any = null
let adminAuth: any = null

function initializeFirebaseAdmin() {
  if (adminApp) return adminApp

  try {
    // For server-side operations, use Firebase Admin SDK
    adminApp = initializeApp({
      credential: cert(firebaseAdminConfig),
      projectId: 'heiwahousedashboard'
    })

    adminDb = getFirestore(adminApp)
    adminAuth = getAuth(adminApp)

    console.log('Firebase Admin initialized successfully')
    return adminApp
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error)
    throw error
  }
}

// Export server-side Firebase services
export function getAdminDb() {
  if (!adminDb) {
    initializeFirebaseAdmin()
  }
  return adminDb
}

export function getAdminAuth() {
  if (!adminAuth) {
    initializeFirebaseAdmin()
  }
  return adminAuth
}

export { adminApp }

