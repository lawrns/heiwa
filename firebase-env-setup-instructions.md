# Firebase Authentication Environment Setup Instructions

## Context
You are working with a Next.js 15 application that has Firebase authentication issues. The app is currently failing with `TypeError: Cannot read properties of undefined (reading 'currentUser')` because Firebase is not properly initialized.

## Root Causes Identified
1. **Hardcoded Firebase config** instead of environment variables
2. **SSR access to Firebase auth** during server-side rendering
3. **Lazy loading with setTimeout** not being reliable
4. **Missing NEXT_PUBLIC_ prefixes** for client-side environment variables

## Step-by-Step Fix Instructions

### 1. Create Environment Variables File

Create `.env.local` in the project root with these exact values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDQTtlEowOBdeDj-StcrlnscogXpmy52x4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=heiwahousedashboard.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=heiwahousedashboard
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=heiwahousedashboard.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=221240912006
NEXT_PUBLIC_FIREBASE_APP_ID=1:221240912006:web:1c7a974b44c5361519c907
```

**Important Notes:**
- Use `NEXT_PUBLIC_` prefix for all Firebase config variables
- These values are for the `heiwahousedashboard` Firebase project
- The file should be in the project root directory
- Never commit this file to version control

### 2. Fix Firebase Configuration (src/lib/firebase.ts)

Replace the entire file with this singleton pattern:

```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

**Key Changes:**
- Removed all hardcoded fallbacks
- Removed `setTimeout` lazy loading
- Implemented singleton pattern with `getApps().length ? getApp() : initializeApp()`
- Export `auth` directly from the singleton

### 3. Fix AuthProvider Component (src/components/AuthProvider.tsx)

Replace the entire component with this simplified version:

```typescript
"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return <>{children}</>;
}
```

**Key Changes:**
- Removed `useAuthState` hook (which was causing the error)
- Used `onAuthStateChanged` directly from Firebase
- Removed SSR-safe guards (not needed with proper env vars)
- Simplified to client-only component

### 4. Update Layout to Use New AuthProvider

In `src/app/layout.tsx`, ensure the AuthProvider is properly imported and used:

```typescript
import AuthProvider from '@/components/AuthProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 5. Verification Steps

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check Firebase initialization:**
   - Open browser console
   - Look for Firebase auth object (should not be undefined)
   - No more "Cannot read properties of undefined" errors

3. **Test routes:**
   ```bash
   curl -s http://localhost:3000/admin | grep -o '<title>[^<]*'
   curl -s http://localhost:3000/api/health
   ```

4. **Expected results:**
   - All routes should return 200 status codes
   - No more 500 errors
   - Firebase auth should be properly initialized

### 6. Common Issues and Solutions

**Issue: Environment variables not loading**
- Solution: Ensure `.env.local` is in project root
- Check: `console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)` in browser

**Issue: Firebase still undefined**
- Solution: Check if environment variables have `NEXT_PUBLIC_` prefix
- Check: All Firebase config variables must have this prefix

**Issue: SSR errors still occurring**
- Solution: Ensure AuthProvider is marked with `"use client"`
- Check: Component should only run on client-side

### 7. Deployment Considerations

**For Vercel/Netlify deployment:**
1. Set environment variables in hosting platform dashboard
2. Use the same variable names without `NEXT_PUBLIC_` prefix in deployment
3. Ensure all Firebase config values are set in production environment

**For local development:**
1. Keep `.env.local` in project root
2. Never commit `.env.local` to version control
3. Use `.env.example` for documentation of required variables

### 8. Testing Checklist

- [ ] Server starts without Firebase errors
- [ ] `/admin` route loads (200 status)
- [ ] `/admin/login` route loads (200 status)
- [ ] `/api/health` returns 200
- [ ] Browser console shows no Firebase errors
- [ ] Firebase auth object is defined in console

### 9. Rollback Plan

If issues persist:
1. Check environment variables are properly loaded
2. Verify Firebase project configuration matches
3. Ensure all components using Firebase are client-side
4. Check for any remaining hardcoded Firebase configs

### 10. Success Criteria

✅ **Application starts without Firebase errors**
✅ **All routes return 200 status codes**
✅ **Firebase auth is properly initialized**
✅ **No more "Cannot read properties of undefined" errors**
✅ **Authentication flow works correctly**

## Files Modified in This Fix

1. `.env.local` (created)
2. `src/lib/firebase.ts` (completely rewritten)
3. `src/components/AuthProvider.tsx` (completely rewritten)
4. `src/app/layout.tsx` (AuthProvider import/usage)

## Expected Outcome

After following these instructions, the Next.js application should start without Firebase authentication errors, and all routes should be accessible and functional.
