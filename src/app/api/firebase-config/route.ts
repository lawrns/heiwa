import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get Firebase config from environment variables with real credentials as priority
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Validate that we have the essential configuration
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    // Return demo values if real config is not available
    const demoConfig = {
      apiKey: 'demo-api-key',
      authDomain: 'demo-project.firebaseapp.com',
      projectId: 'demo-project',
      storageBucket: 'demo-project.firebasestorage.app',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:demo',
      measurementId: 'G-DEMOMEASURE',
    };
    console.warn('Using demo Firebase configuration - set real environment variables for production');
    return NextResponse.json(demoConfig);
  }

  // Return real Firebase configuration
  return NextResponse.json(firebaseConfig);
}
