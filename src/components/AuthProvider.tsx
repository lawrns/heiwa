'use client'

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth as getFirebaseAuth } from 'firebase/auth';
import { getAuth } from '@/lib/firebase';
import { AuthUser, firebaseUserToAuthUser, authAPI } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | undefined;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Check if we're in a build/static generation context BEFORE calling any hooks
  const isBuildTime = typeof window === 'undefined' &&
    (process.env.NODE_ENV === 'production' || !process.env.NEXT_RUNTIME);

  // If we're in build time, provide static context to prevent SSR errors
  if (isBuildTime) {
    const buildTimeValue: AuthContextType = {
      user: null,
      loading: false,
      error: undefined,
      signOut: async () => {},
    };
    return (
      <AuthContext.Provider value={buildTimeValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Always call hooks at the top level (Rules of Hooks) - only after build-time check
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Use useMemo to create a stable auth instance
  const firebaseAuth = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      return getFirebaseAuth();
    } catch (error) {
      console.warn('Failed to get Firebase auth:', error);
      return null;
    }
  }, []);

  // Always call useAuthState hook (never conditionally)
  const [firebaseUser, loading, error] = useAuthState(firebaseAuth as any);

  // Initialize client state
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (firebaseUser && firebaseAuth) {
      const authUser = firebaseUserToAuthUser(firebaseUser);
      setUser(authUser);

      // Set authentication cookie for middleware
      const setAuthCookie = async () => {
        try {
          const token = await firebaseUser.getIdToken();
          if (token && typeof document !== 'undefined') {
            // Set cookie that middleware can read
            document.cookie = `firebase-token=${token}; path=/; max-age=3600; secure; samesite=strict`;
          }
        } catch (error) {
          console.error('Failed to set auth cookie:', error);
        }
      };

      setAuthCookie();

      // Set up token refresh to handle session expiry
      const checkTokenExpiry = async () => {
        try {
          const token = await firebaseUser.getIdToken(true); // Force refresh
          if (token && typeof document !== 'undefined') {
            // Update cookie with new token
            document.cookie = `firebase-token=${token}; path=/; max-age=3600; secure; samesite=strict`;
          } else {
            await authAPI.handleSessionExpiry();
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          await authAPI.handleSessionExpiry();
        }
      };

      // Check token every 30 minutes
      const interval = setInterval(checkTokenExpiry, 30 * 60 * 1000);

      return () => clearInterval(interval);
    } else {
      setUser(null);
      // Clear auth cookie when user logs out
      if (typeof document !== 'undefined') {
        document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  }, [firebaseUser, firebaseAuth]);

  const signOut = async () => {
    // Clear auth cookie before signing out
    if (typeof document !== 'undefined') {
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    if (firebaseAuth) {
      await firebaseAuth.signOut();
    }
  };

  // Always provide consistent context value to prevent SSR hydration issues
  const value: AuthContextType = {
    user: user,
    loading: !isClient || loading || !firebaseAuth,
    error: error,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for checking if user is admin
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.isAdmin || false;
}
